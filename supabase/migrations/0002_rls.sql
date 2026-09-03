-- =============================================================================
-- Brandlify — row level security
--
-- The contract:
--   projects, posts   public SELECT only where published
--   testimonials      public SELECT only where approved
--   services, faqs,
--   site_content      public SELECT
--   leads             public INSERT only. NO public SELECT, ever.
--   everything        writes restricted to authenticated
--
-- Table privileges are revoked as well as policy-gated, so a future permissive
-- policy cannot on its own open a table up.
-- =============================================================================

alter table public.projects      enable row level security;
alter table public.posts         enable row level security;
alter table public.testimonials  enable row level security;
alter table public.services      enable row level security;
alter table public.faqs          enable row level security;
alter table public.leads         enable row level security;
alter table public.site_content  enable row level security;

-- -----------------------------------------------------------------------------
-- Privileges. Start from nothing and grant back deliberately.
-- -----------------------------------------------------------------------------
revoke all on public.projects, public.posts, public.testimonials, public.services,
              public.faqs, public.leads, public.site_content
  from anon, authenticated;

grant select on public.projects, public.posts, public.testimonials, public.services,
                public.faqs, public.site_content
  to anon, authenticated;

-- The public may create a lead and nothing else — not read, not update, not delete.
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;

grant insert, update, delete on public.projects, public.posts, public.testimonials,
                                public.services, public.faqs, public.site_content
  to authenticated;

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
create policy "projects_public_select_published"
  on public.projects for select to anon
  using (published);

create policy "projects_auth_select_all"
  on public.projects for select to authenticated
  using (true);

create policy "projects_auth_insert" on public.projects for insert to authenticated with check (true);
create policy "projects_auth_update" on public.projects for update to authenticated using (true) with check (true);
create policy "projects_auth_delete" on public.projects for delete to authenticated using (true);

-- -----------------------------------------------------------------------------
-- posts
-- -----------------------------------------------------------------------------
create policy "posts_public_select_published"
  on public.posts for select to anon
  using (published);

create policy "posts_auth_select_all"
  on public.posts for select to authenticated
  using (true);

create policy "posts_auth_insert" on public.posts for insert to authenticated with check (true);
create policy "posts_auth_update" on public.posts for update to authenticated using (true) with check (true);
create policy "posts_auth_delete" on public.posts for delete to authenticated using (true);

-- -----------------------------------------------------------------------------
-- testimonials
-- -----------------------------------------------------------------------------
create policy "testimonials_public_select_approved"
  on public.testimonials for select to anon
  using (approved);

create policy "testimonials_auth_select_all"
  on public.testimonials for select to authenticated
  using (true);

create policy "testimonials_auth_insert" on public.testimonials for insert to authenticated with check (true);
create policy "testimonials_auth_update" on public.testimonials for update to authenticated using (true) with check (true);
create policy "testimonials_auth_delete" on public.testimonials for delete to authenticated using (true);

-- -----------------------------------------------------------------------------
-- services / faqs / site_content — public reference data
-- -----------------------------------------------------------------------------
create policy "services_public_select" on public.services for select to anon, authenticated using (true);
create policy "services_auth_insert" on public.services for insert to authenticated with check (true);
create policy "services_auth_update" on public.services for update to authenticated using (true) with check (true);
create policy "services_auth_delete" on public.services for delete to authenticated using (true);

create policy "faqs_public_select_published" on public.faqs for select to anon using (published);
create policy "faqs_auth_select_all" on public.faqs for select to authenticated using (true);
create policy "faqs_auth_insert" on public.faqs for insert to authenticated with check (true);
create policy "faqs_auth_update" on public.faqs for update to authenticated using (true) with check (true);
create policy "faqs_auth_delete" on public.faqs for delete to authenticated using (true);

create policy "site_content_public_select" on public.site_content for select to anon, authenticated using (true);
create policy "site_content_auth_insert" on public.site_content for insert to authenticated with check (true);
create policy "site_content_auth_update" on public.site_content for update to authenticated using (true) with check (true);
create policy "site_content_auth_delete" on public.site_content for delete to authenticated using (true);

-- -----------------------------------------------------------------------------
-- leads — the one table that must never leak
--
-- There is deliberately NO select policy for anon. Combined with the revoked
-- SELECT privilege above, a lead cannot be read with the anon key by any route.
--
-- The insert policy also pins the two columns the public has no business
-- setting: a submitted lead is always `new` and always has empty notes, so a
-- crafted request cannot forge pipeline state.
-- -----------------------------------------------------------------------------
create policy "leads_public_insert"
  on public.leads for insert to anon
  with check (consent and status = 'new' and notes is null);

create policy "leads_auth_select" on public.leads for select to authenticated using (true);
create policy "leads_auth_insert" on public.leads for insert to authenticated with check (true);
create policy "leads_auth_update" on public.leads for update to authenticated using (true) with check (true);
create policy "leads_auth_delete" on public.leads for delete to authenticated using (true);
