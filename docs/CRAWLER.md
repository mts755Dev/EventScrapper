# Phase 3 — Crawler Engine

## Design decisions

1. **Cheerio first, Playwright fallback** — Static HTML is cheaper and faster. Playwright only when the page looks like an SPA shell or lacks event signals.
2. **One orchestrator (`runCrawl`)** — Creates `crawl_jobs`, processes active `sources`, writes `crawl_logs`, upserts orgs/events, then finalizes the job.
3. **Service role for writes** — Cron route uses `SUPABASE_SERVICE_ROLE_KEY` so RLS does not block crawler inserts.
4. **Low concurrency (3) + polite delay** — Avoids hammering target sites and blowing serverless limits.
5. **Minimal parser in Phase 3** — JSON-LD `Event` only, so the pipeline is end-to-end. Richer extraction is Phase 4.
6. **Graceful Playwright failure** — If Chromium is missing, crawl continues with Cheerio HTML instead of aborting the whole job.

## Trigger a crawl

```bash
curl -X POST http://localhost:3000/api/cron/crawl \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

During each successful crawl, calendar/RSS links found on the page are **promoted** into `sources` (deduped by URL; inactive sources are never reactivated).

## Automatic source discovery (free, no search APIs)

Two free mechanisms grow the source list:

1. **Link promotion** — every crawl registers useful same-host / `.gov` / `.edu` / `.org` calendar links.
2. **Path probing** — `POST /api/cron/discover-sources` tries common calendar paths on curated NC/FL city & athletics origins plus known organization websites. Only pages that look like event calendars are inserted.

```bash
curl -X POST http://localhost:3000/api/cron/discover-sources \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Seeds live in `lib/constants/discovery-seeds.ts`. Limits/delays are in `crawler/config.ts`.

## Playwright browser (local)

If Playwright fallback is needed:

```bash
npx playwright install chromium
```

On Vercel, `@sparticuz/chromium` is used automatically.
