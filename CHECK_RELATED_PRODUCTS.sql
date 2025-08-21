-- Check if related_products column exists and has data
-- Run this in Supabase SQL Editor

-- 1. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'related_products';

-- 2. Check if any products have related_products data
SELECT 
  id, 
  name, 
  related_products,
  pg_typeof(related_products) as related_products_type
FROM products 
WHERE related_products IS NOT NULL 
LIMIT 10;

-- 3. Check all products with related_products column
SELECT 
  id, 
  name, 
  related_products,
  pg_typeof(related_products) as data_type
FROM products 
LIMIT 5;

-- 4. Check if column exists at all
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name = 'related_products'
) as column_exists;
