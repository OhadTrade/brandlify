/**
 * Database types.
 *
 * Hand-written to match supabase/migrations/*.sql, then checked column by
 * column (name, type and nullability) against the live schema — they agree.
 *
 * Supabase's own generator is currently blocked by the organisation's egress
 * restriction. Once that clears, replace this file wholesale with:
 *   npx supabase gen types typescript --project-id vbygwvgxljgvwelpltnv > src/lib/supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type ProjectRow = Timestamps & {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  description: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  services: string[];
  cover_image: string | null;
  gallery: string[];
  live_url: string | null;
  featured: boolean;
  published: boolean;
  order_index: number;
};

export type PostRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_mdx: string | null;
  cover_image: string | null;
  category: string | null;
  reading_time: number | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type TestimonialRow = Timestamps & {
  id: string;
  client_name: string;
  business_name: string | null;
  avatar: string | null;
  rating: number | null;
  content: string;
  project_id: string | null;
  approved: boolean;
  order_index: number;
};

export type ServiceStep = { title: string; description: string };
export type ServiceFaq = { question: string; answer: string };

export type ServiceRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  short_desc: string;
  icon: string | null;
  full_content: string | null;
  benefits: string[];
  process_steps: Json;
  faq: Json;
  order_index: number;
};

export type FaqRow = Timestamps & {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  published: boolean;
};

export type LeadRow = Timestamps & {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  business_type: string | null;
  services_interested: string[];
  message: string | null;
  consent: boolean;
  consent_at: string;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: LeadStatus;
  notes: string | null;
};

/** What the public form is allowed to send. `status` and `notes` are excluded
 *  by the RLS insert policy, not just by this type. */
export type LeadInsert = {
  name: string;
  phone: string;
  email?: string | null;
  business_type?: string | null;
  services_interested?: string[];
  message?: string | null;
  consent: true;
  source_page?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

export type SiteContentRow = {
  key: string;
  value_json: Json;
  updated_at: string;
};

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      projects: TableDef<ProjectRow>;
      posts: TableDef<PostRow>;
      testimonials: TableDef<TestimonialRow>;
      services: TableDef<ServiceRow>;
      faqs: TableDef<FaqRow>;
      leads: TableDef<LeadRow, LeadInsert>;
      site_content: TableDef<SiteContentRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: { lead_status: LeadStatus };
    CompositeTypes: Record<never, never>;
  };
};
