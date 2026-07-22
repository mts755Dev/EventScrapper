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
        const updates: { city?: string; category?: string } = {};
        if (org.city && !existingBySite.city) updates.city = org.city;
        if (
          org.category &&
          org.category !== "other" &&
          (!existingBySite.category || existingBySite.category === "other")
        ) {
          updates.category = org.category;
        }
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("organizations")
            .update(updates)
            .eq("id", existingBySite.id);
          return { ...existingBySite, ...updates };
        }
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
    const updates: { website?: string; city?: string; category?: string } = {};
    if (website && !existing.website) updates.website = website;
    if (org.city && !existing.city) updates.city = org.city;
    if (
      org.category &&
      org.category !== "other" &&
      (!existing.category || existing.category === "other")
    ) {
      updates.category = org.category;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("organizations")
        .update(updates)
        .eq("id", existing.id);
      return { ...existing, ...updates };
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
