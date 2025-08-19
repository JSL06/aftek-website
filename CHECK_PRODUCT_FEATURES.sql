-- CHECK PRODUCT FEATURES STATUS
-- Run this to see if features columns exist and what data they contain

-- 1. Check if features column exists in products table
SELECT 'Checking products table for features column:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'features';

-- 2. Check if features column exists in product_translations table
SELECT 'Checking product_translations table for features column:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_translations'
AND column_name = 'features';

-- 3. Show sample products with their features
SELECT 'Sample products and their features:' as info;
SELECT 
  id,
  name,
  features,
  CASE 
    WHEN features IS NULL THEN 'NULL'
    WHEN features = '{}' THEN 'Empty array'
    ELSE 'Has features'
  END as feature_status
FROM products 
LIMIT 5;

-- 4. Show sample product_translations with their features
SELECT 'Sample product_translations and their features:' as info;
SELECT 
  product_id,
  language_code,
  features,
  CASE 
    WHEN features IS NULL THEN 'NULL'
    WHEN features = '{}' THEN 'Empty array'
    ELSE 'Has features'
  END as feature_status
FROM product_translations 
LIMIT 5;

-- 5. Count how many products have features
SELECT 'Products with features count:' as info;
SELECT 
  COUNT(*) as total_products,
  COUNT(features) as products_with_features_column,
  COUNT(CASE WHEN features IS NOT NULL AND features != '{}' THEN 1 END) as products_with_actual_features
FROM products;

-- 6. If features column doesn't exist, show how to add it
SELECT 'If features column is missing, run the SETUP_PRODUCT_FEATURES.sql script' as next_step;
