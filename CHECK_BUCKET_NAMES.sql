-- =====================================================
-- CHECK ALL AVAILABLE BUCKET NAMES
-- =====================================================
-- This will show you exactly what buckets exist and their names

-- List all storage buckets
SELECT 
  'Available buckets' as info,
  name as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Check if there are any buckets with similar names
SELECT 
  'Similar names' as info,
  name as bucket_name,
  public
FROM storage.buckets
WHERE name LIKE '%article%' 
   OR name LIKE '%image%'
   OR name LIKE '%media%'
   OR name LIKE '%upload%'
ORDER BY name;

-- Check if there are any existing image buckets
SELECT 
  'Image buckets' as info,
  name as bucket_name,
  public,
  file_size_limit
FROM storage.buckets
WHERE allowed_mime_types IS NOT NULL 
  AND allowed_mime_types::text LIKE '%image%'
ORDER BY name;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- You should see:
-- 1. A bucket named exactly "article-images"
-- 2. It should be public = true
-- 3. It should have file_size_limit = 10485760 (10MB)
-- 4. It should have allowed_mime_types = ["image/*"]
-- =====================================================
