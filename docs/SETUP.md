# Environment Setup

Copy `.env.example` to `.env.local` (or `.env`) and fill in values from your Supabase project:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (secret) |
| `CRON_SECRET` | Any long random string you generate |
| `CRAWL_INTERVAL_HOURS` | Default `6` |
| `TARGET_STATES` | Default `NC,FL` |

## Apply the database schema

1. Open Supabase → SQL Editor
2. Paste and run `supabase/migrations/20260720120000_initial_schema.sql`
3. Paste and run `supabase/migrations/20260720150000_better_sources.sql` (city calendars, athletics, chambers — deactivates Google seeds)
4. Paste and run `supabase/migrations/20260720180000_sales_tags.sql` (contacted / accept / decline tags)
5. (Later, after deploy) Uncomment and run `supabase/migrations/20260720120100_cron_job.sql` with your Vercel URL and `CRON_SECRET`

## Create internal users

1. Supabase → Authentication → Users → Add user
2. Disable public signup: Authentication → Providers → Email → turn off "Enable sign ups" (or leave off Confirm email as needed for internal invites)

## Auth design

- Email/password only — no public registration UI
- Middleware protects all routes except `/login` and `/api/cron/*`
- Dashboard reads use the anon key + user session (RLS)
- Crawler writes use the service role key (bypasses RLS)
