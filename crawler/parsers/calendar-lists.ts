import type { CheerioAPI } from "cheerio";
import { extractFirstDate } from "@/utils/dates";
import { absoluteUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

const EVENT_CONTAINER_SELECTORS = [
  "[class*='event']",
  "[class*='calendar']",
  "[id*='event']",
  "[id*='calendar']",
  "article",
  "li",
].join(", ");

/**
 * Generic calendar/list card extraction.
 * Looks for blocks that mention event-ish classes and contain a date + title.
 */
export function extractCalendarListEvents(
  $: CheerioAPI,
  pageUrl: string
): RawEvent[] {
  const events: RawEvent[] = [];
  const seen = new Set<string>();

  $(EVENT_CONTAINER_SELECTORS).each((_, el) => {
    if (events.length >= 80) return false;

    const block = $(el);
    // Skip huge containers (whole page wrappers)
    const text = block.text().replace(/\s+/g, " ").trim();
    if (text.length < 10 || text.length > 1200) return;

    const title =
      block.find("h1, h2, h3, h4, h5, .title, [class*='title'], a").first()
        .text()
        .replace(/\s+/g, " ")
        .trim() || text.slice(0, 120);

    if (!title || title.length < 4) return;

    const start =
      block.find("time[datetime]").attr("datetime") ||
      extractFirstDate(text) ||
      extractFirstDate(block.find("time, .date, [class*='date']").text());

    if (!start) return;

    const key = `${title.toLowerCase()}|${start.slice(0, 10)}`;
    if (seen.has(key)) return;
    seen.add(key);

    const href = block.find("a[href]").first().attr("href");
    const venue = block
      .find("[class*='venue'], [class*='location'], address")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    events.push({
      title: title.slice(0, 500),
      description: text.length > title.length ? text.slice(0, 1000) : undefined,
      start_date: start,
      venue: venue || undefined,
      source_url: href ? absoluteUrl(href, pageUrl) ?? pageUrl : pageUrl,
    });
  });

  return events;
}
