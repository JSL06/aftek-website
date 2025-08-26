-- =====================================================
-- SETUP ARTICLE IMAGE UPLOAD FUNCTIONALITY
-- =====================================================
-- This script sets up the necessary storage bucket and tables
-- for article featured image uploads in Supabase

-- Note: Storage bucket creation must be done through the Supabase dashboard
-- or using the Supabase CLI, as it cannot be created via SQL

-- =====================================================
-- 1. CREATE STORAGE BUCKET (Must be done manually)
-- =====================================================
-- Go to your Supabase Dashboard > Storage > Buckets
-- Create a new bucket with these settings:
-- - Name: article-images
-- - Public bucket: YES (checked)
-- - File size limit: 10MB
-- - Allowed MIME types: image/*

-- =====================================================
-- 2. CREATE STORAGE POLICIES (Drop existing ones first)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public access to view images
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

-- Policy to allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their uploaded images
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 3. CREATE ARTICLE IMAGES TABLE (if not exists)
-- =====================================================

-- Create the article_images table to track uploaded images
CREATE TABLE IF NOT EXISTS article_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON article_images(article_id);

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER FOR ARTICLE_IMAGES
-- =====================================================

-- Create or replace the function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_article_images_updated_at ON article_images;
CREATE TRIGGER update_article_images_updated_at
  BEFORE UPDATE ON article_images
  FOR EACH ROW
  EXECUTE FUNCTION update_article_images_updated_at();

-- =====================================================
-- 5. VERIFY ARTICLES TABLE HAS FEATURED_IMAGE COLUMN
-- =====================================================

-- Check if featured_image column exists, add if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE articles ADD COLUMN featured_image TEXT;
  END IF;
END $$;

-- =====================================================
-- 6. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on article_images table
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public viewing of article images" ON article_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert article images" ON article_images;
DROP POLICY IF EXISTS "Allow authenticated users to update article images" ON article_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete article images" ON article_images;

-- Policy to allow users to see all article images
CREATE POLICY "Allow public viewing of article images" ON article_images
FOR SELECT USING (true);

-- Policy to allow authenticated users to insert article images
CREATE POLICY "Allow authenticated users to insert article images" ON article_images
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update article images
CREATE POLICY "Allow authenticated users to update article images" ON article_images
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete article images
CREATE POLICY "Allow authenticated users to delete article images" ON article_images
FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if storage bucket exists (run this after creating the bucket)
-- SELECT name, public FROM storage.buckets WHERE name = 'article-images';

-- Check if article_images table was created
-- SELECT * FROM information_schema.tables WHERE table_name = 'article_images';

-- Check if featured_image column exists in articles table
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'articles' AND column_name = 'featured_image';

-- =====================================================
-- MANUAL STEPS REQUIRED:
-- =====================================================
-- 1. Go to Supabase Dashboard > Storage > Buckets
-- 2. Click "Create a new bucket"
-- 3. Set Name: article-images
-- 4. Check "Public bucket" 
-- 5. Set File size limit: 10MB
-- 6. Set Allowed MIME types: image/*
-- 7. Click "Create bucket"
-- 8. Run this SQL script
-- =====================================================

-- After running this script, test the image upload functionality
-- The console should show detailed logs about the upload process
