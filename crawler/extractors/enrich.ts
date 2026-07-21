import { classifyEventType } from "@/crawler/extractors/classify";
import { shouldPersistEvent } from "@/crawler/extractors/relevance";
import { toIsoDate } from "@/utils/dates";
import { normalizeUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";

/**
 * Normalize extracted events: dates → ISO, classify type, trim fields.
 * Drops past events and listings that are not raffle / fundraising relevant.
 */
export function enrichEvents(
  events: RawEvent[],
  fallbackState?: string | null
): RawEvent[] {
  const result: RawEvent[] = [];

  for (const event of events) {
    const title = event.title?.replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) continue;

    const description = event.description?.replace(/\s+/g, " ").trim();
    const start = toIsoDate(event.start_date) ?? event.start_date;
    const end = toIsoDate(event.end_date) ?? event.end_date;

    const normalized: RawEvent = {
      ...event,
      title: title.slice(0, 500),
      description: description ? description.slice(0, 5000) : undefined,
      venue: event.venue?.replace(/\s+/g, " ").trim().slice(0, 300),
      city: event.city?.trim(),
      state: event.state?.trim().toUpperCase() || fallbackState || undefined,
      start_date: start,
      end_date: end,
      source_url: normalizeUrl(event.source_url) ?? event.source_url,
      ticket_url: event.ticket_url
        ? normalizeUrl(event.ticket_url) ?? event.ticket_url
        : undefined,
      event_type: event.event_type || classifyEventType(title, description),
    };

    if (!shouldPersistEvent(normalized)) continue;
    result.push(normalized);
  }

  return result;
}

export function mergeAndDedupeEvents(groups: RawEvent[][]): RawEvent[] {
  const seen = new Set<string>();
  const result: RawEvent[] = [];

  for (const group of groups) {
    for (const event of group) {
      const key = [
        event.title.toLowerCase(),
        (event.start_date ?? "").slice(0, 10),
        (event.venue ?? "").toLowerCase(),
      ].join("|");

      if (seen.has(key)) continue;
      seen.add(key);
      result.push(event);
    }
  }

  return result;
}
