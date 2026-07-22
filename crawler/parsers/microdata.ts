import type { CheerioAPI } from "cheerio";
import { parseLocationText } from "@/utils/location";
import { absoluteUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

/**
 * schema.org microdata: itemscope itemtype="...Event"
 */
export function extractMicrodataEvents(
  $: CheerioAPI,
  pageUrl: string
): RawEvent[] {
  const events: RawEvent[] = [];

  $("[itemscope][itemtype]").each((_, el) => {
    const itemtype = ($(el).attr("itemtype") ?? "").toLowerCase();
    if (!itemtype.includes("event")) return;

    const scope = $(el);
    const title =
      scope.find('[itemprop="name"]').first().text().trim() ||
      scope.find('[itemprop="headline"]').first().text().trim();
    if (!title) return;

    const start =
      scope.find('[itemprop="startDate"]').attr("content") ||
      scope.find('[itemprop="startDate"]').attr("datetime") ||
      scope.find('[itemprop="startDate"]').text().trim();

    const end =
      scope.find('[itemprop="endDate"]').attr("content") ||
      scope.find('[itemprop="endDate"]').attr("datetime") ||
      scope.find('[itemprop="endDate"]').text().trim();

    const locationText =
      scope.find('[itemprop="location"] [itemprop="name"]').first().text().trim() ||
      scope.find('[itemprop="address"] [itemprop="addressLocality"]').first().text().trim() ||
      scope.find('[itemprop="location"]').first().text().trim();
    const locality = scope
      .find('[itemprop="addressLocality"]')
      .first()
      .text()
      .trim();
    const region = scope
      .find('[itemprop="addressRegion"]')
      .first()
      .text()
      .trim()
      .toUpperCase();
    const location = locationText ? parseLocationText(locationText) : {};

    const description = scope
      .find('[itemprop="description"]')
      .first()
      .text()
      .trim();

    const urlAttr =
      scope.find('[itemprop="url"]').attr("href") ||
      scope.find('[itemprop="url"]').attr("content");

    events.push({
      title,
      description: description || undefined,
      venue: location.venue || locationText || undefined,
      city: locality || location.city || undefined,
      state:
        region === "NC" || region === "FL"
          ? region
          : location.state || undefined,
      start_date: start || undefined,
      end_date: end || undefined,
      source_url: urlAttr
        ? absoluteUrl(urlAttr, pageUrl) ?? pageUrl
        : pageUrl,
    });
  });

  return events;
}
