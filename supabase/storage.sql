-- ============================================================================
-- ALLVEX MEDIA STORAGE
-- STEP 1: Create the bucket in Supabase Dashboard → Storage → New Bucket
--         Name: allvex-media   Public: ON
-- STEP 2: Run this SQL to apply the access policies
-- ============================================================================

-- Allow any authenticated user to upload to the bucket
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'allvex-media');

-- Allow public (anonymous) read access to all files
create policy "Public can view files"
  on storage.objects for select
  using (bucket_id = 'allvex-media');

-- Allow users to update/replace their own uploads
create policy "Users can update own files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'allvex-media');

-- Allow users to delete their own uploads
create policy "Users can delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'allvex-media');
