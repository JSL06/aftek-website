-- DEBUG PRODUCT FEATURES LOADING
-- Run this to test if features are being loaded properly

-- 1. Check if features column exists and has data
SELECT 'Checking features column existence and data:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'features';

-- 2. Show products with their features
SELECT 'Products with features data:' as info;
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
LIMIT 10;

-- 3. Test the exact query that the service uses
SELECT 'Testing the exact service query:' as info;
SELECT 
  id,
  name,
  features,
  category,
  model,
  "inStock",
  "showInFeatured",
  "isActive"
FROM products 
WHERE id = '5f48ee77-3f55-48ab-8754-1b579ae31517'  -- Use one of your product IDs
LIMIT 1;

-- 4. Check if there are any RLS policies blocking features
SELECT 'Checking RLS policies for products table:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- 5. Verify the features data type
SELECT 'Features data type verification:' as info;
SELECT 
  id,
  name,
  features,
  pg_typeof(features) as features_type
FROM products 
WHERE features IS NOT NULL AND features != '{}'
LIMIT 3;
