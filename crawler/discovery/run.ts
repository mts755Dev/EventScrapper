import { CRAWLER_CONFIG, getTargetStates } from "@/crawler/config";
import { crawlLogger } from "@/crawler/logger";
import { fetchWithCheerio } from "@/crawler/fetchers/cheerio";
import {
  CALENDAR_PATHS,
  DISCOVERY_ORIGINS,
} from "@/lib/constants/discovery-seeds";
import {
  listAllSourceUrls,
  listOrganizationWebsites,
  upsertDiscoveredSources,
  type DiscoveredSourceInput,
} from "@/services/sources";
import { normalizeUrl } from "@/utils/url";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeEventPage(html: string): boolean {
  if (html.length < CRAWLER_CONFIG.minUsefulHtmlLength) return false;
  const lower = html.toLowerCase();
  return CRAWLER_CONFIG.eventContentHints.some((hint) =>
    lower.includes(hint)
  );
}

function buildCandidatesFromOrigin(
  name: string,
  state: string,
  origin: string
): DiscoveredSourceInput[] {
  const base = origin.replace(/\/$/, "");
  return CALENDAR_PATHS.map((path) => ({
    name: `${name} · ${path}`,
    url: `${base}${path}`,
    type: "calendar",
    state,
  }));
}

function originFromWebsite(website: string): string | null {
  try {
    const url = new URL(website);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/**
 * Free automatic source discovery:
 * 1) Probe known NC/FL city & athletics origins for calendar paths
 * 2) Probe existing organization websites for calendar paths
 * Only inserts URLs that respond with event-like HTML.
 */
export async function runSourceDiscovery(): Promise<{
  probed: number;
  inserted: number;
  skipped: number;
  failed: number;
}> {
  const states = new Set(getTargetStates());
  const existing = await listAllSourceUrls();
  const queue: DiscoveredSourceInput[] = [];

  for (const seed of DISCOVERY_ORIGINS) {
    if (!states.has(seed.state)) continue;
    queue.push(
      ...buildCandidatesFromOrigin(seed.name, seed.state, seed.origin)
    );
  }

  try {
    const orgs = await listOrganizationWebsites(60);
    for (const org of orgs) {
      if (!states.has(org.state)) continue;
      const origin = originFromWebsite(org.website);
      if (!origin) continue;
      queue.push(...buildCandidatesFromOrigin(org.name, org.state, origin));
    }
  } catch (error) {
    crawlLogger.warn("discovery_org_websites_skipped", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Deduplicate against DB + within queue
  const unique: DiscoveredSourceInput[] = [];
  const seen = new Set<string>();
  for (const item of queue) {
    const url = normalizeUrl(item.url);
    if (!url || seen.has(url) || existing.has(url)) continue;
    seen.add(url);
    unique.push({ ...item, url });
  }

  const toProbe = unique.slice(0, CRAWLER_CONFIG.maxDiscoveryProbes);
  crawlLogger.info("source_discovery_start", {
    queued: unique.length,
    probing: toProbe.length,
  });

  const accepted: DiscoveredSourceInput[] = [];
  let failed = 0;
  let nextIndex = 0;

  async function worker() {
    for (;;) {
      const current = nextIndex++;
      if (current >= toProbe.length) break;
      const candidate = toProbe[current];
      if (!candidate?.url) {
        failed += 1;
        continue;
      }
      try {
        const page = await fetchWithCheerio(candidate.url);
        if (
          page.status >= 200 &&
          page.status < 400 &&
          looksLikeEventPage(page.html)
        ) {
          accepted.push({
            ...candidate,
            url: normalizeUrl(page.url) ?? candidate.url,
            name: candidate.name.slice(0, 200),
          });
        }
      } catch {
        failed += 1;
      }
      await sleep(CRAWLER_CONFIG.discoveryDelayMs);
    }
  }

  if (toProbe.length > 0) {
    await Promise.all(
      Array.from(
        {
          length: Math.min(
            CRAWLER_CONFIG.discoveryConcurrency,
            toProbe.length
          ),
        },
        () => worker()
      )
    );
  }

  const { inserted, skipped } = await upsertDiscoveredSources(accepted);

  crawlLogger.info("source_discovery_finished", {
    probed: toProbe.length,
    accepted: accepted.length,
    inserted,
    skipped,
    failed,
  });

  return {
    probed: toProbe.length,
    inserted,
    skipped,
    failed,
  };
}
