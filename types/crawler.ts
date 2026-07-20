export interface RawEvent {
  title: string;
  description?: string;
  event_type?: string;
  venue?: string;
  city?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  source_url: string;
  ticket_url?: string;
}

export interface DiscoveredOrganization {
  name: string;
  website?: string;
  category?: string;
  city?: string;
  state?: string;
  source: string;
}

export interface FetchResult {
  url: string;
  html: string;
  status: number;
  fetcher: "cheerio" | "playwright";
  contentType?: string;
}

export interface CrawlSiteResult {
  website: string;
  status: "success" | "error" | "skipped";
  message?: string;
  events_found: number;
  events: RawEvent[];
  organizations: DiscoveredOrganization[];
  /** Calendar/RSS links found on the page, ready to become new sources */
  source_candidates?: Array<{
    name: string;
    url: string;
    type: string;
    state?: string | null;
  }>;
}
