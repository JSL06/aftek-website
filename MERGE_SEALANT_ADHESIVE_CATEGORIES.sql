-- =====================================================
-- MERGE SEALANT AND ADHESIVE CATEGORIES
-- =====================================================
-- This script merges the separate "Sealant" and "Adhesive" categories
-- into a single "Sealant & Adhesive" category
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check current state before merging
SELECT 'Current categories before merge:' as status;
SELECT 
  id,
  name,
  description,
  display_order,
  is_active,
  created_at
FROM product_categories 
WHERE name IN ('Sealant', 'Adhesive')
ORDER BY display_order;

-- 2. Check if there are any products using these categories
SELECT 'Products using Sealant or Adhesive categories:' as status;
SELECT 
  p.id,
  p.name as product_name,
  p.category,
  p.category_id
FROM products p
WHERE p.category IN ('Sealant', 'Adhesive')
   OR p.category_id IN (
     SELECT id FROM product_categories 
     WHERE name IN ('Sealant', 'Adhesive')
   );

-- 3. Create the new merged category
INSERT INTO product_categories (name, description, display_order, is_active)
VALUES (
  'Sealant & Adhesive',
  'Sealant and adhesive products and solutions for construction and industrial applications',
  2,  -- Keep the same display order as the original Sealant category
  true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 4. Get the ID of the new merged category
DO $$
DECLARE
  merged_category_id UUID;
  sealant_category_id UUID;
  adhesive_category_id UUID;
BEGIN
  -- Get the ID of the new merged category
  SELECT id INTO merged_category_id 
  FROM product_categories 
  WHERE name = 'Sealant & Adhesive';
  
  -- Get the IDs of the old categories
  SELECT id INTO sealant_category_id 
  FROM product_categories 
  WHERE name = 'Sealant';
  
  SELECT id INTO adhesive_category_id 
  FROM product_categories 
  WHERE name = 'Adhesive';
  
  -- Update products to use the new merged category
  IF merged_category_id IS NOT NULL THEN
    -- Update products that reference the old category names
    UPDATE products 
    SET category = 'Sealant & Adhesive',
        category_id = merged_category_id,
        updated_at = NOW()
    WHERE category IN ('Sealant', 'Adhesive');
    
    -- Update products that reference the old category IDs
    UPDATE products 
    SET category_id = merged_category_id,
        updated_at = NOW()
    WHERE category_id IN (sealant_category_id, adhesive_category_id);
    
    RAISE NOTICE 'Updated products to use merged category ID: %', merged_category_id;
  END IF;
END $$;

-- 5. Update category_translations table for the new merged category
-- First, get the ID of the merged category
DO $$
DECLARE
  merged_category_id UUID;
BEGIN
  SELECT id INTO merged_category_id 
  FROM product_categories 
  WHERE name = 'Sealant & Adhesive';
  
  IF merged_category_id IS NOT NULL THEN
    -- Insert translations for the new merged category in all languages
    INSERT INTO category_translations (category_id, language_code, name, description) VALUES
    (merged_category_id, 'en', 'Sealant & Adhesive', 'Sealant and adhesive products and solutions'),
    (merged_category_id, 'zh-Hant', '密封膠與黏合劑', '密封膠和黏合劑產品和解決方案'),
    (merged_category_id, 'zh-Hans', '密封胶与黏合剂', '密封胶和黏合剂产品和解决方案'),
    (merged_category_id, 'ja', 'シーラント・接着剤', 'シーラントと接着剤の製品とソリューション'),
    (merged_category_id, 'ko', '실런트 및 접착제', '실런트 및 접착제 제품 및 솔루션'),
    (merged_category_id, 'th', 'ซีแลนท์และกาว', 'ผลิตภัณฑ์และโซลูชันซีแลนท์และกาว'),
    (merged_category_id, 'vi', 'Chất bịt kín & Chất kết dính', 'Sản phẩm và giải pháp chất bịt kín và chất kết dính')
    ON CONFLICT (category_id, language_code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at = NOW();
    
    RAISE NOTICE 'Inserted translations for merged category ID: %', merged_category_id;
  END IF;
END $$;

-- 6. Remove the old separate categories
DELETE FROM product_categories 
WHERE name IN ('Sealant', 'Adhesive');

-- 7. Reorder the remaining categories to maintain proper sequence
UPDATE product_categories 
SET display_order = CASE 
  WHEN name = 'Waterproofing' THEN 1
  WHEN name = 'Sealant & Adhesive' THEN 2
  WHEN name = 'Redi-Mix G&M' THEN 3
  WHEN name = 'Flooring' THEN 4
  WHEN name = 'Other Specialties' THEN 5
  ELSE display_order
END,
updated_at = NOW()
WHERE name IN ('Waterproofing', 'Sealant & Adhesive', 'Redi-Mix G&M', 'Flooring', 'Other Specialties');

-- 8. Verify the final state
SELECT 'Categories after merge:' as status;
SELECT 
  id,
  name,
  description,
  display_order,
  is_active,
  created_at
FROM product_categories 
ORDER BY display_order;

-- 9. Show the final count
SELECT COUNT(*) as final_category_count FROM product_categories;

-- 10. Verify products are properly categorized
SELECT 'Products with merged category:' as status;
SELECT 
  p.id,
  p.name as product_name,
  p.category,
  p.category_id,
  pc.name as category_name
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.category = 'Sealant & Adhesive'
   OR pc.name = 'Sealant & Adhesive'
ORDER BY p.name;

-- 11. Show category translations for the merged category
SELECT 'Translations for merged category:' as status;
SELECT 
  ct.language_code,
  ct.name,
  ct.description
FROM category_translations ct
JOIN product_categories pc ON ct.category_id = pc.id
WHERE pc.name = 'Sealant & Adhesive'
ORDER BY ct.language_code;

SELECT 'MERGE COMPLETE!' as result;
SELECT 'Sealant and Adhesive categories have been successfully merged into "Sealant & Adhesive"' as details;
SELECT 'All products have been updated to use the new merged category' as note;
SELECT 'The system now has 5 categories instead of 6' as summary;
