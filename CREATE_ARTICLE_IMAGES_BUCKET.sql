-- Create article-images storage bucket for article images

-- Check if bucket already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'article-images') THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'article-images',
            'article-images',
            true, -- public bucket
            52428800, -- 50MB file size limit
            ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        );
        
        RAISE NOTICE 'Created article-images storage bucket';
    ELSE
        RAISE NOTICE 'article-images bucket already exists';
    END IF;
END $$;

-- Set up storage policies using the correct Supabase syntax
-- Allow public read access
CREATE POLICY "Public read access for article images" ON storage.objects
    FOR SELECT USING (bucket_id = 'article-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload article images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update article images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete article images" ON storage.objects
    FOR DELETE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Verify the bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'article-images';
