import type { CheerioAPI } from "cheerio";
import { parseLocationObject } from "@/utils/location";
import type { RawEvent } from "@/types/crawler";

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function extractOfferUrl(offers: unknown): string | undefined {
  if (!offers) return undefined;
  if (typeof offers === "string") return offers;
  if (Array.isArray(offers)) {
    for (const offer of offers) {
      const url = extractOfferUrl(offer);
      if (url) return url;
    }
    return undefined;
  }
  if (typeof offers === "object") {
    return stringValue((offers as Record<string, unknown>).url);
  }
  return undefined;
}

function collectLdEvents(
  node: unknown,
  pageUrl: string,
  out: RawEvent[],
  depth = 0
): void {
  if (!node || depth > 8) return;

  if (Array.isArray(node)) {
    for (const item of node) collectLdEvents(item, pageUrl, out, depth + 1);
    return;
  }

  if (typeof node !== "object") return;

  const obj = node as Record<string, unknown>;

  if (obj["@graph"]) {
    collectLdEvents(obj["@graph"], pageUrl, out, depth + 1);
  }

  const type = obj["@type"];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  const isEvent = types.some(
    (t) => typeof t === "string" && /event/i.test(t)
  );

  if (isEvent) {
    const title = stringValue(obj.name) || stringValue(obj.headline);
    if (title) {
      const location = parseLocationObject(obj.location);
      out.push({
        title,
        description: stringValue(obj.description),
        venue: location.venue,
        city: location.city,
        state: location.state,
        start_date: stringValue(obj.startDate),
        end_date: stringValue(obj.endDate),
        source_url: stringValue(obj.url) || pageUrl,
        ticket_url: extractOfferUrl(obj.offers),
      });
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      collectLdEvents(value, pageUrl, out, depth + 1);
    }
  }
}

/** Repair common JSON-LD issues (trailing commas, multiple objects). */
function parseJsonLd(raw: string): unknown[] {
  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/,\s*([}\]])/g, "$1");

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    try {
      const wrapped = JSON.parse(`[${cleaned.replace(/}\s*{/g, "},{")}]`);
      return Array.isArray(wrapped) ? wrapped : [wrapped];
    } catch {
      return [];
    }
  }
}

export function extractJsonLdEvents(
  $: CheerioAPI,
  pageUrl: string
): RawEvent[] {
  const events: RawEvent[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    for (const node of parseJsonLd(raw)) {
      collectLdEvents(node, pageUrl, events);
    }
  });

  return events;
}
