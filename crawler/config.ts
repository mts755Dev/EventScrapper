const onVercel = Boolean(process.env.VERCEL);

function batchSizeFromEnv(): number {
  const raw = process.env.CRAWL_BATCH_SIZE;
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  // Vercel Hobby maxDuration is 300s — keep batches small enough to finish.
  return onVercel ? 6 : 100;
}

/**
 * Crawler runtime config.
 * Tuned for serverless: short timeouts, low concurrency, polite delays.
 */
export const CRAWLER_CONFIG = {
  userAgent:
    "EventScrapper/0.1 (+internal; contact: sales-ops; respectful crawler)",
  /** Max concurrent site crawls within one job */
  concurrency: onVercel ? 2 : 3,
  /**
   * Max active sources per cron invocation.
   * Remaining sources are picked up on later runs (oldest last_crawled_at first).
   */
  maxSourcesPerRun: batchSizeFromEnv(),
  /** Per-request timeout (ms) */
  fetchTimeoutMs: 15_000,
  /** Playwright navigation timeout (ms) */
  playwrightTimeoutMs: 20_000,
  /** Delay between sites to be polite (ms) */
  delayBetweenSitesMs: onVercel ? 200 : 400,
  /** Max HTML size to keep in memory (bytes) */
  maxHtmlBytes: 2_000_000,
  /** Cheerio → Playwright fallback: min HTML length to treat as empty/SPA */
  minUsefulHtmlLength: 800,
  /** Keywords that suggest the static HTML already has event content */
  eventContentHints: [
    "event",
    "calendar",
    "schedule",
    "ticket",
    "venue",
    "schema.org/event",
    "application/ld+json",
  ],
  /** Max follow-up calendar links discovered per page */
  maxDiscoveredLinks: 8,
  /** Max RSS feeds to follow per page */
  maxFeedFollows: 2,
  /** Max new sources to register per crawled page */
  maxSourcesPromotedPerPage: 6,
  /** Max candidate URLs to probe in one discovery run */
  maxDiscoveryProbes: 80,
  /** Concurrent probes during discovery */
  discoveryConcurrency: 4,
  /** Delay between discovery probes (ms) */
  discoveryDelayMs: 300,
  /**
   * Max attempts per source when crawl fails (initial + retries).
   * Transient network / timeout errors get retried before logging as error.
   */
  maxSiteAttempts: 3,
  /** Base delay before retry (ms); doubles each attempt */
  siteRetryDelayMs: 800,
} as const;

export function getTargetStates(): string[] {
  const raw = process.env.TARGET_STATES ?? "NC,FL";
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
