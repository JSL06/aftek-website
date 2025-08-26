-- Check what storage buckets exist in Supabase

-- List all storage buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Check if article-images bucket exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'article-images') 
        THEN 'article-images bucket EXISTS' 
        ELSE 'article-images bucket DOES NOT EXIST' 
    END as bucket_status;

-- Check if project-images bucket exists (since projects work)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'project-images') 
        THEN 'project-images bucket EXISTS' 
        ELSE 'project-images bucket DOES NOT EXIST' 
    END as bucket_status;
