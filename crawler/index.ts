import { CRAWLER_CONFIG, getTargetStates } from "@/crawler/config";
import {
  discoverEventLinks,
  discoverOrganizationName,
} from "@/crawler/discovery/links";
import { linksToSourceCandidates } from "@/crawler/discovery/promote";
import { mergeAndDedupeEvents } from "@/crawler/extractors/enrich";
import { fetchPage } from "@/crawler/fetchers";
import { closeBrowser } from "@/crawler/fetchers/playwright";
import { crawlLogger } from "@/crawler/logger";
import { discoverFeedUrls, parseEvents } from "@/crawler/parsers";
import {
  createCrawlJob,
  finishCrawlJob,
  getActiveSources,
  insertCrawlLog,
  touchSourceCrawled,
} from "@/services/crawl";
import { upsertEvents } from "@/services/events";
import { upsertOrganization } from "@/services/organizations";
import { upsertDiscoveredSources } from "@/services/sources";
import { normalizeUrl } from "@/utils/url";
import type { CrawlError } from "@/types/database";
import type { CrawlSiteResult, RawEvent } from "@/types/crawler";

export type CrawlRunResult = {
  jobId: string;
  status: "completed" | "failed";
  totalSites: number;
  totalEvents: number;
  batchSize: number;
  errors: CrawlError[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await worker(items[current], current);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run()
  );
  await Promise.all(runners);
  return results;
}

async function crawlSite(input: {
  url: string;
  state: string | null;
  sourceType: string;
  sourceName: string;
}): Promise<CrawlSiteResult> {
  const website = normalizeUrl(input.url) ?? input.url;

  try {
    const page = await fetchPage(website, "auto");
    const parseOpts = {
      contentType: page.contentType,
      fallbackState: input.state,
    };

    const collected: RawEvent[] = [
      ...parseEvents(page.html, page.url, parseOpts),
    ];

    const orgName = discoverOrganizationName(page.html);
    const discoveredLinks = discoverEventLinks(page.html, page.url);
    const feedLinks = discoverFeedUrls(page.html, page.url);

    // Follow calendar/event links for coverage
    for (const link of discoveredLinks.slice(0, 3)) {
      try {
        const child = await fetchPage(link, "cheerio");
        collected.push(
          ...parseEvents(child.html, child.url, {
            contentType: child.contentType,
            fallbackState: input.state,
          })
        );
      } catch (error) {
        crawlLogger.debug("discovered_link_failed", {
          link,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Follow RSS/Atom feeds when present
    for (const feed of feedLinks.slice(0, CRAWLER_CONFIG.maxFeedFollows)) {
      try {
        const child = await fetchPage(feed, "cheerio");
        collected.push(
          ...parseEvents(child.html, child.url, {
            contentType: child.contentType ?? "application/rss+xml",
            fallbackState: input.state,
          })
        );
      } catch (error) {
        crawlLogger.debug("feed_follow_failed", {
          feed,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const events = mergeAndDedupeEvents([collected]);

    const organizations = orgName
      ? [
          {
            name: orgName,
            website,
            state: input.state ?? undefined,
            category: "other",
            source: input.sourceType,
          },
        ]
      : [];

    const sourceCandidates = linksToSourceCandidates({
      links: [...discoveredLinks, ...feedLinks],
      pageUrl: page.url,
      state: input.state,
      pageTitle: orgName ?? input.sourceName,
    });

    return {
      website,
      status: "success",
      message: `fetcher=${page.fetcher}; events=${events.length}; links=${discoveredLinks.length}; feeds=${feedLinks.length}; promote=${sourceCandidates.length}; source=${input.sourceName}`,
      events_found: events.length,
      events,
      organizations,
      source_candidates: sourceCandidates,
    };
  } catch (error) {
    return {
      website,
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      events_found: 0,
      events: [],
      organizations: [],
    };
  }
}

/**
 * Main crawl orchestrator.
 * Creates a crawl_job, processes active sources, persists results, finalizes.
 */
export async function runCrawl(options?: {
  sourceIds?: string[];
}): Promise<CrawlRunResult> {
  const states = getTargetStates();
  const job = await createCrawlJob();
  const errors: CrawlError[] = [];
  let totalEvents = 0;
  let totalSites = 0;

  crawlLogger.info("crawl_started", { jobId: job.id, states });

  try {
    let sources = await getActiveSources(states, {
      // Explicit sourceIds = full list for those ids; otherwise rotate a batch.
      limit: options?.sourceIds?.length
        ? undefined
        : CRAWLER_CONFIG.maxSourcesPerRun,
    });

    if (options?.sourceIds?.length) {
      const allow = new Set(options.sourceIds);
      sources = sources.filter((s) => allow.has(s.id));
    }

    crawlLogger.info("crawl_batch_selected", {
      jobId: job.id,
      batchSize: sources.length,
      maxPerRun: CRAWLER_CONFIG.maxSourcesPerRun,
    });

    if (sources.length === 0) {
      crawlLogger.warn("crawl_no_active_sources", { jobId: job.id });
      await finishCrawlJob(job.id, {
        status: "completed",
        total_sites: 0,
        total_events: 0,
        errors: [],
      });
      return {
        jobId: job.id,
        status: "completed",
        totalSites: 0,
        totalEvents: 0,
        batchSize: 0,
        errors: [],
      };
    }

    await mapPool(sources, CRAWLER_CONFIG.concurrency, async (source) => {
      totalSites += 1;
      crawlLogger.info("crawl_site_start", {
        jobId: job.id,
        source: source.name,
        url: source.url,
      });

      const result = await crawlSite({
        url: source.url,
        state: source.state,
        sourceType: source.type,
        sourceName: source.name,
      });

      let eventsPersisted = 0;

      if (result.status === "success") {
        let organizationId: string | null = null;

        for (const org of result.organizations) {
          if (!org.state && source.state) org.state = source.state;
          if (!org.state) continue;
          const saved = await upsertOrganization({
            ...org,
            state: org.state,
          });
          if (saved) organizationId = saved.id;
        }

        const { created, updated } = await upsertEvents(
          result.events,
          organizationId,
          source.state
        );
        eventsPersisted = created + updated;
        totalEvents += eventsPersisted;

        if (result.source_candidates?.length) {
          const promoted = await upsertDiscoveredSources(
            result.source_candidates
          );
          crawlLogger.info("sources_promoted", {
            jobId: job.id,
            website: result.website,
            ...promoted,
          });
        }

        crawlLogger.info("crawl_site_success", {
          jobId: job.id,
          website: result.website,
          created,
          updated,
        });
      } else {
        errors.push({
          site: result.website,
          message: result.message ?? "Unknown error",
        });
        crawlLogger.error("crawl_site_error", {
          jobId: job.id,
          website: result.website,
          message: result.message,
        });
      }

      await touchSourceCrawled(source.id);

      await insertCrawlLog({
        crawl_job_id: job.id,
        website: result.website,
        status: result.status,
        message: result.message,
        events_found: eventsPersisted || result.events_found,
      });

      await sleep(CRAWLER_CONFIG.delayBetweenSitesMs);
    });

    const status = errors.length === sources.length ? "failed" : "completed";
    await finishCrawlJob(job.id, {
      status,
      total_sites: totalSites,
      total_events: totalEvents,
      errors,
    });

    crawlLogger.info("crawl_finished", {
      jobId: job.id,
      status,
      totalSites,
      totalEvents,
      errorCount: errors.length,
    });

    return {
      jobId: job.id,
      status,
      totalSites,
      totalEvents,
      batchSize: sources.length,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ site: "orchestrator", message });
    await finishCrawlJob(job.id, {
      status: "failed",
      total_sites: totalSites,
      total_events: totalEvents,
      errors,
    });
    crawlLogger.error("crawl_failed", { jobId: job.id, message });
    return {
      jobId: job.id,
      status: "failed",
      totalSites,
      totalEvents,
      batchSize: totalSites,
      errors,
    };
  } finally {
    await closeBrowser();
  }
}
