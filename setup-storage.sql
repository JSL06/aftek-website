-- Setup Supabase Storage for Product Images
-- Run this in your Supabase SQL editor

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product images
-- Allow public read access to product images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Set CORS policy for the bucket (optional, for web access)
-- This is usually handled by Supabase automatically
