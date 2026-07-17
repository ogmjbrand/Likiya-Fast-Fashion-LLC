-- Storage buckets for product media, avatars, and CMS assets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('cms-assets', 'cms-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- These buckets are `public = true`, so the actual files are already
-- fetchable by anyone via their public CDN URL — that's independent of RLS.
-- The `for select` policy below instead governs the storage *listing* API
-- (enumerating objects in the bucket), which has no reason to be open to
-- unauthenticated callers; restrict it to staff.
create policy "product_images_staff_list" on storage.objects
  for select using (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_staff_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_staff_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_staff_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_staff());

create policy "avatars_owner_or_staff_list" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_staff())
  );
create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "cms_assets_staff_list" on storage.objects
  for select using (bucket_id = 'cms-assets' and public.is_staff());
create policy "cms_assets_staff_write" on storage.objects
  for all using (bucket_id = 'cms-assets' and public.is_staff())
  with check (bucket_id = 'cms-assets' and public.is_staff());
