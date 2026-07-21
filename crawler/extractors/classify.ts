import { EVENT_TYPES, type EventType } from "@/lib/constants/event-types";

/**
 * Keyword rules — first match wins (more specific patterns first).
 * Easy to extend: add a row, no schema change.
 */
const RULES: Array<{ type: EventType; patterns: RegExp[] }> = [
  {
    type: "silent_auction",
    patterns: [/silent\s+auction/i, /\braffle\b/i, /\b50[\s/]?50\b/i],
  },
  {
    type: "charity_golf_classic",
    patterns: [/charity\s+golf/i, /golf\s+classic/i, /golf\s+outing/i],
  },
  {
    type: "golf_tournament",
    patterns: [/golf\s+tournament/i, /\bgolf\b/i],
  },
  {
    type: "football_game",
    patterns: [/\bfootball\b/i, /\bgridiron\b/i],
  },
  {
    type: "baseball_game",
    patterns: [/baseball/i, /\bmlb\b/i, /minor\s+league/i],
  },
  {
    type: "basketball_game",
    patterns: [/basketball/i, /\bnba\b/i],
  },
  {
    type: "hockey_game",
    patterns: [/hockey/i, /\bnhl\b/i],
  },
  {
    type: "soccer_match",
    patterns: [/soccer/i, /\bmls\b/i, /football\s+match/i],
  },
  {
    type: "5k",
    patterns: [/\b5\s*-?\s*k\b/i, /\b5k\b/i, /fun\s*run/i],
  },
  {
    type: "marathon",
    patterns: [/marathon/i, /half[\s-]marathon/i],
  },
  {
    type: "walkathon",
    patterns: [/walk[\s-]?a[\s-]?thon/i, /\bwalkathon\b/i],
  },
  {
    type: "live_auction",
    patterns: [/live\s+auction/i],
  },
  {
    type: "fundraising_dinner",
    patterns: [/fundraising\s+dinner/i, /benefit\s+dinner/i, /charity\s+dinner/i],
  },
  {
    type: "gala",
    patterns: [/\bgala\b/i, /black\s+tie/i],
  },
  {
    type: "benefit_concert",
    patterns: [/benefit\s+concert/i, /charity\s+concert/i],
  },
  {
    type: "food_festival",
    patterns: [/food\s+festival/i, /food\s+truck/i, /taste\s+of\b/i],
  },
  {
    type: "festival",
    patterns: [/festival/i, /fest\b/i],
  },
  {
    type: "carnival",
    patterns: [/carnival/i, /fair\b/i],
  },
  {
    type: "homecoming",
    patterns: [/homecoming/i],
  },
  {
    type: "alumni_event",
    patterns: [/alumni/i, /reunion/i],
  },
  {
    type: "booster_club_event",
    patterns: [/booster\s+club/i, /\bboosters?\b/i],
  },
  {
    type: "community_event",
    patterns: [/community\s+event/i, /town\s+hall/i, /open\s+house/i],
  },
];

export function classifyEventType(
  title: string,
  description?: string
): EventType {
  const haystack = `${title}\n${description ?? ""}`;

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) {
      return rule.type;
    }
  }

  return "other";
}

export function isKnownEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}
