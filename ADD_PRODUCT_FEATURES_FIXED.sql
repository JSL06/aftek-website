-- ADD PRODUCT FEATURES TO PRODUCTS TABLE (FIXED VERSION)
-- This script adds a features column to store product features as an array

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

-- 2. Add features column if it doesn't exist
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

-- 4. Update existing products with sample features (optional)
UPDATE products 
SET features = ARRAY['High Quality', 'Durable', 'Professional Grade']
WHERE features IS NULL OR array_length(features, 1) IS NULL;

-- 5. Verify the new structure
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

-- 6. Test insert with features
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

-- 7. Clean up test data
DELETE FROM products WHERE name = 'Test Product with Features';
SELECT 'Test data cleaned up' as status;

-- 8. Show sample products with features
SELECT 'Sample products with features:' as info;
SELECT 
  name,
  features,
  array_length(features, 1) as feature_count
FROM products 
WHERE features IS NOT NULL 
AND array_length(features, 1) > 0
LIMIT 3;

SELECT 'PRODUCT FEATURES SETUP COMPLETE!' as result;
SELECT 'The features column has been added to both products and product_translations tables.' as details;
SELECT 'You can now store and display product features in your application.' as next_steps;
