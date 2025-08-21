-- SETUP_STORAGE_BUCKET.sql
-- This script sets up the media storage bucket and policies safely

-- 1. Create the media storage bucket (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'media') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'media',
            'media',
            true,
            10485760, -- 10MB in bytes
            ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        );
        RAISE NOTICE 'Media bucket created successfully';
    ELSE
        RAISE NOTICE 'Media bucket already exists';
    END IF;
END $$;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- 3. Create new storage policies
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own uploads" ON storage.objects
    FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own uploads" ON storage.objects
    FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Verify the setup
SELECT 
    'Bucket Status' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'media') 
        THEN '✅ Media bucket exists' 
        ELSE '❌ Media bucket missing' 
    END as status
UNION ALL
SELECT 
    'Policies Status' as check_type,
    CASE 
        WHEN COUNT(*) = 4 
        THEN '✅ All 4 policies created' 
        ELSE '❌ Only ' || COUNT(*) || ' policies found' 
    END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname IN ('Public Access', 'Authenticated users can upload', 'Users can update own uploads', 'Users can delete own uploads');
