-- Event Opportunity Discovery Platform — initial schema
-- Run this in the Supabase SQL Editor (or via supabase db push) before using the app.

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  category text not null,
  city text,
  state char(2) not null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_organizations_state on public.organizations (state);
create index if not exists idx_organizations_category on public.organizations (category);
create unique index if not exists idx_organizations_name_state
  on public.organizations (lower(name), state);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  title text not null,
  description text,
  event_type text,
  venue text,
  city text,
  state char(2),
  start_date timestamptz,
  end_date timestamptz,
  source_url text,
  ticket_url text,
  dedupe_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dedupe_hash_unique unique (dedupe_hash)
);

create index if not exists idx_events_organization_id on public.events (organization_id);
create index if not exists idx_events_start_date on public.events (start_date);
create index if not exists idx_events_state on public.events (state);
create index if not exists idx_events_event_type on public.events (event_type);
create index if not exists idx_events_created_at on public.events (created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- crawl_jobs
-- ---------------------------------------------------------------------------
create table if not exists public.crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'completed', 'failed')),
  total_sites integer not null default 0,
  total_events integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

create index if not exists idx_crawl_jobs_started_at on public.crawl_jobs (started_at desc);
create index if not exists idx_crawl_jobs_status on public.crawl_jobs (status);

-- ---------------------------------------------------------------------------
-- crawl_logs
-- ---------------------------------------------------------------------------
create table if not exists public.crawl_logs (
  id uuid primary key default gen_random_uuid(),
  crawl_job_id uuid not null references public.crawl_jobs (id) on delete cascade,
  website text not null,
  status text not null check (status in ('success', 'error', 'skipped')),
  message text,
  events_found integer not null default 0,
  crawled_at timestamptz not null default now()
);

create index if not exists idx_crawl_logs_job_id on public.crawl_logs (crawl_job_id);
create index if not exists idx_crawl_logs_status on public.crawl_logs (status);

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  type text not null,
  state char(2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_sources_active on public.sources (active) where active = true;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Dashboard: authenticated users can read.
-- Crawler/API writes: service_role (bypasses RLS).
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.events enable row level security;
alter table public.crawl_jobs enable row level security;
alter table public.crawl_logs enable row level security;
alter table public.sources enable row level security;

-- Drop existing policies if re-running migration
drop policy if exists "Authenticated can read organizations" on public.organizations;
drop policy if exists "Authenticated can read events" on public.events;
drop policy if exists "Authenticated can read crawl_jobs" on public.crawl_jobs;
drop policy if exists "Authenticated can read crawl_logs" on public.crawl_logs;
drop policy if exists "Authenticated can read sources" on public.sources;
drop policy if exists "Authenticated can manage sources" on public.sources;

create policy "Authenticated can read organizations"
  on public.organizations for select
  to authenticated
  using (true);

create policy "Authenticated can read events"
  on public.events for select
  to authenticated
  using (true);

create policy "Authenticated can read crawl_jobs"
  on public.crawl_jobs for select
  to authenticated
  using (true);

create policy "Authenticated can read crawl_logs"
  on public.crawl_logs for select
  to authenticated
  using (true);

create policy "Authenticated can read sources"
  on public.sources for select
  to authenticated
  using (true);

-- Sales team can manage sources from the dashboard (toggle active, add URLs)
create policy "Authenticated can manage sources"
  on public.sources for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Seed example sources (NC / FL) — optional starter set
-- Prefer real calendars over Google search (scrapers get blocked).
-- ---------------------------------------------------------------------------
insert into public.sources (name, url, type, state, active)
values
  ('VisitNC Events', 'https://www.visitnc.com/events', 'calendar', 'NC', true),
  ('VisitFlorida Events', 'https://www.visitflorida.com/events/', 'calendar', 'FL', true),
  ('Charlotte Events Directory', 'https://www.charlottenc.gov/Events-directory', 'calendar', 'NC', true),
  ('Raleigh Events', 'https://www.raleighnc.gov/events', 'calendar', 'NC', true),
  ('UNC Tar Heels Calendar', 'https://goheels.com/calendar', 'athletics', 'NC', true),
  ('NC State Wolfpack Calendar', 'https://gopack.com/calendar', 'athletics', 'NC', true),
  ('Orlando Events', 'https://www.orlando.gov/Events', 'calendar', 'FL', true),
  ('Florida Gators Calendar', 'https://floridagators.com/calendar', 'athletics', 'FL', true),
  ('FSU Seminoles Calendar', 'https://seminoles.com/calendar', 'athletics', 'FL', true)
on conflict do nothing;
