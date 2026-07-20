import { CRAWLER_CONFIG } from "@/crawler/config";
import { getHostname, normalizeUrl } from "@/utils/url";
import type { DiscoveredSourceInput } from "@/services/sources";

const BLOCKED_HOST_FRAGMENTS = [
  "google.",
  "facebook.",
  "twitter.",
  "x.com",
  "instagram.",
  "linkedin.",
  "youtube.",
  "youtu.be",
  "tiktok.",
  "apple.com",
  "play.google",
  "doubleclick.",
  "googletagmanager.",
];

const PREFERRED_PATH_HINTS = [
  "/event",
  "/calendar",
  "/schedule",
  "/athletics",
  "/upcoming",
];

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => host.includes(fragment));
}

function inferSourceType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("rss") || lower.includes("atom") || lower.endsWith(".xml")) {
    return "rss";
  }
  if (lower.includes("athletics") || lower.includes("sports")) {
    return "athletics";
  }
  if (lower.includes("news") || lower.includes("press")) {
    return "news";
  }
  return "calendar";
}

/**
 * Turn crawled page links into candidate `sources` rows.
 * Prefers same-host calendar paths; allows .gov / .edu / .org cross-host.
 */
export function linksToSourceCandidates(input: {
  links: string[];
  pageUrl: string;
  state?: string | null;
  pageTitle?: string | null;
  max?: number;
}): DiscoveredSourceInput[] {
  const pageHost = getHostname(input.pageUrl);
  const max = input.max ?? CRAWLER_CONFIG.maxSourcesPromotedPerPage;
  const candidates: DiscoveredSourceInput[] = [];
  const seen = new Set<string>();

  for (const raw of input.links) {
    if (candidates.length >= max) break;

    const url = normalizeUrl(raw);
    if (!url || seen.has(url)) continue;

    const host = getHostname(url);
    if (!host || isBlockedHost(host)) continue;

    const sameHost = pageHost && host === pageHost;
    const publicHost =
      host.endsWith(".gov") ||
      host.endsWith(".edu") ||
      host.endsWith(".org");

    if (!sameHost && !publicHost) continue;

    const path = (() => {
      try {
        return new URL(url).pathname.toLowerCase();
      } catch {
        return "";
      }
    })();

    const pathLooksUseful = PREFERRED_PATH_HINTS.some((hint) =>
      path.includes(hint)
    );
    if (!sameHost && !pathLooksUseful) continue;

    seen.add(url);
    const labelBase = input.pageTitle?.slice(0, 80) || host;
    candidates.push({
      name: `${labelBase} · ${path || "events"}`.slice(0, 200),
      url,
      type: inferSourceType(url),
      state: input.state ?? null,
    });
  }

  return candidates;
}
