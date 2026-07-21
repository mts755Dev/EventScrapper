import { buildEventHash } from "@/crawler/dedupe";
import { shouldPersistEvent } from "@/crawler/extractors/relevance";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeUrl } from "@/utils/url";
import type { RawEvent } from "@/types/crawler";
import type { Event } from "@/types/database";

function toIsoOrNull(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Upsert by dedupe_hash. Returns whether a new row was inserted.
 * Skips past / irrelevant events (safety net after enrich filters).
 */
export async function upsertEvent(
  event: RawEvent,
  organizationId: string | null,
  fallbackState?: string | null
): Promise<{ event: Event; created: boolean } | null> {
  if (!event.title?.trim()) return null;
  if (!shouldPersistEvent(event)) return null;

  const supabase = createServiceClient();
  const hash = buildEventHash(event, organizationId);
  const sourceUrl = event.source_url
    ? normalizeUrl(event.source_url) ?? event.source_url
    : null;
  const ticketUrl = event.ticket_url
    ? normalizeUrl(event.ticket_url)
    : null;

  const payload = {
    organization_id: organizationId,
    title: event.title.trim().slice(0, 500),
    description: event.description?.slice(0, 5000) ?? null,
    event_type: event.event_type ?? null,
    venue: event.venue?.slice(0, 300) ?? null,
    city: event.city ?? null,
    state: event.state ?? fallbackState ?? null,
    start_date: toIsoOrNull(event.start_date),
    end_date: toIsoOrNull(event.end_date),
    source_url: sourceUrl,
    ticket_url: ticketUrl,
    dedupe_hash: hash,
  };

  const { data: existing } = await supabase
    .from("events")
    .select("*")
    .eq("dedupe_hash", hash)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("events")
      .update({
        description: payload.description ?? existing.description,
        venue: payload.venue ?? existing.venue,
        ticket_url: payload.ticket_url ?? existing.ticket_url,
        end_date: payload.end_date ?? existing.end_date,
        source_url: payload.source_url ?? existing.source_url,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !data) return { event: existing, created: false };
    return { event: data, created: false };
  }

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    // Concurrent insert on unique hash
    const { data: raced } = await supabase
      .from("events")
      .select("*")
      .eq("dedupe_hash", hash)
      .maybeSingle();
    if (raced) return { event: raced, created: false };
    throw new Error(`Failed to insert event: ${error.message}`);
  }

  return { event: data, created: true };
}

export async function upsertEvents(
  events: RawEvent[],
  organizationId: string | null,
  fallbackState?: string | null
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const event of events) {
    const result = await upsertEvent(event, organizationId, fallbackState);
    if (!result) continue;
    if (result.created) created += 1;
    else updated += 1;
  }

  return { created, updated };
}
