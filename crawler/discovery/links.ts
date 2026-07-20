import * as cheerio from "cheerio";
import { CRAWLER_CONFIG } from "@/crawler/config";
import { absoluteUrl } from "@/utils/url";

const CALENDAR_LINK_HINTS = [
  "event",
  "events",
  "calendar",
  "schedule",
  "athletics",
  "tickets",
  "upcoming",
  "community",
];

/**
 * Discover likely event/calendar URLs from a page.
 * Coverage-first: keep broad keyword matches, cap quantity.
 */
export function discoverEventLinks(
  html: string,
  pageUrl: string
): string[] {
  const $ = cheerio.load(html);
  const found = new Set<string>();

  $("a[href]").each((_, el) => {
    if (found.size >= CRAWLER_CONFIG.maxDiscoveredLinks) return false;

    const href = $(el).attr("href");
    if (!href) return;

    const absolute = absoluteUrl(href, pageUrl);
    if (!absolute) return;
    if (absolute === pageUrl) return;

    const haystack = `${absolute} ${$(el).text()}`.toLowerCase();
    const matches = CALENDAR_LINK_HINTS.some((hint) => haystack.includes(hint));
    if (matches) {
      found.add(absolute);
    }
  });

  return [...found];
}

/**
 * Lightweight org signal from page title / og:site_name.
 * Full org discovery expands in later phases.
 */
export function discoverOrganizationName(html: string): string | null {
  const $ = cheerio.load(html);
  const og =
    $('meta[property="og:site_name"]').attr("content")?.trim() ||
    $('meta[property="og:title"]').attr("content")?.trim();
  if (og) return og.slice(0, 200);

  const title = $("title").first().text().trim();
  if (!title) return null;

  const cleaned = title.split(/[|\-–—]/)[0]?.trim();
  return cleaned ? cleaned.slice(0, 200) : null;
}
