-- =============================================================================
-- Brandlify — storage
--
-- One public bucket for editorial media (project covers, galleries, post
-- covers, testimonial avatars). Public read because the images are served
-- straight into pages; writes only from an authenticated admin session.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

create policy "media_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "media_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "media_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
