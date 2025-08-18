-- Test Product Names and Translations
-- Run this script in your Supabase SQL Editor to verify the multilingual setup

-- 1. Check the current state of products table
SELECT '=== PRODUCTS TABLE ===' as info;
SELECT 
  id,
  name as original_name,
  description as original_description,
  category,
  created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check the current state of product_translations table
SELECT '=== PRODUCT_TRANSLATIONS TABLE ===' as info;
SELECT 
  product_id,
  language_code,
  name as translated_name,
  description as translated_description,
  created_at
FROM product_translations 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if a specific product has translations
SELECT '=== SAMPLE PRODUCT TRANSLATIONS ===' as info;
SELECT 
  p.id,
  p.name as original_name,
  pt.language_code,
  pt.name as translated_name,
  pt.description as translated_description
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
WHERE p.id IN (
  SELECT id FROM products ORDER BY created_at DESC LIMIT 3
)
ORDER BY p.id, pt.language_code;

-- 4. Check if the RPC function exists and works
SELECT '=== RPC FUNCTION TEST ===' as info;
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_products_with_translations')
    THEN '✓ RPC function exists'
    ELSE '✗ RPC function missing'
  END as rpc_status;

-- 5. Test the RPC function if it exists
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_products_with_translations') THEN
    RAISE NOTICE 'RPC function exists - you can test it with: SELECT * FROM get_products_with_translations();';
  ELSE
    RAISE NOTICE 'RPC function does not exist';
  END IF;
END $$;

-- 6. Check storage bucket for images
SELECT '=== STORAGE BUCKET ===' as info;
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'editor-images')
    THEN '✓ editor-images bucket exists'
    ELSE '✗ editor-images bucket missing'
  END as bucket_status;

-- 7. Summary of what should work
SELECT '=== SUMMARY ===' as info;
SELECT 
  'Product names should be saved to product_translations table' as note,
  'Each language (en, zh-Hant, zh-Hans, ja, ko, th, vi) should have its own name/description' as details,
  'The website should display names from product_translations, not the main products table' as display_logic;
