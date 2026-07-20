# Folder Structure

Maps to the required layout. Files are added in later phases.

```
EventScrapper/
├── app/
│   ├── (auth)/
│   │   └── login/              # Supabase auth login page
│   ├── (dashboard)/            # Authenticated layout group
│   │   ├── page.tsx            # Dashboard home (Phase 5)
│   │   ├── events/             # Event list & detail
│   │   ├── organizations/      # Organization list & detail
│   │   ├── crawl-jobs/         # Crawl job history
│   │   ├── crawl-logs/         # Per-site crawl logs
│   │   ├── sources/            # Manage crawl sources
│   │   └── settings/           # App settings
│   └── api/
│       └── cron/
│           └── crawl/          # Protected endpoint for Supabase cron
├── components/
│   ├── ui/                     # shadcn/ui primitives (Phase 5)
│   ├── layout/                 # Sidebar, header, nav
│   ├── dashboard/              # Stats cards, calendar
│   ├── events/                 # Event table, filters
│   ├── organizations/          # Org table, detail views
│   └── crawls/                 # Crawl job/log components
├── crawler/
│   ├── index.ts                # Orchestrator entry point (Phase 3)
│   ├── fetchers/
│   │   ├── cheerio.ts          # Static HTML fetcher
│   │   └── playwright.ts       # JS-heavy site fetcher
│   ├── parsers/                # HTML → RawEvent (Phase 4)
│   ├── extractors/             # schema.org, calendar patterns
│   ├── discovery/              # Link promotion + free path probing
│   └── dedupe.ts               # Event deduplication
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── FOLDER_STRUCTURE.md
├── hooks/                      # useSearch, useFilters, etc.
├── lib/
│   ├── constants/              # States, event types, categories
│   └── supabase/               # Client & server Supabase helpers
├── services/
│   ├── events.ts               # Event CRUD & search
│   ├── organizations.ts        # Org CRUD
│   ├── crawl.ts                # Crawl job management
│   └── sources.ts              # Source CRUD
├── supabase/
│   └── migrations/             # SQL migrations (Phase 2)
├── types/
│   ├── database.ts             # Supabase row types
│   ├── crawler.ts              # Crawler pipeline types
│   └── index.ts
└── utils/
    ├── dates.ts                # Date parsing & formatting
    ├── hash.ts                 # Dedupe hash generation
    └── url.ts                  # URL normalization
```

## Layer Responsibilities

| Directory | What goes here | What does NOT go here |
|-----------|----------------|----------------------|
| `app/` | Routes, layouts, API handlers | Business logic, parsing |
| `components/` | Presentational & container UI | Direct Supabase calls (use services) |
| `crawler/` | Fetch, parse, discover, dedupe | Dashboard UI |
| `services/` | DB queries, stats, mutations | HTTP handling |
| `lib/` | Config, clients, constants | Domain-specific logic |
| `types/` | Shared TypeScript interfaces | Runtime code |
| `utils/` | Pure helper functions | Side effects |
