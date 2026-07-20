# Database Design

All tables live in Supabase PostgreSQL. Types use `uuid` primary keys and `timestamptz` for dates.

---

## Entity Relationship

```
sources ─────────────────────────────────────────┐
                                                 │
organizations ◄──────── events                   │
      ▲                      ▲                   │
      │                      │                   │
      └──── crawl_logs ──────┴── crawl_jobs ◄────┘
```

---

## Tables

### `organizations`

Organizations that host or are associated with events.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | |
| `website` | `text` | | Normalized URL |
| `category` | `text` | NOT NULL | See `org_categories` constant |
| `city` | `text` | | |
| `state` | `char(2)` | NOT NULL | `NC`, `FL`, etc. |
| `source` | `text` | | How discovered: `google`, `crawl`, `manual` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- `idx_organizations_state` on `(state)`
- `idx_organizations_category` on `(category)`
- Unique partial index on `(lower(name), state)` where name is not null — soft dedupe

---

### `events`

Discovered event opportunities.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `organization_id` | `uuid` | FK → organizations, ON DELETE SET NULL | |
| `title` | `text` | NOT NULL | |
| `description` | `text` | | |
| `event_type` | `text` | | See `event_types` constant |
| `venue` | `text` | | |
| `city` | `text` | | |
| `state` | `char(2)` | | |
| `start_date` | `timestamptz` | | Nullable for TBD events |
| `end_date` | `timestamptz` | | |
| `source_url` | `text` | | Page where event was found |
| `ticket_url` | `text` | | |
| `dedupe_hash` | `text` | UNIQUE | SHA-256 of org+title+date+venue |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- `idx_events_organization_id` on `(organization_id)`
- `idx_events_start_date` on `(start_date)`
- `idx_events_state` on `(state)`
- `idx_events_event_type` on `(event_type)`
- `idx_events_created_at` on `(created_at)` — "new events today"
- Unique on `(dedupe_hash)`

**Trigger:** `updated_at` auto-set on row update.

---

### `crawl_jobs`

One row per scheduled crawl run.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `started_at` | `timestamptz` | NOT NULL, default `now()` | |
| `finished_at` | `timestamptz` | | Null while running |
| `status` | `text` | NOT NULL | `running`, `completed`, `failed` |
| `total_sites` | `integer` | NOT NULL, default `0` | |
| `total_events` | `integer` | NOT NULL, default `0` | New + updated |
| `errors` | `jsonb` | NOT NULL, default `'[]'` | Array of `{ site, message }` |

**Indexes:**
- `idx_crawl_jobs_started_at` on `(started_at DESC)`
- `idx_crawl_jobs_status` on `(status)`

---

### `crawl_logs`

Per-website result within a crawl job.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `crawl_job_id` | `uuid` | FK → crawl_jobs, ON DELETE CASCADE | |
| `website` | `text` | NOT NULL | URL crawled |
| `status` | `text` | NOT NULL | `success`, `error`, `skipped` |
| `message` | `text` | | Error detail or summary |
| `events_found` | `integer` | NOT NULL, default `0` | Added for observability |
| `crawled_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- `idx_crawl_logs_job_id` on `(crawl_job_id)`
- `idx_crawl_logs_status` on `(status)`

---

### `sources`

Seed URLs and recurring crawl targets.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | Human-readable label |
| `url` | `text` | NOT NULL | |
| `type` | `text` | NOT NULL | `google`, `calendar`, `rss`, `organization`, `news` |
| `state` | `char(2)` | | Optional state scope |
| `active` | `boolean` | NOT NULL, default `true` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- `idx_sources_active` on `(active)` where `active = true`

---

## Row Level Security

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|----------------------|
| All dashboard tables | `authenticated` users | `service_role` only (crawler) |
| Settings (future) | `authenticated` | `authenticated` with admin role |

The Next.js crawler API route uses `SUPABASE_SERVICE_ROLE_KEY` for writes during crawls. Dashboard reads use the anon key with an authenticated session.

---

## Supabase Cron Job

Scheduled via `pg_cron` + `pg_net` (or Supabase Dashboard Cron):

```sql
-- Runs every 6 hours; calls protected Next.js endpoint
SELECT cron.schedule(
  'event-crawl',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<vercel-app>/api/cron/crawl',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <CRON_SECRET>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Actual migration SQL will be created in Phase 2.

---

## Design Decisions

1. **`dedupe_hash` on events** — Enables fast duplicate detection without expensive fuzzy queries on every insert. Fuzzy matching runs only when exact hash misses.

2. **`errors` as JSONB on crawl_jobs** — Keeps job summary in one row; detailed per-site errors live in `crawl_logs`.

3. **`events_found` on crawl_logs** — Helps the sales team see which sources are productive without joining events.

4. **Event types and org categories as text + app constants** — Avoids lookup tables for MVP. Easy to promote to reference tables later without migration pain.

5. **`state` as `char(2)`** — ISO abbreviations; indexed for NC/FL filtering and future expansion.

6. **No soft deletes** — Internal tool; hard deletes are fine. Crawl history is preserved in logs.
