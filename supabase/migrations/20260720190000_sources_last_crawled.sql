-- Track crawl rotation so each Vercel invocation only hits a small batch.
alter table public.sources
  add column if not exists last_crawled_at timestamptz;

create index if not exists idx_sources_active_last_crawled
  on public.sources (last_crawled_at nulls first)
  where active = true;
