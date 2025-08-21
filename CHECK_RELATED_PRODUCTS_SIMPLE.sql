-- Simple check for related_products column - no type conflicts
-- Run this in Supabase SQL Editor

-- 1. Check if column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'related_products';

-- 2. Check column type
SELECT 
  id, 
  name, 
  pg_typeof(related_products) as data_type
FROM products 
WHERE related_products IS NOT NULL 
LIMIT 5;

-- 3. Check if any products have related_products data
SELECT 
  COUNT(*) as total_products,
  COUNT(related_products) as products_with_related,
  COUNT(CASE WHEN related_products IS NOT NULL AND jsonb_array_length(related_products) > 0 THEN 1 END) as products_with_related_data
FROM products;
