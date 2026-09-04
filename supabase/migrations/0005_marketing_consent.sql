-- =============================================================================
-- Brandlify — marketing consent and unsubscribe
--
-- Section 30A of the Communications Law treats a promotional message as a
-- separate thing from a reply to an enquiry. The existing `consent` column is
-- the visitor agreeing to be called back about what they asked; it is not, and
-- must never be read as, agreement to receive advertising. So this is a second,
-- optional, independently recorded permission.
--
-- Four columns, and each one exists because the section asks for something:
--
--   marketing_consent      the permission itself, default false. A lead that
--                          did not tick the box is not marketable, and there is
--                          no way to become marketable retroactively.
--   marketing_consent_at   when it was given. The law puts the burden of
--                          proving consent on the sender, and a boolean with no
--                          timestamp proves nothing.
--   unsubscribed_at        withdrawal. Kept as a timestamp rather than flipping
--                          marketing_consent back to false, because the fact
--                          that consent was once given is part of the record
--                          and deleting it would destroy the evidence.
--   unsubscribe_token      the opt-out link's identifier. Random per lead, so a
--                          link cannot be guessed from an id or an address.
--
-- Deliberately NOT done here: nothing backfills marketing_consent to true for
-- the leads already in the table. They were collected under a consent notice
-- that said "we will get back to you", and treating that as advertising consent
-- is exactly the thing the section prohibits.
-- =============================================================================

alter table public.leads
  add column if not exists marketing_consent    boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists unsubscribed_at      timestamptz,
  add column if not exists unsubscribe_token    uuid not null default gen_random_uuid();

-- The token is the address of the opt-out page, so it has to be unique.
create unique index if not exists leads_unsubscribe_token_key
  on public.leads (unsubscribe_token);

-- Consent without a date is not provable consent.
alter table public.leads drop constraint if exists leads_marketing_consent_needs_date;
alter table public.leads
  add constraint leads_marketing_consent_needs_date
  check (not marketing_consent or marketing_consent_at is not null);

-- -----------------------------------------------------------------------------
-- Column-level privileges for anon.
--
-- The lead route writes with the service role, so the public grant is only a
-- fallback path. It was still `insert` on the whole table, which means anyone
-- holding the anon key could POST straight to PostgREST with
-- marketing_consent = true and a timestamp of their choosing, and manufacture a
-- consent record. Nobody would do it to help themselves, but the value of this
-- column is entirely that it is trustworthy, so the public role loses the
-- ability to write it at all.
-- -----------------------------------------------------------------------------
revoke insert on public.leads from anon;

grant insert (
  name,
  phone,
  email,
  business_type,
  services_interested,
  message,
  consent,
  source_page,
  utm_source,
  utm_medium,
  utm_campaign
) on public.leads to anon;

comment on column public.leads.marketing_consent is
  'Section 30A advertising consent. Separate from `consent`, which only covers replying to the enquiry. Never backfilled.';
comment on column public.leads.unsubscribed_at is
  'Set when the recipient opts out. Suppresses sending; marketing_consent is left as it was so the original permission stays on the record.';
