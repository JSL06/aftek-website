-- TEST_IMAGE_SYSTEM.sql
-- Simple test script to verify the image management system

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('media_files', 'page_backgrounds', 'storage_usage', 'storage_quotas', 'media_categories');

-- 2. Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('media_files', 'page_backgrounds', 'storage_usage', 'storage_quotas', 'media_categories')
ORDER BY table_name, ordinal_position;

-- 3. Check if data exists
SELECT 'media_files' as table_name, COUNT(*) as record_count FROM media_files
UNION ALL
SELECT 'page_backgrounds' as table_name, COUNT(*) as record_count FROM page_backgrounds
UNION ALL
SELECT 'storage_usage' as table_name, COUNT(*) as record_count FROM storage_usage
UNION ALL
SELECT 'storage_quotas' as table_name, COUNT(*) as record_count FROM storage_quotas
UNION ALL
SELECT 'media_categories' as table_name, COUNT(*) as record_count FROM media_categories;

-- 4. Test the check_storage_quota function
SELECT * FROM check_storage_quota('media');

-- 5. Check RLS policies
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
WHERE tablename IN ('media_files', 'page_backgrounds', 'storage_usage', 'storage_quotas', 'media_categories');

-- 6. Check views
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('media_library_view', 'page_backgrounds_view');
