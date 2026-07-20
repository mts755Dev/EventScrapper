import { RETIRED_SOURCE_URLS, SEED_SOURCES } from "@/lib/constants/seed-sources";
import { createServiceClient } from "@/lib/supabase/service";
import { getHostname, normalizeUrl } from "@/utils/url";
import type { Source } from "@/types/database";

export type DiscoveredSourceInput = {
  name: string;
  url: string;
  type: string;
  state?: string | null;
};

export async function listActiveSources(): Promise<Source[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true)
    .order("state", { ascending: true });

  if (error) throw new Error(`Failed to list sources: ${error.message}`);
  return data ?? [];
}

/**
 * Deactivate Google + known-dead URLs, upsert curated NC/FL sources.
 */
export async function seedBetterSources(): Promise<{
  deactivatedGoogle: number;
  deactivatedRetired: number;
  upserted: number;
  activeCount: number;
}> {
  const supabase = createServiceClient();

  const { data: googleRows, error: googleError } = await supabase
    .from("sources")
    .update({ active: false })
    .or("type.eq.google,url.ilike.%google.com/search%")
    .select("id");

  if (googleError) {
    throw new Error(`Failed to deactivate Google sources: ${googleError.message}`);
  }

  const { data: retiredRows, error: retiredError } = await supabase
    .from("sources")
    .update({ active: false })
    .in("url", [...RETIRED_SOURCE_URLS])
    .select("id");

  if (retiredError) {
    throw new Error(`Failed to deactivate retired sources: ${retiredError.message}`);
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("sources")
    .upsert(SEED_SOURCES, { onConflict: "url" })
    .select("id");

  if (upsertError) {
    throw new Error(`Failed to upsert sources: ${upsertError.message}`);
  }

  const { count, error: countError } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  if (countError) {
    throw new Error(`Failed to count active sources: ${countError.message}`);
  }

  return {
    deactivatedGoogle: googleRows?.length ?? 0,
    deactivatedRetired: retiredRows?.length ?? 0,
    upserted: upserted?.length ?? SEED_SOURCES.length,
    activeCount: count ?? 0,
  };
}

/**
 * Insert newly found crawl targets. Skips URLs that already exist
 * (does not reactivate manually disabled sources).
 */
export async function upsertDiscoveredSources(
  inputs: DiscoveredSourceInput[]
): Promise<{ inserted: number; skipped: number }> {
  const supabase = createServiceClient();
  let inserted = 0;
  let skipped = 0;

  for (const input of inputs) {
    const url = normalizeUrl(input.url);
    if (!url) {
      skipped += 1;
      continue;
    }

    const { data: existing } = await supabase
      .from("sources")
      .select("id")
      .eq("url", url)
      .maybeSingle();

    if (existing) {
      skipped += 1;
      continue;
    }

    const host = getHostname(url);
    const name =
      input.name.trim() ||
      (host ? `Discovered · ${host}` : "Discovered source");

    const { error } = await supabase.from("sources").insert({
      name: name.slice(0, 200),
      url,
      type: input.type,
      state: input.state ?? null,
      active: true,
    });

    if (error) {
      skipped += 1;
      continue;
    }
    inserted += 1;
  }

  return { inserted, skipped };
}

export async function listOrganizationWebsites(limit = 100): Promise<
  Array<{ name: string; website: string; state: string }>
> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("name, website, state")
    .not("website", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => Boolean(row.website))
    .map((row) => ({
      name: row.name,
      website: row.website as string,
      state: row.state,
    }));
}

export async function listAllSourceUrls(): Promise<Set<string>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("sources").select("url");
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.url));
}
