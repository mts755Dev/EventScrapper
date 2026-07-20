-- Cron job to trigger crawls every 6 hours.
-- Apply AFTER the app is deployed and CRON_SECRET is set.
-- Replace placeholders before running in the Supabase SQL Editor.
--
-- Requires extensions: pg_cron, pg_net (enable in Supabase Dashboard → Database → Extensions)

/*
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'event-crawl',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_VERCEL_APP.vercel.app/api/cron/crawl',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Weekly free source discovery (city/school path probes + org websites)
select cron.schedule(
  'event-discover-sources',
  '0 8 * * 1',
  $$
  select net.http_post(
    url := 'https://YOUR_VERCEL_APP.vercel.app/api/cron/discover-sources',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/
