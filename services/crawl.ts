import { createServiceClient } from "@/lib/supabase/service";
import type { CrawlError, CrawlJob, CrawlLog, Json, Source } from "@/types/database";

export async function getActiveSources(
  states?: string[],
  options?: { limit?: number }
): Promise<Source[]> {
  const supabase = createServiceClient();
  let query = supabase.from("sources").select("*").eq("active", true);

  if (states && states.length > 0) {
    query = query.or(
      `state.in.(${states.join(",")}),state.is.null`
    );
  }

  // Prefer never-crawled / oldest first so batches rotate across all sources.
  query = query.order("last_crawled_at", {
    ascending: true,
    nullsFirst: true,
  });

  if (options?.limit && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load sources: ${error.message}`);
  return data ?? [];
}

export async function touchSourceCrawled(sourceId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sources")
    .update({ last_crawled_at: new Date().toISOString() })
    .eq("id", sourceId);

  if (error) {
    // Non-fatal: rotation still works on next successful update
    console.warn(`touchSourceCrawled failed: ${error.message}`);
  }
}

export async function createCrawlJob(): Promise<CrawlJob> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("crawl_jobs")
    .insert({ status: "running" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create crawl job: ${error?.message}`);
  }
  return data;
}

export async function finishCrawlJob(
  jobId: string,
  input: {
    status: "completed" | "failed";
    total_sites: number;
    total_events: number;
    errors: CrawlError[];
  }
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("crawl_jobs")
    .update({
      status: input.status,
      finished_at: new Date().toISOString(),
      total_sites: input.total_sites,
      total_events: input.total_events,
      errors: input.errors as unknown as Json,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Failed to finish crawl job: ${error.message}`);
  }
}

export async function insertCrawlLog(input: {
  crawl_job_id: string;
  website: string;
  status: CrawlLog["status"];
  message?: string;
  events_found?: number;
}): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("crawl_logs").insert({
    crawl_job_id: input.crawl_job_id,
    website: input.website,
    status: input.status,
    message: input.message ?? null,
    events_found: input.events_found ?? 0,
  });

  if (error) {
    throw new Error(`Failed to insert crawl log: ${error.message}`);
  }
}
