-- Check if product_categories table exists and has the right structure
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'product_categories'
) as table_exists;

-- 2. If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_categories'
ORDER BY ordinal_position;

-- 3. Check if table has any data
SELECT COUNT(*) as total_categories FROM product_categories;

-- 4. Show sample data
SELECT * FROM product_categories LIMIT 5;

-- 5. Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_categories';
