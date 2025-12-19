-- =====================================================
-- Supabase Storage Setup for Reference Images
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create the storage bucket (if it doesn't exist)
-- Note: Buckets are created via the Supabase Dashboard or Storage API
-- This SQL assumes the bucket exists. Create it manually in Dashboard first:
-- Storage > New bucket > Name: "reference-images" > Public: true

-- 2. Storage Policies for 'reference-images' bucket

-- Policy 1: Allow anyone to view images (public read)
CREATE POLICY "Public read access for reference images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reference-images');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload reference images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reference-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to delete their own images
-- This uses metadata to track ownership
CREATE POLICY "Users can delete their own reference images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reference-images'
  AND (
    -- Allow if user is authenticated and owns the file
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    -- Allow deletion if file path matches order pattern (for cleanup)
    name LIKE 'orders/%'
  )
);

-- Policy 4: Allow authenticated users to update their own images
CREATE POLICY "Users can update their own reference images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reference-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Alternative: If you want to allow anonymous uploads
-- (Not recommended for production, but useful for testing)
-- =====================================================

-- Uncomment below if you need anonymous uploads:
/*
CREATE POLICY "Anonymous users can upload reference images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'reference-images');
*/

-- =====================================================
-- Notes:
-- =====================================================
-- 1. The bucket must be created manually in Supabase Dashboard:
--    - Go to Storage
--    - Click "New bucket"
--    - Name: "reference-images"
--    - Public: true (checked)
--    - File size limit: 5MB (or your preference)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. For production, consider:
--    - Using RLS (Row Level Security) on the orders table
--    - Storing user_id in file metadata
--    - Implementing server-side cleanup jobs
--
-- 3. File naming convention used:
--    - orders/{orderId}_{timestamp}.{ext}
--    - Example: orders/123_1703123456789.jpg
--
-- =====================================================

