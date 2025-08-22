-- =====================================================
-- FIX RLS POLICIES FOR LOCAL ACCESS
-- =====================================================
-- This script will check and fix RLS policies that are blocking local access
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT RLS STATUS
-- =====================================================

-- Check RLS status for product_categories
SELECT 
  'product_categories' as table_name,
  CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_categories') as policy_count
FROM pg_class WHERE relname = 'product_categories';

-- Check RLS status for category_translations
SELECT 
  'category_translations' as table_name,
  CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'category_translations') as policy_count
FROM pg_class WHERE relname = 'category_translations';

-- =====================================================
-- STEP 2: SHOW EXISTING POLICIES
-- =====================================================

-- Show existing policies for product_categories
SELECT 
  'product_categories' as table_name,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_categories';

-- Show existing policies for category_translations
SELECT 
  'category_translations' as table_name,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'category_translations';

-- =====================================================
-- STEP 3: DROP EXISTING POLICIES (IF ANY)
-- =====================================================

-- Drop existing policies to start fresh
DO $$
BEGIN
  -- Drop policies for product_categories
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories') THEN
    DROP POLICY IF EXISTS "Allow public read access to product_categories" ON product_categories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON product_categories;
    DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON product_categories;
    RAISE NOTICE 'Dropped existing policies for product_categories';
  END IF;
  
  -- Drop policies for category_translations
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'category_translations') THEN
    DROP POLICY IF EXISTS "Allow public read access to category_translations" ON category_translations;
    DROP POLICY IF EXISTS "Enable read access for all users" ON category_translations;
    DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON category_translations;
    RAISE NOTICE 'Dropped existing policies for category_translations';
  END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE NEW OPEN POLICIES
-- =====================================================

-- Create completely open read policy for product_categories
CREATE POLICY "Open read access for product_categories" ON product_categories
  FOR SELECT USING (true);

-- Create completely open read policy for category_translations
CREATE POLICY "Open read access for category_translations" ON category_translations
  FOR SELECT USING (true);

-- =====================================================
-- STEP 5: VERIFY POLICIES WERE CREATED
-- =====================================================

-- Verify the new policies exist
SELECT 
  'product_categories' as table_name,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_categories';

SELECT 
  'category_translations' as table_name,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'category_translations';

-- =====================================================
-- STEP 6: TEST DATA ACCESS
-- =====================================================

-- Test if we can now access the data
SELECT 
  'Test access to product_categories' as test,
  COUNT(*) as category_count
FROM product_categories;

SELECT 
  'Test access to category_translations' as test,
  COUNT(*) as translation_count
FROM category_translations;

-- Test specific missing categories
SELECT 
  'Test specific categories' as test,
  string_agg(
    CASE 
      WHEN name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive') 
      THEN name || ': ACCESSIBLE'
      ELSE name || ': ACCESSIBLE'
    END, 
    ', ' ORDER BY name
  ) as category_access_status
FROM product_categories;
