-- =====================================================
-- TEST LOCAL DATABASE CONNECTION
-- =====================================================
-- This script will test what database your local environment is using
-- Run this in your Supabase SQL Editor to see if it's the same database

-- =====================================================
-- STEP 1: CHECK CURRENT DATABASE
-- =====================================================

-- Show current database name
SELECT current_database() as current_database;

-- Show current user
SELECT current_user as current_user;

-- Show current schema
SELECT current_schema as current_schema;

-- =====================================================
-- STEP 2: CHECK IF TABLES EXIST
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
-- STEP 3: CHECK DATA IN TABLES
-- =====================================================

-- Count categories if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') 
    THEN (SELECT COUNT(*)::text FROM product_categories)
    ELSE 'TABLE MISSING'
  END as category_count;

-- Count translations if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_translations') 
    THEN (SELECT COUNT(*)::text FROM category_translations)
    ELSE 'TABLE MISSING'
  END as translation_count;

-- =====================================================
-- STEP 4: CHECK SPECIFIC CATEGORIES
-- =====================================================

-- Check for the missing categories
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') 
    THEN (
      SELECT string_agg(
        CASE 
          WHEN name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive') 
          THEN name || ': EXISTS'
          ELSE name || ': MISSING'
        END, 
        ', ' ORDER BY name
      )
      FROM product_categories
    )
    ELSE 'TABLE MISSING'
  END as missing_categories_status;

-- =====================================================
-- STEP 5: SHOW ALL CATEGORIES
-- =====================================================

-- List all categories if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_categories') 
    THEN (
      SELECT string_agg(name, ', ' ORDER BY name)
      FROM product_categories
    )
    ELSE 'TABLE MISSING'
  END as all_categories;
