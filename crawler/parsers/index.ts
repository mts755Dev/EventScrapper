import * as cheerio from "cheerio";
import {
  enrichEvents,
  mergeAndDedupeEvents,
} from "@/crawler/extractors/enrich";
import { extractCalendarListEvents } from "@/crawler/parsers/calendar-lists";
import { extractJsonLdEvents } from "@/crawler/parsers/json-ld";
import { extractMicrodataEvents } from "@/crawler/parsers/microdata";
import {
  extractRssEvents,
  findFeedLinks,
  isFeedContent,
} from "@/crawler/parsers/rss";
import { extractTableEvents } from "@/crawler/parsers/tables";
import { extractTimeTagEvents } from "@/crawler/parsers/time-tags";
import type { RawEvent } from "@/types/crawler";

export type ParseOptions = {
  contentType?: string;
  fallbackState?: string | null;
};

/**
 * Run all extractors and merge.
 * Order does not matter for coverage — enrich + dedupe normalize the result.
 */
export function parseEvents(
  htmlOrXml: string,
  pageUrl: string,
  options: ParseOptions = {}
): RawEvent[] {
  const contentType = options.contentType ?? "text/html";

  if (isFeedContent(contentType, htmlOrXml)) {
    return enrichEvents(
      extractRssEvents(htmlOrXml, pageUrl),
      options.fallbackState
    );
  }

  const $ = cheerio.load(htmlOrXml);

  const merged = mergeAndDedupeEvents([
    extractJsonLdEvents($, pageUrl),
    extractMicrodataEvents($, pageUrl),
    extractTimeTagEvents($, pageUrl),
    extractCalendarListEvents($, pageUrl),
    extractTableEvents($, pageUrl),
  ]);

  return enrichEvents(merged, options.fallbackState);
}

/** Discover RSS/Atom feed URLs embedded in an HTML page */
export function discoverFeedUrls(html: string, pageUrl: string): string[] {
  const $ = cheerio.load(html);
  return findFeedLinks($, pageUrl);
}

export { extractRssEvents, isFeedContent };
