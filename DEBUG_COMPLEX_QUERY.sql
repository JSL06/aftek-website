-- =====================================================
-- DEBUG COMPLEX QUERY THAT'S FAILING
-- =====================================================
-- This script will test the exact query that's causing 400 errors
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: TEST THE EXACT QUERY STRUCTURE
-- =====================================================

-- Test the query for 'Sealant & Adhesive' with zh-Hant translation
SELECT 
  pc.id,
  pc.name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM product_categories pc
INNER JOIN category_translations ct ON pc.id = ct.category_id
WHERE pc.name = 'Sealant & Adhesive' 
AND ct.language_code = 'zh-Hant';

-- Test the query for 'Redi-Mix G&M' with zh-Hant translation
SELECT 
  pc.id,
  pc.name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM product_categories pc
INNER JOIN category_translations ct ON pc.id = ct.category_id
WHERE pc.name = 'Redi-Mix G&M' 
AND ct.language_code = 'zh-Hant';

-- Test the query for 'Flooring' with zh-Hant translation
SELECT 
  pc.id,
  pc.name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM product_categories pc
INNER JOIN category_translations ct ON pc.id = ct.category_id
WHERE pc.name = 'Flooring' 
AND ct.language_code = 'zh-Hant';

-- Test the query for 'Waterproofing' with zh-Hant translation
SELECT 
  pc.id,
  pc.name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM product_categories pc
INNER JOIN category_translations ct ON pc.id = ct.category_id
WHERE pc.name = 'Waterproofing' 
AND ct.language_code = 'zh-Hant';

-- =====================================================
-- STEP 2: CHECK IF ALL TRANSLATIONS EXIST
-- =====================================================

-- Check all zh-Hant translations
SELECT 
  pc.name as category_name,
  ct.language_code,
  ct.display_name,
  CASE 
    WHEN ct.id IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as translation_status
FROM product_categories pc
LEFT JOIN category_translations ct ON pc.id = ct.category_id AND ct.language_code = 'zh-Hant'
ORDER BY pc.name;

-- =====================================================
-- STEP 3: CHECK FOR MISSING TRANSLATIONS
-- =====================================================

-- Find categories that are missing zh-Hant translations
SELECT 
  pc.name as category_name,
  'MISSING zh-Hant translation' as issue
FROM product_categories pc
LEFT JOIN category_translations ct ON pc.id = ct.category_id AND ct.language_code = 'zh-Hant'
WHERE ct.id IS NULL;

-- =====================================================
-- STEP 4: CHECK DATA INTEGRITY
-- =====================================================

-- Check if there are any orphaned translations
SELECT 
  ct.id,
  ct.category_id,
  ct.language_code,
  ct.display_name,
  'ORPHANED - category does not exist' as issue
FROM category_translations ct
LEFT JOIN product_categories pc ON ct.category_id = pc.id
WHERE pc.id IS NULL;

-- =====================================================
-- STEP 5: TEST SIMPLIFIED QUERIES
-- =====================================================

-- Test simple category lookup
SELECT * FROM product_categories WHERE name = 'Sealant & Adhesive';

-- Test simple translation lookup
SELECT * FROM category_translations WHERE language_code = 'zh-Hant';

-- Test the join without WHERE conditions
SELECT 
  pc.name,
  ct.language_code,
  ct.display_name
FROM product_categories pc
INNER JOIN category_translations ct ON pc.id = ct.category_id
WHERE ct.language_code = 'zh-Hant'
ORDER BY pc.name;
