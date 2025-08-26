-- =====================================================
-- TEST STORAGE BUCKET SETUP
-- =====================================================
-- Run this script to verify your storage bucket is set up correctly

-- 1. Check if the storage bucket exists
SELECT 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'article-images';

-- 2. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%article-images%';

-- 3. Check if you can list files in the bucket
-- This will show any existing files
SELECT 
  name,
  metadata,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'article-images'
ORDER BY updated_at DESC
LIMIT 10;

-- 4. Test bucket permissions (this should work if bucket exists and is public)
-- If this fails, the bucket doesn't exist or has wrong permissions
SELECT 
  bucket_id,
  name,
  metadata
FROM storage.objects 
WHERE bucket_id = 'article-images' 
LIMIT 1;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- Query 1 should show:
-- - name: article-images
-- - public: true
-- - file_size_limit: 10485760 (10MB)
-- - allowed_mime_types: ["image/*"]

-- Query 2 should show 4 policies for INSERT, SELECT, UPDATE, DELETE

-- Query 3 might be empty if no files uploaded yet

-- Query 4 should not give an error if bucket exists
-- =====================================================
