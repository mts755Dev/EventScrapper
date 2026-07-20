# Event Opportunity Discovery Platform

Internal dashboard for discovering in-person event opportunities for the 50/50 raffle sales team.

**Target states (MVP):** North Carolina, Florida

## Tech Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase (database, auth, cron jobs)
- Playwright + Cheerio (crawling — Phase 3+)

## Quick start

```bash
cp .env.example .env.local
# fill in Supabase keys (see docs/SETUP.md)

npm install
npm run dev
```

Then apply `supabase/migrations/20260720120000_initial_schema.sql` in the Supabase SQL Editor and create a user under Authentication → Users.

## Project Structure

```
app/                  # Next.js App Router pages & API routes
components/           # React components (ui, layout, domain)
crawler/              # Crawl engine (fetchers, parsers, discovery)
docs/                 # Architecture & database design
hooks/                # React hooks
lib/                  # Supabase clients, constants, config
services/             # Business logic layer
supabase/             # Migrations & Supabase config
types/                # TypeScript type definitions
utils/                # Shared utilities
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Setup (env + auth)](docs/SETUP.md)

## Implementation Phases

1. Architecture & structure ✅
2. Supabase schema & authentication ✅
3. Crawler engine ✅
4. Event extraction ✅
5. Dashboard ✅
6. Search & filters ✅
7. UI polish ✅

## Trigger a crawl

```bash
curl -X POST http://localhost:3000/api/cron/crawl \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

See [docs/CRAWLER.md](docs/CRAWLER.md) and [docs/EXTRACTION.md](docs/EXTRACTION.md).
