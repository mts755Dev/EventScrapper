-- Leads feature: track events added to leads pipeline
-- Run in Supabase SQL Editor.

alter table public.events
  add column if not exists is_lead boolean not null default false;

create index if not exists idx_events_is_lead on public.events (is_lead) where is_lead = true;

-- Allow authenticated users to delete events (for lead removal / auto-cleanup)
drop policy if exists "Authenticated can delete events" on public.events;
create policy "Authenticated can delete events"
  on public.events for delete
  to authenticated
  using (true);
