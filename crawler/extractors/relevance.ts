import type { RawEvent } from "@/types/crawler";
import type { EventType } from "@/lib/constants/event-types";

/** Event types that are strong raffle / ticket-sales opportunities. */
const HIGH_VALUE_TYPES = new Set<EventType>([
  "charity_golf_classic",
  "golf_tournament",
  "football_game",
  "baseball_game",
  "basketball_game",
  "hockey_game",
  "soccer_match",
  "5k",
  "marathon",
  "walkathon",
  "silent_auction",
  "live_auction",
  "fundraising_dinner",
  "gala",
  "benefit_concert",
  "food_festival",
  "festival",
  "carnival",
  "homecoming",
  "alumni_event",
  "booster_club_event",
  "community_event",
]);

/**
 * Positive signals for NGO / nonprofit / fundraising / ticketed venues
 * where 50/50 raffles or ticket sales make sense.
 */
const POSITIVE_PATTERNS: RegExp[] = [
  /\bnonprofit\b/i,
  /\bnon[\s-]?profit\b/i,
  /\b501\s*\(?\s*c\s*\)?\s*3\b/i,
  /\bcharity\b/i,
  /\bcharitable\b/i,
  /\bfundraiser\b/i,
  /\bfund[\s-]?rais/i,
  /\bbenefit\b/i,
  /\bgala\b/i,
  /\bauction\b/i,
  /\braffle\b/i,
  /\b50[\s/]?50\b/i,
  /\bbooster\b/i,
  /\bfoundation\b/i,
  /\bhospice\b/i,
  /\bpta\b/i,
  /\bpto\b/i,
  /\bvolunteer\b/i,
  /\bdonation\b/i,
  /\bticket\b/i,
  /\badmission\b/i,
  /\bgate\s+opens\b/i,
  /\bin[\s-]?person\b/i,
  /\bcommunity\b/i,
  /\bfestival\b/i,
  /\bcarnival\b/i,
  /\bfair\b/i,
  /\b5\s*-?\s*k\b/i,
  /\bwalkathon\b/i,
  /\bmarathon\b/i,
  /\bgolf\b/i,
  /\bgame\b/i,
  /\bvs\.?\b/i,
  /\bhomecoming\b/i,
  /\balumni\b/i,
];

/**
 * Administrative / educational / low-value listings that flood city calendars
 * and are not raffle or ticket-sales opportunities.
 */
const NEGATIVE_PATTERNS: RegExp[] = [
  /\bclass(es)?\b/i,
  /\bworkshop\b/i,
  /\bseminar\b/i,
  /\bwebinar\b/i,
  /\btraining\b/i,
  /\borientation\b/i,
  /\binformation\s+(table|session|booth)\b/i,
  /\binfo\s+(session|table)\b/i,
  /\bcouncil\s+meeting\b/i,
  /\bboard\s+meeting\b/i,
  /\bcommittee\s+meeting\b/i,
  /\bpublic\s+hearing\b/i,
  /\btown\s+hall\s+meeting\b/i,
  /\bstory\s*time\b/i,
  /\bstorytime\b/i,
  /\blibrary\s+hours\b/i,
  /\bsoftware\b/i,
  /\bcomputer\s+basics\b/i,
  /\byoga\b/i,
  /\bzumba\b/i,
  /\bpickleball\s+open\s+play\b/i,
  /\bdrop[\s-]?in\b/i,
  /\bcancelled\b/i,
  /\bcanceled\b/i,
  /\bvirtual\s+only\b/i,
  /\bonline\s+only\b/i,
  /\bzoom\b/i,
  /\bclosed\s+for\b/i,
  /\bholiday\s+hours\b/i,
  /\boffice\s+closed\b/i,
];

function utcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function parseEventDay(value?: string): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return utcDay(date.getTime());
}

/**
 * Keep only events that are today or in the future.
 * Uses end_date when present (multi-day festivals), otherwise start_date.
 * Events with no usable date are dropped — we cannot verify they are upcoming.
 */
export function isUpcomingEvent(
  event: Pick<RawEvent, "start_date" | "end_date">,
  now = new Date()
): boolean {
  const today = utcDay(now.getTime());

  const endDay = parseEventDay(event.end_date);
  if (endDay !== null && endDay >= today) return true;

  const startDay = parseEventDay(event.start_date);
  if (startDay !== null && startDay >= today) return true;

  return false;
}

/**
 * True when the listing looks like an NGO / nonprofit / fundraising /
 * ticketed community or sports opportunity suitable for raffle sales.
 */
export function isRaffleRelevantEvent(event: RawEvent): boolean {
  const type = (event.event_type ?? "other") as EventType;
  const haystack = `${event.title}\n${event.description ?? ""}\n${event.venue ?? ""}`;

  if (NEGATIVE_PATTERNS.some((p) => p.test(haystack))) {
    // Allow override when clearly a fundraiser despite a weak word match
    const strongFundraiser =
      /\b(fundrais|charity|benefit|gala|auction|raffle|50[\s/]?50)\b/i.test(
        haystack
      );
    if (!strongFundraiser) return false;
  }

  if (HIGH_VALUE_TYPES.has(type) && type !== "other") {
    return true;
  }

  return POSITIVE_PATTERNS.some((p) => p.test(haystack));
}

/** Combined crawl ingest gate — upcoming + raffle-relevant. */
export function shouldPersistEvent(event: RawEvent, now = new Date()): boolean {
  return isUpcomingEvent(event, now) && isRaffleRelevantEvent(event);
}
