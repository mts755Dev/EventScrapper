/**
 * Event types — add new entries here to extend coverage.
 * Used for classification during extraction and dashboard filtering.
 */
export const EVENT_TYPES = [
  "football_game",
  "baseball_game",
  "basketball_game",
  "hockey_game",
  "soccer_match",
  "golf_tournament",
  "charity_golf_classic",
  "5k",
  "marathon",
  "walkathon",
  "gala",
  "fundraising_dinner",
  "silent_auction",
  "live_auction",
  "festival",
  "carnival",
  "homecoming",
  "alumni_event",
  "booster_club_event",
  "benefit_concert",
  "food_festival",
  "community_event",
  "other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  football_game: "Football Game",
  baseball_game: "Baseball Game",
  basketball_game: "Basketball Game",
  hockey_game: "Hockey Game",
  soccer_match: "Soccer Match",
  golf_tournament: "Golf Tournament",
  charity_golf_classic: "Charity Golf Classic",
  "5k": "5K",
  marathon: "Marathon",
  walkathon: "Walkathon",
  gala: "Gala",
  fundraising_dinner: "Fundraising Dinner",
  silent_auction: "Silent Auction",
  live_auction: "Live Auction",
  festival: "Festival",
  carnival: "Carnival",
  homecoming: "Homecoming",
  alumni_event: "Alumni Event",
  booster_club_event: "Booster Club Event",
  benefit_concert: "Benefit Concert",
  food_festival: "Food Festival",
  community_event: "Community Event",
  other: "Other",
};
