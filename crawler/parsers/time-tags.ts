import type { CheerioAPI } from "cheerio";
import { extractFirstDate, toIsoDate } from "@/utils/dates";
import { absoluteUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

/**
 * Pair <time datetime> elements with nearby headings / links.
 * Coverage-first: keep events even when title is imperfect.
 */
export function extractTimeTagEvents(
  $: CheerioAPI,
  pageUrl: string
): RawEvent[] {
  const events: RawEvent[] = [];

  $("time[datetime]").each((_, el) => {
    const datetime = $(el).attr("datetime")?.trim();
    if (!datetime) return;
    const start = toIsoDate(datetime);
    if (!start) return;

    const parent = $(el).closest(
      "article, li, tr, .event, .card, .listing, section, div"
    );
    const scope = parent.length ? parent : $(el).parent();

    let title =
      scope.find("h1, h2, h3, h4, a").first().text().replace(/\s+/g, " ").trim() ||
      $(el).attr("title")?.trim() ||
      $(el).text().replace(/\s+/g, " ").trim();

    // Avoid using the raw date string as a title
    if (!title || toIsoDate(title) || title.length < 4) {
      title =
        scope.find("[class*='title'], [class*='name']").first().text().trim() ||
        title;
    }
    if (!title || title.length < 4) return;
    if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(title) && title.length < 20) {
      return;
    }

    const href = scope.find("a[href]").first().attr("href");
    const venue = scope
      .find("[class*='venue'], [class*='location'], address")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    events.push({
      title: title.slice(0, 500),
      start_date: start,
      venue: venue || undefined,
      source_url: href ? absoluteUrl(href, pageUrl) ?? pageUrl : pageUrl,
    });
  });

  // Also catch time elements without datetime but with parseable text
  $("time:not([datetime])").each((_, el) => {
    const text = $(el).text().trim();
    const start = toIsoDate(text) || extractFirstDate(text);
    if (!start) return;

    const parent = $(el).closest("article, li, tr, .event, .card, div");
    const title = parent
      .find("h1, h2, h3, h4, a")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    if (!title || title.length < 4) return;

    events.push({
      title: title.slice(0, 500),
      start_date: start,
      source_url: pageUrl,
    });
  });

  return events;
}
