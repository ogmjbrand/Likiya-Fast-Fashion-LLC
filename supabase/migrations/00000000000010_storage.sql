-- Storage buckets for product media, avatars, and CMS assets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('cms-assets', 'cms-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_staff_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_staff_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_staff_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_staff());

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cms_assets_public_read" on storage.objects
  for select using (bucket_id = 'cms-assets');
create policy "cms_assets_staff_write" on storage.objects
  for all using (bucket_id = 'cms-assets' and public.is_staff())
  with check (bucket_id = 'cms-assets' and public.is_staff());
