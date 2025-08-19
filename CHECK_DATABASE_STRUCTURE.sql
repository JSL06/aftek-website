-- Check database structure for product saving issues
-- Run this in Supabase SQL Editor

-- 1. Check if product_translations table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- 2. Check if products table has the right columns
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check RLS policies on product_translations
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
WHERE tablename = 'product_translations';

-- 4. Check if there are any existing translations
SELECT COUNT(*) as total_translations FROM product_translations;

-- 5. Check a sample product and its translations
SELECT 
  p.id,
  p.name as product_name,
  p.description as product_description,
  pt.language_code,
  pt.name as translation_name,
  pt.description as translation_description
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
LIMIT 5;

-- 6. Check table permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'product_translations';
