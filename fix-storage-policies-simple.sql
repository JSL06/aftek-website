-- Simple Fix for WYSIWYG Editor Image Uploads
-- Run this script in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT 'Current storage policies:' as info;
SELECT policyname, cmd, permissive FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Now let's create a simple, permissive policy for the editor-images bucket
-- This will allow ANY authenticated user to upload to the editor-images bucket

-- Drop any existing restrictive policies for editor-images
DROP POLICY IF EXISTS "Authenticated users can upload editor images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to editor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own editor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own editor images" ON storage.objects;

-- Create a simple, permissive policy for editor-images
CREATE POLICY "editor_images_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'editor-images'
);

-- Create a simple, permissive policy for reading editor-images
CREATE POLICY "editor_images_read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'editor-images'
);

-- Create a simple, permissive policy for updating editor-images
CREATE POLICY "editor_images_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'editor-images'
);

-- Create a simple, permissive policy for deleting editor-images
CREATE POLICY "editor_images_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'editor-images'
);

-- Verify the new policies
SELECT 'New policies created:' as info;
SELECT policyname, cmd, permissive FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'editor_images%'
ORDER BY policyname;

-- Test if the policies are working
SELECT 
  'Policy Test' as test,
  CASE 
    WHEN COUNT(*) >= 4 
    THEN '✓ ' || COUNT(*) || ' editor_images policies found'
    ELSE '✗ Only ' || COUNT(*) || ' policies found (need 4)'
  END as result
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'editor_images%';

-- Show total storage policies
SELECT 'Total storage policies:' as info;
SELECT COUNT(*) as total_policies FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
