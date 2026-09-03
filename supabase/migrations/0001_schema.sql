-- =============================================================================
-- Brandlify — schema
-- Content tables are read by the public site; `leads` is write-only for the
-- public. Row level security lives in 0002_rls.sql.
-- =============================================================================

create extension if not exists pgcrypto;

-- Slugs are the URL contract: lowercase, ascii, hyphen separated.
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(value) between 2 and 80);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- projects — portfolio / case studies
-- -----------------------------------------------------------------------------
create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  slug           public.slug not null unique,
  business_name  text not null check (char_length(business_name) between 1 and 120),
  category       text not null check (char_length(category) between 1 and 60),
  description    text,
  challenge      text,
  solution       text,
  results        text,
  services       text[] not null default '{}',
  cover_image    text,
  gallery        text[] not null default '{}',
  live_url       text check (live_url is null or live_url ~* '^https?://'),
  featured       boolean not null default false,
  published      boolean not null default false,
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projects_published_order_idx
  on public.projects (order_index, created_at desc)
  where published;

create index projects_featured_idx
  on public.projects (order_index)
  where published and featured;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- posts — blog
-- -----------------------------------------------------------------------------
create table public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             public.slug not null unique,
  title            text not null check (char_length(title) between 1 and 200),
  excerpt          text check (char_length(excerpt) <= 400),
  content_mdx      text,
  cover_image      text,
  category         text,
  reading_time     integer check (reading_time is null or reading_time between 1 and 120),
  published        boolean not null default false,
  published_at     timestamptz,
  seo_title        text check (char_length(seo_title) <= 70),
  seo_description  text check (char_length(seo_description) <= 200),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- A published post must be dated: the sitemap and the article schema need it.
  constraint posts_published_needs_date check (not published or published_at is not null)
);

create index posts_published_idx
  on public.posts (published_at desc)
  where published;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- testimonials — never seeded, only ever real and approved
-- -----------------------------------------------------------------------------
create table public.testimonials (
  id             uuid primary key default gen_random_uuid(),
  client_name    text not null check (char_length(client_name) between 1 and 120),
  business_name  text,
  avatar         text,
  rating         smallint check (rating is null or rating between 1 and 5),
  content        text not null check (char_length(content) between 1 and 1200),
  project_id     uuid references public.projects (id) on delete set null,
  approved       boolean not null default false,
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index testimonials_approved_order_idx
  on public.testimonials (order_index, created_at desc)
  where approved;

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
create table public.services (
  id             uuid primary key default gen_random_uuid(),
  slug           public.slug not null unique,
  title          text not null check (char_length(title) between 1 and 80),
  short_desc     text not null check (char_length(short_desc) between 1 and 300),
  icon           text,
  full_content   text,
  benefits       text[] not null default '{}',
  -- [{ "title": "...", "description": "..." }, ...]
  process_steps  jsonb not null default '[]'::jsonb check (jsonb_typeof(process_steps) = 'array'),
  -- [{ "question": "...", "answer": "..." }, ...]
  faq            jsonb not null default '[]'::jsonb check (jsonb_typeof(faq) = 'array'),
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index services_order_idx on public.services (order_index);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- faqs — the home page accordion.
--
-- Not in the original spec, which only gave services.faq (per-service). §6.13
-- needs a site-level FAQ that the admin can edit and that feeds the
-- Schema.org FAQPage block; hanging it off site_content would make it
-- un-editable as a list. One small table is the cheaper answer.
-- -----------------------------------------------------------------------------
create table public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null check (char_length(question) between 1 and 300),
  answer       text not null check (char_length(answer) between 1 and 2000),
  order_index  integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index faqs_published_order_idx
  on public.faqs (order_index)
  where published;

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- leads
-- -----------------------------------------------------------------------------
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost');

create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 2 and 80),
  phone                text not null check (char_length(phone) between 9 and 20),
  email                text check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  business_type        text check (char_length(business_type) <= 80),
  services_interested  text[] not null default '{}'
                         check (coalesce(array_length(services_interested, 1), 0) <= 10),
  message              text check (char_length(message) <= 2000),
  -- Proof of consent is stored with the lead, not inferred. The Privacy
  -- Protection Law (and Amendment 13, in force since August 2025) makes the
  -- controller accountable for showing that consent was given.
  consent              boolean not null check (consent),
  consent_at           timestamptz not null default now(),
  source_page          text check (char_length(source_page) <= 300),
  utm_source           text check (char_length(utm_source) <= 120),
  utm_medium           text check (char_length(utm_medium) <= 120),
  utm_campaign         text check (char_length(utm_campaign) <= 200),
  status               public.lead_status not null default 'new',
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status, created_at desc);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- site_content — editable copy that is not worth its own table
-- -----------------------------------------------------------------------------
create table public.site_content (
  key         text primary key check (key ~ '^[a-z0-9_]+(\.[a-z0-9_]+)*$'),
  value_json  jsonb not null,
  updated_at  timestamptz not null default now()
);

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();
