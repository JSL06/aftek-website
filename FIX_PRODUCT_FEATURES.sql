-- FIX PRODUCT FEATURES - CORRECTED VERSION
-- This script properly sets up features columns for products

-- 1. Check current table structure
SELECT 'Current products table columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Add features column to products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE products ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added features column to products table';
  ELSE
    RAISE NOTICE 'Features column already exists in products table';
  END IF;
END $$;

-- 3. Add features column to product_translations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_translations' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE product_translations ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added features column to product_translations table';
  ELSE
    RAISE NOTICE 'Features column already exists in product_translations table';
  END IF;
END $$;

-- 4. Update existing products with empty features array if NULL
UPDATE products 
SET features = ARRAY[]::TEXT[]
WHERE features IS NULL;

-- 5. Update existing product_translations with empty features array if NULL
UPDATE product_translations 
SET features = ARRAY[]::TEXT[]
WHERE features IS NULL;

-- 6. Verify the new structure
SELECT 'Updated products table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

SELECT 'Updated product_translations table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_translations'
ORDER BY ordinal_position;

-- 7. Test insert with features
INSERT INTO products (
  id,
  name,
  description,
  category,
  features,
  created_at
) VALUES (
  gen_random_uuid(),
  'Test Product with Features',
  'This is a test product to verify features functionality',
  'Test Category',
  ARRAY['Feature 1', 'Feature 2', 'Feature 3'],
  NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Test product with features inserted successfully' as status;

-- 8. Clean up test data
DELETE FROM products WHERE name = 'Test Product with Features';
SELECT 'Test data cleaned up' as status;

-- 9. Show sample products with features
SELECT 'Sample products with features:' as info;
SELECT 
  name,
  features,
  CASE 
    WHEN features IS NULL THEN 'No features'
    WHEN features = '{}' THEN 'Empty array'
    ELSE 'Has features'
  END as feature_status
FROM products 
WHERE features IS NOT NULL 
LIMIT 3;

-- 10. Show sample product_translations with features
SELECT 'Sample product_translations with features:' as info;
SELECT 
  product_id,
  language_code,
  features,
  CASE 
    WHEN features IS NULL THEN 'No features'
    WHEN features = '{}' THEN 'Empty array'
    ELSE 'Has features'
  END as feature_status
FROM product_translations 
WHERE features IS NOT NULL 
LIMIT 3;

SELECT 'PRODUCT FEATURES SETUP COMPLETE!' as result;
SELECT 'The features column has been added to both products and product_translations tables.' as details;
SELECT 'Features will now be properly saved and loaded for all products.' as next_step;
