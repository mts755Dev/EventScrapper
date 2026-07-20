export const SOURCE_TYPES = [
  "google",
  "calendar",
  "rss",
  "organization",
  "news",
  "athletics",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  google: "Google Search",
  calendar: "Event Calendar",
  rss: "RSS Feed",
  organization: "Organization Website",
  news: "News / Press Release",
  athletics: "Athletics Website",
};
