-- Sales pipeline tags for events & organizations
-- Run in Supabase SQL Editor.

-- disposition: none | accepted | declined (mutually exclusive)
-- contacted: whether sales has reached out

alter table public.events
  add column if not exists contacted boolean not null default false,
  add column if not exists disposition text not null default 'none'
    check (disposition in ('none', 'accepted', 'declined'));

alter table public.organizations
  add column if not exists contacted boolean not null default false,
  add column if not exists disposition text not null default 'none'
    check (disposition in ('none', 'accepted', 'declined'));

create index if not exists idx_events_contacted on public.events (contacted);
create index if not exists idx_events_disposition on public.events (disposition);
create index if not exists idx_organizations_contacted on public.organizations (contacted);
create index if not exists idx_organizations_disposition on public.organizations (disposition);

-- Allow authenticated sales users to update pipeline tags
drop policy if exists "Authenticated can update events" on public.events;
create policy "Authenticated can update events"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can update organizations" on public.organizations;
create policy "Authenticated can update organizations"
  on public.organizations for update
  to authenticated
  using (true)
  with check (true);
