# Phase 4 — Event Extraction

## Design decisions

1. **Multiple extractors, merge + dedupe** — JSON-LD, microdata, `<time>`, calendar cards, tables, and RSS all run; we keep anything with a title.
2. **Coverage over precision** — Partial events (title + date, no venue) are stored. Sales can filter later in the dashboard.
3. **Keyword `event_type` classifier** — Rules live in `crawler/extractors/classify.ts`. Add a pattern to support a new type — no DB migration.
4. **Flexible date parsing** — `utils/dates.ts` normalizes common US formats to ISO when possible.
5. **Follow RSS links** — If a page advertises an Atom/RSS alternate, the crawler fetches it.

## Extractors

| File | Source |
|------|--------|
| `parsers/json-ld.ts` | schema.org JSON-LD (with repair) |
| `parsers/microdata.ts` | `itemscope` Event microdata |
| `parsers/time-tags.ts` | `<time datetime>` + nearby title |
| `parsers/calendar-lists.ts` | Event/calendar card blocks |
| `parsers/tables.ts` | Schedule tables |
| `parsers/rss.ts` | RSS 2.0 / Atom |

## Adding a new event type

1. Add the id to `lib/constants/event-types.ts`
2. Add keyword rules in `crawler/extractors/classify.ts`
