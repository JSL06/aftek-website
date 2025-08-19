-- POPULATE SAMPLE FEATURES FOR EXISTING PRODUCTS
-- This script adds sample features to existing products so you can see the features working

-- 1. Check current products
SELECT 'Current products:' as info;
SELECT 
  id,
  name,
  category,
  CASE 
    WHEN features IS NULL THEN 'NULL'
    WHEN array_length(features, 1) IS NULL THEN 'EMPTY ARRAY'
    ELSE array_to_string(features, ', ')
  END as current_features
FROM products 
LIMIT 10;

-- 2. Add sample features to products based on their category
UPDATE products 
SET features = ARRAY['High Quality', 'Professional Grade', 'Durable Construction']
WHERE category ILIKE '%waterproofing%' 
AND (features IS NULL OR array_length(features, 1) IS NULL);

UPDATE products 
SET features = ARRAY['Strong Adhesion', 'Quick Drying', 'Weather Resistant']
WHERE category ILIKE '%sealant%' OR category ILIKE '%adhesive%'
AND (features IS NULL OR array_length(features, 1) IS NULL);

UPDATE products 
SET features = ARRAY['Premium Mix', 'Easy Application', 'Long Lasting']
WHERE category ILIKE '%redi-mix%' OR category ILIKE '%g&m%'
AND (features IS NULL OR array_length(features, 1) IS NULL);

UPDATE products 
SET features = ARRAY['Slip Resistant', 'Easy Maintenance', 'Professional Finish']
WHERE category ILIKE '%flooring%'
AND (features IS NULL OR array_length(features, 1) IS NULL);

UPDATE products 
SET features = ARRAY['Specialized Solution', 'Industry Standard', 'Proven Performance']
WHERE category ILIKE '%other%' OR category ILIKE '%specialty%'
AND (features IS NULL OR array_length(features, 1) IS NULL);

-- 3. Add generic features to any remaining products without features
UPDATE products 
SET features = ARRAY['Quality Product', 'Professional Use', 'Reliable Performance']
WHERE features IS NULL OR array_length(features, 1) IS NULL;

-- 4. Verify the updates
SELECT 'Products with features after update:' as info;
SELECT 
  name,
  category,
  features,
  array_length(features, 1) as feature_count
FROM products 
WHERE features IS NOT NULL 
AND array_length(features, 1) > 0
ORDER BY category, name
LIMIT 15;

-- 5. Show feature statistics
SELECT 'Feature statistics:' as info;
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN features IS NOT NULL AND array_length(features, 1) > 0 THEN 1 END) as products_with_features,
  COUNT(CASE WHEN features IS NULL OR array_length(features, 1) IS NULL THEN 1 END) as products_without_features
FROM products;

SELECT 'SAMPLE FEATURES POPULATION COMPLETE!' as result;
SELECT 'Existing products now have sample features that will display in the frontend.' as details;
SELECT 'You can now edit these features in the admin panel or add new ones.' as next_steps;
