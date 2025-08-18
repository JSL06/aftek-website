-- Debug Title Saving Step by Step
-- Run this script in your Supabase SQL Editor to identify the issue

-- 1. First, let's see what's in the product_translations table structure
SELECT '=== TABLE STRUCTURE ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- 2. Check if the table has any data at all
SELECT '=== CURRENT DATA ===' as info;
SELECT COUNT(*) as total_translations FROM product_translations;

-- 3. Check if there are any RLS policies blocking inserts/updates
SELECT '=== RLS POLICIES ===' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_translations'
ORDER BY policyname;

-- 4. Check if RLS is enabled on the table
SELECT '=== RLS STATUS ===' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'product_translations';

-- 5. Check what products exist and their current translations
SELECT '=== PRODUCTS AND TRANSLATIONS ===' as info;
SELECT 
  p.id,
  p.name as original_name,
  pt.language_code,
  pt.name as translated_name,
  pt.description as translated_description,
  pt.created_at,
  pt.updated_at
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
ORDER BY p.created_at DESC, pt.language_code
LIMIT 20;

-- 6. Try to manually insert a test translation (this will show any errors)
SELECT '=== TEST INSERT ===' as info;

-- First, get a product ID to test with
DO $$
DECLARE
  test_product_id UUID;
  insert_result RECORD;
BEGIN
  -- Get the first product ID
  SELECT id INTO test_product_id FROM products LIMIT 1;
  
  IF test_product_id IS NOT NULL THEN
    RAISE NOTICE 'Testing with product ID: %', test_product_id;
    
    -- Try to insert a test translation
    INSERT INTO product_translations (product_id, language_code, name, description)
    VALUES (test_product_id, 'en', 'TEST NAME ' || NOW(), 'TEST DESCRIPTION ' || NOW())
    RETURNING * INTO insert_result;
    
    RAISE NOTICE 'Insert successful: %', insert_result;
    
    -- Clean up the test data
    DELETE FROM product_translations WHERE product_id = test_product_id AND language_code = 'en';
    RAISE NOTICE 'Test data cleaned up';
    
  ELSE
    RAISE NOTICE 'No products found to test with';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during test insert: % %', SQLERRM, SQLSTATE;
END $$;

-- 7. Check if there are any constraints or triggers
SELECT '=== CONSTRAINTS ===' as info;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'product_translations'::regclass;

-- 8. Check if there are any triggers
SELECT '=== TRIGGERS ===' as info;
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled,
  tgdeferrable,
  tginitdeferred
FROM pg_trigger 
WHERE tgrelid = 'product_translations'::regclass;

-- 9. Test the upsert functionality specifically
SELECT '=== TEST UPSERT ===' as info;
DO $$
DECLARE
  test_product_id UUID;
  upsert_result RECORD;
BEGIN
  -- Get the first product ID
  SELECT id INTO test_product_id FROM products LIMIT 1;
  
  IF test_product_id IS NOT NULL THEN
    RAISE NOTICE 'Testing upsert with product ID: %', test_product_id;
    
    -- First, insert a translation
    INSERT INTO product_translations (product_id, language_code, name, description)
    VALUES (test_product_id, 'en', 'FIRST NAME', 'FIRST DESCRIPTION')
    ON CONFLICT (product_id, language_code) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at = NOW()
    RETURNING * INTO upsert_result;
    
    RAISE NOTICE 'First insert/upsert successful: %', upsert_result;
    
    -- Now try to update just the name
    INSERT INTO product_translations (product_id, language_code, name, description)
    VALUES (test_product_id, 'en', 'UPDATED NAME', NULL)
    ON CONFLICT (product_id, language_code) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING * INTO upsert_result;
    
    RAISE NOTICE 'Name update successful: %', upsert_result;
    
    -- Check what we have now
    SELECT * INTO upsert_result FROM product_translations 
    WHERE product_id = test_product_id AND language_code = 'en';
    
    RAISE NOTICE 'Final state: %', upsert_result;
    
    -- Clean up
    DELETE FROM product_translations WHERE product_id = test_product_id AND language_code = 'en';
    RAISE NOTICE 'Test data cleaned up';
    
  ELSE
    RAISE NOTICE 'No products found to test with';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during upsert test: % %', SQLERRM, SQLSTATE;
END $$;

-- 10. Summary of what to check
SELECT '=== DEBUGGING STEPS ===' as info;
SELECT 
  '1. Check if table structure is correct' as step,
  '2. Verify RLS policies allow INSERT/UPDATE' as step2,
  '3. Check if there are any constraints blocking data' as step3,
  '4. Verify the admin user has proper permissions' as step4,
  '5. Test upsert functionality manually' as step5;
