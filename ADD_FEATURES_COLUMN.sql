-- ADD FEATURES COLUMN TO PRODUCTS TABLE
-- This script adds a features column to store centralized product features
-- Run this in Supabase SQL Editor to enable the new centralized features system

-- =====================================================
-- 1. ADD FEATURES COLUMN TO PRODUCTS TABLE
-- =====================================================

-- Add features column as TEXT[] (array of text) to store feature names
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- =====================================================
-- 2. UPDATE EXISTING PRODUCTS (OPTIONAL)
-- =====================================================

-- If you have existing products with features in product_translations table,
-- you can migrate them to the new centralized system
-- Uncomment the following if you want to migrate existing data:

/*
-- Migrate features from product_translations to products table
UPDATE products 
SET features = (
  SELECT ARRAY_AGG(DISTINCT feature)
  FROM product_translations 
  WHERE product_translations.product_id = products.id 
    AND product_translations.features IS NOT NULL
    AND product_translations.features != '{}'
);

-- Clean up old features from product_translations (optional)
UPDATE product_translations 
SET features = NULL 
WHERE features IS NOT NULL;
*/

-- =====================================================
-- 3. VERIFY THE SETUP
-- =====================================================

-- Check that the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'features';

-- Show sample products with features
SELECT 
    id,
    name,
    features,
    array_length(features, 1) as feature_count
FROM products 
WHERE features IS NOT NULL 
  AND array_length(features, 1) > 0
LIMIT 5;

SELECT 'Features column added successfully!' as status;
