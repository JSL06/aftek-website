-- Fix Missing Storage Policies for WYSIWYG Editor
-- Run this script in your Supabase SQL Editor

-- First, let's check what policies already exist
SELECT 'Current policies:' as info;
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Now let's add the missing policies (only if they don't exist)

-- Policy: Public read access to editor images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Public read access to editor images'
  ) THEN
    CREATE POLICY "Public read access to editor images" ON storage.objects
    FOR SELECT USING (bucket_id = 'editor-images');
    RAISE NOTICE 'Created: Public read access policy';
  ELSE
    RAISE NOTICE 'Policy already exists: Public read access';
  END IF;
END $$;

-- Policy: Authenticated users can upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload editor images'
  ) THEN
    CREATE POLICY "Authenticated users can upload editor images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'editor-images' 
      AND auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Created: Upload policy for authenticated users';
  ELSE
    RAISE NOTICE 'Policy already exists: Upload policy';
  END IF;
END $$;

-- Policy: Users can update their own uploaded images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Users can update their own editor images'
  ) THEN
    CREATE POLICY "Users can update their own editor images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'editor-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
    RAISE NOTICE 'Created: Update policy for own images';
  ELSE
    RAISE NOTICE 'Policy already exists: Update policy';
  END IF;
END $$;

-- Policy: Users can delete their own uploaded images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Users can delete their own editor images'
  ) THEN
    CREATE POLICY "Users can delete their own editor images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'editor-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
    RAISE NOTICE 'Created: Delete policy for own images';
  ELSE
    RAISE NOTICE 'Policy already exists: Delete policy';
  END IF;
END $$;

-- Verify the policies were created
SELECT 'Final policy count:' as info;
SELECT COUNT(*) as total_policies FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT 'All storage policies:' as info;
SELECT policyname, cmd, permissive FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Test if you can now upload (this should work if policies are correct)
SELECT 
  'Upload Test' as test,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_policies 
               WHERE tablename = 'objects' AND schemaname = 'storage' 
               AND cmd = 'INSERT' AND policyname LIKE '%upload%')
    THEN '✓ Upload policy exists'
    ELSE '✗ Upload policy missing'
  END as result;
