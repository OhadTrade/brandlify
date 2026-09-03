# Supabase

## Applying to a fresh project

Everything the database needs is in this folder. On a new project, run the
migrations in order in the SQL editor, then the seed:

1. `migrations/0001_schema.sql` — tables, enum, indexes, `updated_at` triggers
2. `migrations/0002_rls.sql` — privileges and row level security policies
3. `migrations/0003_storage.sql` — the `media` bucket and its policies
4. `migrations/0004_harden_trigger_function.sql` — closes the RPC route on the
   trigger function (Supabase's security advisor flags this otherwise)
5. `seed.sql` — services, FAQ and core copy. Idempotent, safe to re-run.

Then put the project URL and anon key in `.env.local`, and the service_role key
from **Project Settings → API** (needed from stage 8 onward).

## seed.sql is generated

Do not edit it. The copy lives in `src/content/{services,faqs,site-content}.ts`
and the SQL is produced from it:

```bash
npm run seed:sql
```

The same files are the offline fallback the site renders when the database is
unreachable, so generating the SQL is what keeps the two from drifting.

## Verifying RLS

```bash
npm run rls
```

Hits the REST API with the real anon key — the same credential that ships in the
browser bundle — and asserts the whole contract: reference data readable,
unpublished content invisible, `leads` unreadable by any route, valid lead
inserts accepted, and forged `status` / `notes` / missing-consent inserts
rejected. It exits non-zero on any failure.

If the organisation is over its egress quota the REST API returns HTTP 402 for
every request and this script cannot run. The same contract can be checked
through the Management API by running each statement under `set local role anon`.

## The contract

| Table | anon | authenticated |
| --- | --- | --- |
| `projects`, `posts` | SELECT where `published` | full |
| `testimonials` | SELECT where `approved` | full |
| `services`, `faqs`, `site_content` | SELECT | full |
| `leads` | **INSERT only** — no SELECT privilege at all | full |

The lead insert policy additionally pins `status = 'new'`, `notes is null` and
`consent = true`, so a crafted request cannot forge pipeline state or store a
lead without recorded consent.
