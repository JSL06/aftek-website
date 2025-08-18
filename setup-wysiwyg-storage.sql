-- Setup WYSIWYG Editor Image Storage in Supabase
-- Run this script in your Supabase SQL Editor

-- 1. Create storage bucket for editor images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-images', 
  'editor-images', 
  true, 
  52428800, -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- 2. Set up Row Level Security (RLS) policies for the bucket

-- Policy: Public read access to all images
CREATE POLICY "Public read access to editor images" ON storage.objects
FOR SELECT USING (bucket_id = 'editor-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload editor images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'editor-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own uploaded images
CREATE POLICY "Users can update their own editor images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'editor-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own uploaded images
CREATE POLICY "Users can delete their own editor images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'editor-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Create a function to generate unique filenames
CREATE OR REPLACE FUNCTION generate_unique_filename(original_name text)
RETURNS text AS $$
DECLARE
  file_ext text;
  base_name text;
  unique_name text;
  counter integer := 0;
BEGIN
  -- Extract file extension
  file_ext := substring(original_name from '\.([^.]*)$');
  base_name := substring(original_name from '^(.+?)(\.[^.]*)?$');
  
  -- Generate unique name
  LOOP
    IF counter = 0 THEN
      unique_name := base_name || '.' || file_ext;
    ELSE
      unique_name := base_name || '_' || counter || '.' || file_ext;
    END IF;
    
    -- Check if file exists
    IF NOT EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'editor-images' AND name = unique_name
    ) THEN
      RETURN unique_name;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a function to clean up orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_editor_images()
RETURNS void AS $$
BEGIN
  -- Delete images older than 30 days that are not referenced in any content
  DELETE FROM storage.objects 
  WHERE bucket_id = 'editor-images' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      -- Add your content tables here if you want to check for image references
      SELECT DISTINCT unnest(regexp_matches(content, 'editor-images/[^"\s]+', 'g')) 
      FROM your_content_table 
      WHERE content IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Create a scheduled job to clean up orphaned images (optional)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-editor-images', '0 2 * * *', 'SELECT cleanup_orphaned_editor_images();');

-- 6. Create a view to monitor storage usage
CREATE OR REPLACE VIEW editor_images_usage AS
SELECT 
  COUNT(*) as total_images,
  COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0) as total_size_bytes,
  ROUND(COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0) / 1024.0 / 1024.0, 2) as total_size_mb,
  MIN(created_at) as oldest_image,
  MAX(created_at) as newest_image
FROM storage.objects 
WHERE bucket_id = 'editor-images';

-- 7. Create a function to get image statistics
CREATE OR REPLACE FUNCTION get_editor_images_stats()
RETURNS TABLE(
  total_images bigint,
  total_size_mb numeric,
  oldest_image timestamptz,
  newest_image timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint,
    ROUND(COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0) / 1024.0 / 1024.0, 2),
    MIN(created_at),
    MAX(created_at)
  FROM storage.objects 
  WHERE bucket_id = 'editor-images';
END;
$$ LANGUAGE plpgsql;

-- 8. Test the setup
-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'editor-images';

-- Check RLS policies (using system tables)
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
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test the unique filename function
SELECT generate_unique_filename('test-image.jpg');

-- Get storage usage
SELECT * FROM editor_images_usage;

-- Get image statistics
SELECT * FROM get_editor_images_stats();

-- 9. Optional: Create a table to track image uploads (for analytics)
CREATE TABLE IF NOT EXISTS editor_image_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_used BOOLEAN DEFAULT false,
  used_in_table TEXT,
  used_in_id UUID
);

-- Create index for performance
CREATE INDEX idx_editor_image_uploads_uploaded_by ON editor_image_uploads(uploaded_by);
CREATE INDEX idx_editor_image_uploads_uploaded_at ON editor_image_uploads(uploaded_at);
CREATE INDEX idx_editor_image_uploads_is_used ON editor_image_uploads(is_used);

-- 10. Create a trigger to automatically track uploads
CREATE OR REPLACE FUNCTION track_editor_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO editor_image_uploads (
    filename, 
    original_name, 
    file_size, 
    mime_type, 
    uploaded_by
  ) VALUES (
    NEW.name,
    COALESCE(NEW.metadata->>'originalName', NEW.name),
    COALESCE(CAST(NEW.metadata->>'size' AS BIGINT), 0),
    COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_editor_image_upload_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'editor-images')
  EXECUTE FUNCTION track_editor_image_upload();

-- 11. Create a function to mark images as used
CREATE OR REPLACE FUNCTION mark_editor_image_used(
  image_filename TEXT,
  table_name TEXT,
  record_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE editor_image_uploads 
  SET 
    is_used = true,
    used_in_table = table_name,
    used_in_id = record_id
  WHERE filename = image_filename;
END;
$$ LANGUAGE plpgsql;

-- 12. Create a function to find unused images
CREATE OR REPLACE FUNCTION find_unused_editor_images()
RETURNS TABLE(
  filename TEXT,
  original_name TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eiu.filename,
    eiu.original_name,
    eiu.file_size,
    eiu.uploaded_at
  FROM editor_image_uploads eiu
  WHERE eiu.is_used = false
  ORDER BY eiu.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. Final verification
-- Check everything is set up correctly
SELECT 
  'Storage bucket' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images') 
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status
UNION ALL
SELECT 
  'RLS policies' as component,
  CASE 
    WHEN COUNT(*) >= 4 
    THEN '✓ ' || COUNT(*) || ' policies created' 
    ELSE '✗ Only ' || COUNT(*) || ' policies found' 
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
UNION ALL
SELECT 
  'Helper functions' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_filename')
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status
UNION ALL
SELECT 
  'Tracking table' as component,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'editor_image_uploads')
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status;

-- 14. Usage examples
-- To use the editor with image uploads:
-- 1. The editor will automatically upload images to the 'editor-images' bucket
-- 2. Images will be tracked in the editor_image_uploads table
-- 3. You can mark images as used when they're saved in your content
-- 4. Use find_unused_editor_images() to find orphaned images
-- 5. Use cleanup_orphaned_editor_images() to clean up old unused images

-- Example: Mark an image as used in a product description
-- SELECT mark_editor_image_used('product-image-123.jpg', 'products', 'product-uuid-here');

-- Example: Find all unused images
-- SELECT * FROM find_unused_editor_images();

-- Example: Clean up old unused images
-- SELECT cleanup_orphaned_editor_images();
