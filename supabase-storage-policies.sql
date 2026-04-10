-- ============================================
-- Supabase Storage RLS Policies for 'images' bucket
-- Run these in Supabase SQL Editor to fix upload issues
-- ============================================

-- 1. Allow public read access to all images
CREATE POLICY "Public read access for images bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 2. Allow authenticated users to upload to their own folders
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 3. Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- 4. Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- 5. Allow anonymous (public) users to upload (if needed for guest checkout)
-- OPTIONAL: Only enable if you need guest users to upload
-- CREATE POLICY "Allow anonymous uploads"
-- ON storage.objects FOR INSERT
-- TO anon
-- WITH CHECK (bucket_id = 'images');

-- ============================================
-- How to apply these policies:
-- ============================================
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor (left sidebar)
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- ============================================

-- ============================================
-- Alternative: Disable RLS (NOT RECOMMENDED for production)
-- ============================================
-- If you want to disable RLS temporarily for testing:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
--
-- WARNING: This makes ALL storage publicly writable!
-- Only use for testing, then re-enable with proper policies
-- ============================================
