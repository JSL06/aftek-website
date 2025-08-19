-- ADD MULTILINGUAL FEATURES SUPPORT
-- This script adds features column to product_translations table for multilingual features

-- 1. Check if features column exists in product_translations table
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

-- 2. Add features column to product_translations table if it doesn't exist
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

-- 3. Update existing product_translations with empty features array if NULL
UPDATE product_translations 
SET features = ARRAY[]::TEXT[]
WHERE features IS NULL;

-- 4. Copy existing features from products table to English translations
UPDATE product_translations 
SET features = (
  SELECT p.features 
  FROM products p 
  WHERE p.id = product_translations.product_id
)
WHERE language_code = 'en' 
AND features = '{}'::TEXT[]
AND EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = product_translations.product_id 
  AND p.features IS NOT NULL 
  AND p.features != '{}'::TEXT[]
);

-- 5. Verify the new structure
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

-- 6. Show sample translations with features
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
LIMIT 5;

-- 7. Test insert with multilingual features
SELECT 'Testing multilingual features insert:' as info;
-- This will show how to insert features for different languages
SELECT 'To add features for a language, use:' as instruction;
SELECT 'INSERT INTO product_translations (product_id, language_code, features) VALUES (product_id, language_code, ARRAY[feature1, feature2]);' as example;

SELECT 'MULTILINGUAL FEATURES SETUP COMPLETE!' as result;
SELECT 'Features can now be stored per language in the product_translations table.' as details;
SELECT 'The main products table features column will be used as fallback for backward compatibility.' as note;
