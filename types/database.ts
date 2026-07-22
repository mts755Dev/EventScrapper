export type CrawlJobStatus = "running" | "completed" | "failed";
export type CrawlLogStatus = "success" | "error" | "skipped";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CrawlError = {
  site: string;
  message: string;
};

export type Disposition = "none" | "accepted" | "declined";

/** Domain row types — use `type` (not interface) so they satisfy Supabase's Record<string, unknown>. */
export type Organization = {
  id: string;
  name: string;
  website: string | null;
  category: string;
  city: string | null;
  state: string;
  source: string | null;
  contacted: boolean;
  disposition: Disposition;
  created_at: string;
};

export type Event = {
  id: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  event_type: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  start_date: string | null;
  end_date: string | null;
  source_url: string | null;
  ticket_url: string | null;
  dedupe_hash: string;
  contacted: boolean;
  disposition: Disposition;
  is_lead: boolean;
  created_at: string;
  updated_at: string;
};

export type CrawlJob = {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: CrawlJobStatus;
  total_sites: number;
  total_events: number;
  errors: CrawlError[];
};

export type CrawlLog = {
  id: string;
  crawl_job_id: string;
  website: string;
  status: CrawlLogStatus;
  message: string | null;
  events_found: number;
  crawled_at: string;
};

export type Source = {
  id: string;
  name: string;
  url: string;
  type: string;
  state: string | null;
  active: boolean;
  last_crawled_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          category: string;
          city?: string | null;
          state: string;
          source?: string | null;
          contacted?: boolean;
          disposition?: Disposition;
          created_at?: string;
        };
        Update: Partial<Organization>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: {
          id?: string;
          organization_id?: string | null;
          title: string;
          description?: string | null;
          event_type?: string | null;
          venue?: string | null;
          city?: string | null;
          state?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          source_url?: string | null;
          ticket_url?: string | null;
          dedupe_hash: string;
          contacted?: boolean;
          disposition?: Disposition;
          is_lead?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Event>;
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      crawl_jobs: {
        Row: CrawlJob;
        Insert: {
          id?: string;
          started_at?: string;
          finished_at?: string | null;
          status: CrawlJobStatus;
          total_sites?: number;
          total_events?: number;
          errors?: Json;
        };
        Update: {
          id?: string;
          started_at?: string;
          finished_at?: string | null;
          status?: CrawlJobStatus;
          total_sites?: number;
          total_events?: number;
          errors?: Json;
        };
        Relationships: [];
      };
      crawl_logs: {
        Row: CrawlLog;
        Insert: {
          id?: string;
          crawl_job_id: string;
          website: string;
          status: CrawlLogStatus;
          message?: string | null;
          events_found?: number;
          crawled_at?: string;
        };
        Update: Partial<CrawlLog>;
        Relationships: [
          {
            foreignKeyName: "crawl_logs_crawl_job_id_fkey";
            columns: ["crawl_job_id"];
            isOneToOne: false;
            referencedRelation: "crawl_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: Source;
        Insert: {
          id?: string;
          name: string;
          url: string;
          type: string;
          state?: string | null;
          active?: boolean;
          last_crawled_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Source>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
