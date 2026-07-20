import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { toIsoDate } from "@/utils/dates";
import { absoluteUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * RSS 2.0 / Atom feed → RawEvent[]
 * Treats each item as a potential event (coverage-first).
 */
export function extractRssEvents(xml: string, feedUrl: string): RawEvent[] {
  const $ = cheerio.load(xml, { xml: true });
  const events: RawEvent[] = [];

  $("item").each((_, el) => {
    const title = decodeXml($(el).find("title").first().text());
    if (!title) return;

    const link =
      decodeXml($(el).find("link").first().text()) ||
      $(el).find("link").attr("href") ||
      feedUrl;

    const pubDate =
      decodeXml($(el).find("pubDate").first().text()) ||
      decodeXml($(el).find("dc\\:date, date").first().text());

    const description = decodeXml(
      $(el).find("description").first().text() ||
        $(el).find("content\\:encoded").first().text()
    );

    events.push({
      title,
      description: description || undefined,
      start_date: toIsoDate(pubDate) || pubDate || undefined,
      source_url: absoluteUrl(link, feedUrl) ?? feedUrl,
    });
  });

  $("entry").each((_, el) => {
    const title = decodeXml($(el).find("title").first().text());
    if (!title) return;

    const link =
      $(el).find("link[rel='alternate']").attr("href") ||
      $(el).find("link").attr("href") ||
      feedUrl;

    const published =
      decodeXml($(el).find("published").first().text()) ||
      decodeXml($(el).find("updated").first().text());

    const description = decodeXml(
      $(el).find("summary").first().text() ||
        $(el).find("content").first().text()
    );

    events.push({
      title,
      description: description || undefined,
      start_date: toIsoDate(published) || published || undefined,
      source_url: absoluteUrl(link ?? feedUrl, feedUrl) ?? feedUrl,
    });
  });

  return events;
}

export function isFeedContent(contentType: string, body: string): boolean {
  const ct = contentType.toLowerCase();
  if (
    ct.includes("xml") ||
    ct.includes("rss") ||
    ct.includes("atom") ||
    ct.includes("text/xml")
  ) {
    return true;
  }
  const head = body.slice(0, 400).toLowerCase();
  return (
    head.includes("<rss") ||
    head.includes("<feed") ||
    head.includes("<rdf:rdf")
  );
}

/** Find RSS/Atom alternate links on an HTML page */
export function findFeedLinks($: CheerioAPI, pageUrl: string): string[] {
  const links: string[] = [];
  $('link[rel="alternate"]').each((_, el) => {
    const type = ($(el).attr("type") ?? "").toLowerCase();
    const href = $(el).attr("href");
    if (!href) return;
    if (
      type.includes("rss") ||
      type.includes("atom") ||
      type.includes("xml")
    ) {
      const absolute = absoluteUrl(href, pageUrl);
      if (absolute) links.push(absolute);
    }
  });
  return [...new Set(links)].slice(0, 3);
}
