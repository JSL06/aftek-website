-- Check the current structure of the products table
-- Run this in Supabase SQL Editor to see what columns exist

-- 1. Check if products table exists and show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Check if specific columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'category'
  ) THEN 'EXISTS' ELSE 'MISSING' END as category_column_status;

SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'model'
  ) THEN 'EXISTS' ELSE 'MISSING' END as model_column_status;

-- 3. Show sample data from products table
SELECT 
  id,
  name,
  description,
  category,
  model,
  "inStock" as inStock,
  "showInFeatured" as showInFeatured,
  "isActive" as isActive,
  created_at,
  updated_at
FROM products 
LIMIT 3;

-- 4. Check RLS policies on products table
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';
