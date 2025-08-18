-- Check WYSIWYG Editor Storage Setup
-- Run this script in your Supabase SQL Editor to diagnose the current setup

-- 1. Check if the bucket exists and its properties
SELECT 
  'Storage Bucket' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images') 
    THEN '✓ editor-images bucket exists' 
    ELSE '✗ editor-images bucket missing' 
  END as status
UNION ALL
SELECT 
  'Bucket Properties' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images') 
    THEN '✓ Bucket found - checking properties...' 
    ELSE '✗ No bucket to check' 
  END as status;

-- 2. Show bucket details if it exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'editor-images';

-- 3. Check RLS policies for storage.objects
SELECT 
  'RLS Policies' as component,
  CASE 
    WHEN COUNT(*) >= 2 
    THEN '✓ ' || COUNT(*) || ' policies found' 
    ELSE '✗ Only ' || COUNT(*) || ' policies found (need at least 2)' 
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 4. Show all storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Check if you're authenticated (run this to see your auth status)
SELECT 
  'Authentication Status' as component,
  CASE 
    WHEN auth.role() = 'authenticated' 
    THEN '✓ You are authenticated as: ' || auth.uid()::text
    ELSE '✗ You are not authenticated - this is why uploads fail!'
  END as status;

-- 6. Test if you can access the bucket
SELECT 
  'Bucket Access Test' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images') 
    THEN '✓ Can see bucket' 
    ELSE '✗ Cannot see bucket' 
  END as status;

-- 7. Check if there are any existing images
SELECT 
  'Existing Images' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id = 'editor-images') 
    THEN '✓ ' || COUNT(*) || ' images found' 
    ELSE '✗ No images found' 
  END as status
FROM storage.objects 
WHERE bucket_id = 'editor-images';

-- 8. Summary of what needs to be fixed
SELECT 
  'DIAGNOSIS SUMMARY' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images') 
      AND EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND cmd = 'INSERT')
      AND auth.role() = 'authenticated'
    THEN '✓ Everything looks good - uploads should work!'
    WHEN NOT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images')
    THEN '✗ Missing storage bucket'
    WHEN NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND cmd = 'INSERT')
    THEN '✗ Missing INSERT policy for storage'
    WHEN auth.role() != 'authenticated'
    THEN '✗ You are not authenticated - this is the main issue!'
    ELSE '✗ Unknown issue - check the details above'
  END as status;
