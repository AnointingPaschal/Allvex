-- ============================================================================
-- ALLVEX MEDIA STORAGE
-- Run this in Supabase SQL Editor AFTER schema.sql
-- Also create the bucket manually: Supabase Dashboard → Storage → New Bucket
-- Name: "allvex-media", Public: true
-- ============================================================================

-- Storage RLS policies (run after creating the bucket in the dashboard)
insert into storage.buckets (id, name, public) values ('allvex-media', 'allvex-media', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check (bucket_id = 'allvex-media' and auth.role() = 'authenticated');

-- Allow public to view
create policy "Public media is viewable"
  on storage.objects for select
  using (bucket_id = 'allvex-media');

-- Allow users to delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (bucket_id = 'allvex-media' and auth.uid() = owner);

-- Allow admins to delete any upload
create policy "Admins can delete any upload"
  on storage.objects for delete
  using (
    bucket_id = 'allvex-media'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
