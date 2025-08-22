-- =====================================================
-- CHECK DATABASE STATUS - AFTEK WEBSITE
-- =====================================================
-- This script will check what's actually in your database
-- Run this to see what's missing

-- =====================================================
-- STEP 1: CHECK IF TABLES EXIST
-- =====================================================

-- Check if product_categories table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as product_categories_status;

-- Check if category_translations table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_translations') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as category_translations_status;

-- =====================================================
-- STEP 2: CHECK TABLE STRUCTURE
-- =====================================================

-- Show table structure if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') THEN
    RAISE NOTICE 'product_categories table structure:';
    PERFORM column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'product_categories';
  ELSE
    RAISE NOTICE 'product_categories table does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_translations') THEN
    RAISE NOTICE 'category_translations table structure:';
    PERFORM column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'category_translations';
  ELSE
    RAISE NOTICE 'category_translations table does not exist';
  END IF;
END $$;

-- =====================================================
-- STEP 3: CHECK IF DATA EXISTS
-- =====================================================

-- Check if there are any categories
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') THEN
    RAISE NOTICE 'Number of categories in product_categories: %', 
      (SELECT COUNT(*) FROM product_categories);
    
    -- Show all categories
    RAISE NOTICE 'All categories:';
    PERFORM name FROM product_categories;
  ELSE
    RAISE NOTICE 'product_categories table does not exist';
  END IF;
END $$;

-- Check if there are any translations
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_translations') THEN
    RAISE NOTICE 'Number of translations in category_translations: %', 
      (SELECT COUNT(*) FROM category_translations);
    
    -- Show all translations
    RAISE NOTICE 'All translations:';
    PERFORM language_code, display_name FROM category_translations;
  ELSE
    RAISE NOTICE 'category_translations table does not exist';
  END IF;
END $$;

-- =====================================================
-- STEP 4: CHECK SPECIFIC MISSING CATEGORIES
-- =====================================================

-- Check for the specific categories that are causing 400 errors
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') THEN
    RAISE NOTICE 'Checking for missing categories:';
    
    -- Check Redi-Mix G&M
    IF EXISTS (SELECT 1 FROM product_categories WHERE name = 'Redi-Mix G&M') THEN
      RAISE NOTICE 'Redi-Mix G&M: EXISTS';
    ELSE
      RAISE NOTICE 'Redi-Mix G&M: MISSING';
    END IF;
    
    -- Check Flooring
    IF EXISTS (SELECT 1 FROM product_categories WHERE name = 'Flooring') THEN
      RAISE NOTICE 'Flooring: EXISTS';
    ELSE
      RAISE NOTICE 'Flooring: MISSING';
    END IF;
    
    -- Check Waterproofing
    IF EXISTS (SELECT 1 FROM product_categories WHERE name = 'Waterproofing') THEN
      RAISE NOTICE 'Waterproofing: EXISTS';
    ELSE
      RAISE NOTICE 'Waterproofing: MISSING';
    END IF;
    
    -- Check Sealant & Adhesive
    IF EXISTS (SELECT 1 FROM product_categories WHERE name = 'Sealant & Adhesive') THEN
      RAISE NOTICE 'Sealant & Adhesive: EXISTS';
    ELSE
      RAISE NOTICE 'Sealant & Adhesive: MISSING';
    END IF;
  ELSE
    RAISE NOTICE 'product_categories table does not exist';
  END IF;
END $$;

-- =====================================================
-- STEP 5: CHECK RLS POLICIES
-- =====================================================

-- Check if RLS is enabled and policies exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') THEN
    RAISE NOTICE 'RLS status for product_categories: %', 
      (SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END 
       FROM pg_class WHERE relname = 'product_categories');
    
    RAISE NOTICE 'Number of policies for product_categories: %', 
      (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_categories');
  ELSE
    RAISE NOTICE 'product_categories table does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_translations') THEN
    RAISE NOTICE 'RLS status for category_translations: %', 
      (SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END 
       FROM pg_class WHERE relname = 'category_translations');
    
    RAISE NOTICE 'Number of policies for category_translations: %', 
      (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'category_translations');
  ELSE
    RAISE NOTICE 'category_translations table does not exist';
  END IF;
END $$;
