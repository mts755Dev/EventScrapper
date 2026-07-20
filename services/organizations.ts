import { createServiceClient } from "@/lib/supabase/service";
import { getHostname, normalizeUrl } from "@/utils/url";
import type { DiscoveredOrganization } from "@/types/crawler";
import type { Organization } from "@/types/database";

export async function upsertOrganization(
  org: DiscoveredOrganization
): Promise<Organization | null> {
  if (!org.name || !org.state) return null;

  const supabase = createServiceClient();
  const website = org.website ? normalizeUrl(org.website) : null;

  // Prefer match by website hostname when available
  if (website) {
    const host = getHostname(website);
    if (host) {
      const { data: existingBySite } = await supabase
        .from("organizations")
        .select("*")
        .ilike("website", `%${host}%`)
        .eq("state", org.state)
        .limit(1)
        .maybeSingle();

      if (existingBySite) {
        return existingBySite;
      }
    }
  }

  const { data: existing } = await supabase
    .from("organizations")
    .select("*")
    .ilike("name", org.name)
    .eq("state", org.state)
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (website && !existing.website) {
      await supabase
        .from("organizations")
        .update({ website })
        .eq("id", existing.id);
      return { ...existing, website };
    }
    return existing;
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: org.name,
      website,
      category: org.category ?? "other",
      city: org.city ?? null,
      state: org.state,
      source: org.source,
    })
    .select("*")
    .single();

  if (error) {
    // Unique index race — re-fetch
    const { data: raced } = await supabase
      .from("organizations")
      .select("*")
      .ilike("name", org.name)
      .eq("state", org.state)
      .limit(1)
      .maybeSingle();
    return raced ?? null;
  }

  return data;
}
