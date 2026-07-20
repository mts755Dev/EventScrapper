# Event Opportunity Discovery Platform — Architecture

## Overview

A single Next.js 15 application that discovers in-person event opportunities for the 50/50 raffle sales team. The app runs on Vercel; data and auth live in Supabase. There are no separate services, queues, or local databases.

**Design principle:** Maximize coverage. Collect broadly, dedupe in storage, filter in the dashboard.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Next.js 15)                      │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │  Dashboard   │   │  API Routes  │   │  Crawler Engine      │ │
│  │  (App Router)│   │  /api/cron/* │   │  Playwright + Cheerio│ │
│  │  Server      │   │  Protected   │   │  lib/crawler/        │ │
│  │  Components  │   │  by secret   │   │                      │ │
│  └──────┬───────┘   └──────┬───────┘   └──────────┬───────────┘ │
│         │                  │                       │             │
└─────────┼──────────────────┼───────────────────────┼─────────────┘
          │                  │                       │
          ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  PostgreSQL  │  Auth (internal users)  │  Cron Jobs (pg_cron)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Crawl Workflow

```
Supabase Cron Job (every 6h, configurable)
        │
        ▼
POST /api/cron/crawl  (Authorization: Bearer CRON_SECRET)
        │
        ▼
Create crawl_job (status: running)
        │
        ▼
Load active sources + seed organizations (NC, FL)
        │
        ▼
For each source/website:
  ├── Fetch HTML (Cheerio for static, Playwright for JS-heavy)
  ├── Parse events (title, dates, venue, links)
  ├── Discover new organizations (links, Google results)
  ├── Dedupe events (hash + fuzzy title/date match)
  ├── Upsert organizations & events
  └── Write crawl_log entry
        │
        ▼
Finalize crawl_job (status, totals, errors)
```

**Why Supabase Cron instead of Vercel Cron:** Requirement. Keeps scheduling in the data layer and avoids Vercel's cron limits. The cron job calls a protected API route; the heavy work runs in the Next.js serverless function (with appropriate timeout configuration).

**Why a single API route for crawls:** One entry point simplifies auth, logging, and job tracking. Internal orchestration stays in `crawler/` as plain TypeScript modules — no job queue needed for MVP.

---

## Application Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Pages** | `app/(dashboard)/*` | Server-rendered dashboard, tables, filters |
| **API** | `app/api/*` | Cron trigger, webhooks, server-only operations |
| **Components** | `components/*` | UI (shadcn), layout, domain-specific views |
| **Services** | `services/*` | Business logic: CRUD, search, stats |
| **Crawler** | `crawler/*` | Fetch, parse, discover, dedupe |
| **Lib** | `lib/*` | Supabase clients, constants, shared config |
| **Types** | `types/*` | TypeScript interfaces matching DB schema |

### Server vs Client Components

- **Server Components (default):** Dashboard stats, event/org lists, crawl job history — data fetched directly from Supabase on the server.
- **Client Components:** Search inputs, filters, calendar view, dark mode toggle, interactive tables with sorting.
- **Server Actions:** Create/update sources, toggle source active, settings — simple mutations without a separate API layer.

---

## Crawler Design

### Fetchers (`crawler/fetchers/`)

| Fetcher | Use when |
|---------|----------|
| `cheerio.ts` | Static HTML, RSS feeds, simple calendar pages |
| `playwright.ts` | SPAs, athletics sites, JS-rendered calendars |

**Decision:** Try Cheerio first (faster, cheaper). Fall back to Playwright when the page has little or no event content in initial HTML.

### Discovery (`crawler/discovery/`) — free, no paid APIs

- **Link promotion** during crawl: calendar/RSS links → new `sources` (dedupe by URL; never reactivate disabled rows)
- **Path probing** via `POST /api/cron/discover-sources`: curated NC/FL city & athletics origins + org websites, common `/events` paths, insert only if HTML looks event-like
- Block social/Google hosts; polite concurrency/delays

New organizations are upserted by `(name, state)` or `website` domain.

### Parsers (`crawler/parsers/`)

Generic event extraction first (schema.org `Event`, common calendar patterns, `<time>` tags, table rows). Site-specific parsers can be added later as separate files without changing the engine.

**Why generic parsers first:** Maximum coverage. Perfect extraction per site comes in later phases; we store partial data rather than skip events.

### Dedupe (`crawler/dedupe.ts`)

1. **Exact match:** `hash(organization_id + normalized_title + start_date + venue)`
2. **Fuzzy match:** Same org + similar title (Levenshtein) + same date → update existing row

Stored hash column: `events.dedupe_hash` (see DATABASE.md).

---

## Authentication

- Supabase Auth with email/password or magic link (internal team only)
- No public signup — users created by admin in Supabase dashboard
- Row Level Security (RLS): authenticated users can read all data; writes limited to service role (crawler) and authenticated admins
- Cron route protected by `CRON_SECRET` env var, not user session

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/crawler writes (bypasses RLS) |
| `CRON_SECRET` | Validates Supabase cron → API calls |
| `CRAWL_INTERVAL_HOURS` | Default 6; documented in settings |
| `TARGET_STATES` | `NC,FL` initially |

---

## Deployment

| Component | Platform |
|-----------|----------|
| Next.js app | Vercel |
| Database + Auth + Cron | Supabase |

Playwright on Vercel requires `@sparticuz/chromium` or similar serverless Chromium bundle — addressed in Phase 3.

---

## Phased Implementation

| Phase | Scope |
|-------|-------|
| **1** | Architecture, database design, folder structure ← current |
| **2** | Supabase schema migration, auth setup |
| **3** | Crawler engine (fetchers, orchestration) |
| **4** | Event extraction parsers |
| **5** | Dashboard pages |
| **6** | Search & filters |
| **7** | UI polish (dark mode, calendar, responsive) |

---

## Non-Goals (MVP)

- AI/LLM extraction
- Real-time crawling
- Multi-tenant access
- Public API
- Email notifications
- Docker / Redis / job queues
