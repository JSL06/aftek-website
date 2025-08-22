-- =====================================================
-- DEBUG CATEGORY ERROR - AFTEK WEBSITE
-- =====================================================
-- This script will help debug the "language_code is not defined" error
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT CATEGORIES
-- =====================================================

-- Check what categories exist
SELECT 
  'CURRENT CATEGORIES' as info,
  COUNT(*) as total_categories
FROM product_categories;

-- List all categories
SELECT 
  id,
  name,
  description,
  display_order,
  is_active,
  created_at
FROM product_categories 
ORDER BY display_order, name;

-- =====================================================
-- STEP 2: CHECK CURRENT TRANSLATIONS
-- =====================================================

-- Check translation counts
SELECT 
  'TRANSLATION COUNTS' as info,
  language_code,
  COUNT(*) as translation_count
FROM category_translations 
GROUP BY language_code
ORDER BY language_code;

-- Check for any NULL language codes
SELECT 
  'NULL LANGUAGE CODES' as info,
  COUNT(*) as null_language_count
FROM category_translations 
WHERE language_code IS NULL;

-- Check for empty language codes
SELECT 
  'EMPTY LANGUAGE CODES' as info,
  COUNT(*) as empty_language_count
FROM category_translations 
WHERE language_code = '';

-- =====================================================
-- STEP 3: CHECK DATA INTEGRITY
-- =====================================================

-- Check if all translations have valid category references
SELECT 
  'ORPHANED TRANSLATIONS' as info,
  COUNT(*) as orphaned_count
FROM category_translations ct
LEFT JOIN product_categories pc ON ct.category_id = pc.id
WHERE pc.id IS NULL;

-- Check for any malformed translations
SELECT 
  'MALFORMED TRANSLATIONS' as info,
  id,
  category_id,
  language_code,
  display_name,
  description
FROM category_translations 
WHERE language_code IS NULL 
   OR language_code = '' 
   OR display_name IS NULL 
   OR display_name = '';

-- =====================================================
-- STEP 4: SAMPLE DATA
-- =====================================================

-- Show sample of good translations
SELECT 
  'SAMPLE GOOD TRANSLATIONS' as info,
  ct.id,
  pc.name as category_name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM category_translations ct
JOIN product_categories pc ON ct.category_id = pc.id
ORDER BY pc.display_order, ct.language_code
LIMIT 10;

-- =====================================================
-- STEP 5: RECOMMENDATIONS
-- =====================================================

-- If you see any issues above, run this to clean them up:
-- DELETE FROM category_translations WHERE language_code IS NULL OR language_code = '';
-- DELETE FROM category_translations WHERE display_name IS NULL OR display_name = '';

-- Then run the FIX_CATEGORIES_FINAL.sql script to recreate everything properly
