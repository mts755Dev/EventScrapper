/**
 * Crawler runtime config.
 * Tuned for serverless: short timeouts, low concurrency, polite delays.
 */
export const CRAWLER_CONFIG = {
  userAgent:
    "EventScrapper/0.1 (+internal; contact: sales-ops; respectful crawler)",
  /** Max concurrent site crawls within one job */
  concurrency: 3,
  /** Per-request timeout (ms) */
  fetchTimeoutMs: 20_000,
  /** Playwright navigation timeout (ms) */
  playwrightTimeoutMs: 25_000,
  /** Delay between sites to be polite (ms) */
  delayBetweenSitesMs: 400,
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
} as const;

export function getTargetStates(): string[] {
  const raw = process.env.TARGET_STATES ?? "NC,FL";
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
