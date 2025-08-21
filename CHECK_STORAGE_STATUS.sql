-- CHECK_STORAGE_STATUS.sql
-- This script checks the current status of storage buckets and policies

-- Check if the media bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'media';

-- Check existing storage policies
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
AND schemaname = 'storage';

-- Check if media_files table exists and has data
SELECT 
    COUNT(*) as total_files,
    COUNT(CASE WHEN file_path LIKE 'media/%' THEN 1 END) as media_bucket_files
FROM media_files;

-- Check storage usage
SELECT 
    pg_size_pretty(SUM(file_size)) as total_size,
    COUNT(*) as file_count
FROM media_files;
