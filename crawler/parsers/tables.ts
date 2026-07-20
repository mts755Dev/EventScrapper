import type { CheerioAPI } from "cheerio";
import { extractFirstDate, toIsoDate } from "@/utils/dates";
import { absoluteUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

/**
 * Table rows that look like schedules (date + event name columns).
 */
export function extractTableEvents(
  $: CheerioAPI,
  pageUrl: string
): RawEvent[] {
  const events: RawEvent[] = [];

  $("table").each((_, table) => {
    const rows = $(table).find("tr");
    if (rows.length < 2 || rows.length > 200) return;

    rows.each((index, row) => {
      if (index === 0) return; // skip header heuristically
      const cells = $(row)
        .find("th, td")
        .toArray()
        .map((cell) => $(cell).text().replace(/\s+/g, " ").trim())
        .filter(Boolean);

      if (cells.length < 2) return;

      const joined = cells.join(" | ");
      const start =
        extractFirstDate(joined) ||
        cells.map((c) => toIsoDate(c)).find(Boolean);

      if (!start) return;

      // Prefer the longest non-date cell as title
      const title =
        cells
          .filter((c) => !toIsoDate(c) && !/^\d{1,2}[\/\-]\d{1,2}/.test(c))
          .sort((a, b) => b.length - a.length)[0] || cells[1];

      if (!title || title.length < 3) return;

      const href = $(row).find("a[href]").first().attr("href");

      events.push({
        title: title.slice(0, 500),
        start_date: start,
        venue: cells.find((c) => /hall|center|stadium|park|field|arena/i.test(c)),
        source_url: href ? absoluteUrl(href, pageUrl) ?? pageUrl : pageUrl,
      });
    });
  });

  return events;
}
