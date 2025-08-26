-- =====================================================
-- DIAGNOSE UPLOAD ISSUE
-- =====================================================
-- Run this to see what's wrong with the image upload

-- 1. Check if the bucket exists at all
SELECT 'Bucket exists' as status, name, public 
FROM storage.buckets 
WHERE name = 'article-images';

-- 2. If bucket doesn't exist, this will show nothing
-- If bucket exists, this will show the bucket details

-- 3. Check if you have any storage buckets at all
SELECT 'All buckets' as status, name, public, file_size_limit
FROM storage.buckets;

-- 4. Check if storage extension is enabled
SELECT 'Storage extension' as status, extname, extversion
FROM pg_extension 
WHERE extname = 'storage';

-- 5. Check if you can access storage schema
SELECT 'Storage schema access' as status, 
       has_schema_privilege(current_user, 'storage', 'USAGE') as can_access;

-- =====================================================
-- WHAT TO LOOK FOR:
-- =====================================================
-- 1. Should show "article-images" bucket with public = true
-- 2. Should show storage extension is enabled
-- 3. Should show you have access to storage schema
-- =====================================================
