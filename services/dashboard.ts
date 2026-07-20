import { createClient } from "@/lib/supabase/server";
import type { CrawlJob, CrawlLog, Event, Organization } from "@/types/database";

export type DashboardStats = {
  totalOrganizations: number;
  totalEvents: number;
  newEventsToday: number;
  upcomingEvents: number;
  failedCrawls: number;
  activeSources: number;
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = startOfTodayIso();
  const now = new Date().toISOString();

  const [
    orgs,
    events,
    newToday,
    upcoming,
    failed,
    sources,
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("start_date", now),
    supabase
      .from("crawl_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("sources")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
  ]);

  return {
    totalOrganizations: orgs.count ?? 0,
    totalEvents: events.count ?? 0,
    newEventsToday: newToday.count ?? 0,
    upcomingEvents: upcoming.count ?? 0,
    failedCrawls: failed.count ?? 0,
    activeSources: sources.count ?? 0,
  };
}

export async function getUpcomingEvents(limit = 10): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentEvents(limit = 10): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentFailedLogs(limit = 8): Promise<CrawlLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crawl_logs")
    .select("*")
    .eq("status", "error")
    .order("crawled_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentCrawlJobs(limit = 5): Promise<CrawlJob[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crawl_jobs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEvents(options?: {
  limit?: number;
  offset?: number;
  state?: string;
  q?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  upcomingOnly?: boolean;
  contacted?: boolean;
  disposition?: import("@/types/database").Disposition;
}): Promise<{ rows: Event[]; total: number }> {
  const supabase = await createClient();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("start_date", { ascending: true })
    .range(offset, offset + limit - 1);

  if (options?.state) {
    query = query.eq("state", options.state);
  }

  if (options?.eventType) {
    query = query.eq("event_type", options.eventType);
  }

  if (options?.upcomingOnly) {
    query = query.gte("start_date", new Date().toISOString());
  }

  if (options?.dateFrom) {
    query = query.gte("start_date", options.dateFrom);
  }

  if (options?.dateTo) {
    query = query.lte("start_date", options.dateTo);
  }

  if (typeof options?.contacted === "boolean") {
    query = query.eq("contacted", options.contacted);
  }

  if (options?.disposition) {
    query = query.eq("disposition", options.disposition);
  }

  const q = options?.q?.replace(/[%_,]/g, " ").trim();
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,venue.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

/** Events falling within [start, end) for calendar month views */
export async function getEventsInRange(options: {
  start: string;
  end: string;
  state?: string;
  eventType?: string;
  q?: string;
}): Promise<Event[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .gte("start_date", options.start)
    .lt("start_date", options.end)
    .order("start_date", { ascending: true })
    .limit(500);

  if (options.state) query = query.eq("state", options.state);
  if (options.eventType) query = query.eq("event_type", options.eventType);

  const q = options.q?.replace(/[%_,]/g, " ").trim();
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,venue.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}


export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listOrganizations(options?: {
  limit?: number;
  offset?: number;
  q?: string;
  state?: string;
  category?: string;
  contacted?: boolean;
  disposition?: import("@/types/database").Disposition;
}): Promise<{ rows: Organization[]; total: number }> {
  const supabase = await createClient();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("organizations")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (options?.state) query = query.eq("state", options.state);
  if (options?.category) query = query.eq("category", options.category);
  if (typeof options?.contacted === "boolean") {
    query = query.eq("contacted", options.contacted);
  }
  if (options?.disposition) {
    query = query.eq("disposition", options.disposition);
  }

  const q = options?.q?.replace(/[%_,]/g, " ").trim();
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,city.ilike.%${q}%,website.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getOrganizationById(
  id: string
): Promise<Organization | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEventsForOrganization(
  organizationId: string,
  limit = 50
): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCrawlJobs(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ rows: CrawlJob[]; total: number }> {
  const supabase = await createClient();
  const limit = options?.limit ?? 30;
  const offset = options?.offset ?? 0;

  const { data, error, count } = await supabase
    .from("crawl_jobs")
    .select("*", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listCrawlLogs(options?: {
  limit?: number;
  offset?: number;
  jobId?: string;
  status?: import("@/types/database").CrawlLogStatus;
}): Promise<{ rows: CrawlLog[]; total: number }> {
  const supabase = await createClient();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("crawl_logs")
    .select("*", { count: "exact" })
    .order("crawled_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.jobId) query = query.eq("crawl_job_id", options.jobId);
  if (options?.status) query = query.eq("status", options.status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listSources(options?: {
  state?: string;
  active?: boolean;
  q?: string;
}): Promise<SourceRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sources")
    .select("*")
    .order("state", { ascending: true })
    .order("name", { ascending: true });

  if (options?.state) query = query.eq("state", options.state);
  if (typeof options?.active === "boolean") {
    query = query.eq("active", options.active);
  }

  const q = options?.q?.replace(/[%_,]/g, " ").trim();
  if (q) {
    query = query.or(`name.ilike.%${q}%,url.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

type SourceRow = import("@/types/database").Source;
