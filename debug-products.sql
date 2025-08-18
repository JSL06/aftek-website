-- =====================================================
-- AFTEK WEBSITE - DEBUG PRODUCTS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor to debug the products issue
-- =====================================================

-- 1. Check if products table exists and has data
SELECT 
    'Table exists' as check_type,
    COUNT(*) as count,
    'products' as table_name
FROM information_schema.tables 
WHERE table_name = 'products';

-- 2. Check products table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if there are any products
SELECT 
    'Product count' as check_type,
    COUNT(*) as total_products
FROM products;

-- 4. Check sample products
SELECT 
    id,
    name,
    category,
    created_at,
    updated_at
FROM products 
LIMIT 5;

-- 5. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 6. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 7. Check if we can insert a test product
INSERT INTO products (name, description, category) 
VALUES ('TEST PRODUCT', 'This is a test product', 'Test')
ON CONFLICT DO NOTHING;

-- 8. Check if test product was inserted
SELECT 
    'Test product check' as check_type,
    COUNT(*) as test_products
FROM products 
WHERE name = 'TEST PRODUCT';

-- 9. Clean up test product
DELETE FROM products WHERE name = 'TEST PRODUCT';

-- 10. Final product count
SELECT 
    'Final product count' as check_type,
    COUNT(*) as total_products
FROM products;
