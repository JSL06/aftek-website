-- Simple script to verify if product_translations table exists
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'product_translations'
) as table_exists;

-- If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT COUNT(*) as total_rows FROM product_translations;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'product_translations';
