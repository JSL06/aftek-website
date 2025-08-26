-- =====================================================
-- CREATE ARTICLE-IMAGES BUCKET
-- =====================================================
-- This will create the missing bucket and set up proper policies

-- 1. Create the article-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,  -- Make it public so images can be viewed
  52428800,  -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policy to allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to article-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- 3. Create policy to allow public viewing of images
CREATE POLICY IF NOT EXISTS "Allow public viewing of article-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- 4. Create policy to allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated updates to article-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images');

-- 5. Create policy to allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes from article-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- 6. Verify the bucket was created
SELECT 
  'Bucket creation result:' as info,
  name as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'article-images';

-- 7. Show all policies for the bucket
SELECT 
  'Policies for article-images:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
