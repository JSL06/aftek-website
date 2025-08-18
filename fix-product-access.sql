-- =====================================================
-- AFTEK WEBSITE - FIX PRODUCT ACCESS ISSUES
-- =====================================================
-- This script fixes RLS policies and ensures products are accessible
-- Run this in Supabase SQL Editor to fix the products display issue
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT RLS STATUS
-- =====================================================

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'products';

-- =====================================================
-- 2. FIX RLS POLICIES FOR PRODUCTS
-- =====================================================

-- First, disable RLS temporarily to ensure we can access the data
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be blocking access
DROP POLICY IF EXISTS "Public read access for products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;

-- Create a simple public read policy for products
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

-- Create a policy for authenticated users to manage products
CREATE POLICY "Allow authenticated users to manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. VERIFY PRODUCT DATA STRUCTURE
-- =====================================================

-- Check if products have the required fields
SELECT 
    'Products with names' as check_type,
    COUNT(*) as count
FROM products 
WHERE name IS NOT NULL AND name != '';

SELECT 
    'Products with descriptions' as check_type,
    COUNT(*) as count
FROM products 
WHERE description IS NOT NULL AND description != '';

SELECT 
    'Products with categories' as check_type,
    COUNT(*) as count
FROM products 
WHERE category IS NOT NULL AND category != '';

-- =====================================================
-- 4. CHECK SAMPLE PRODUCT DATA
-- =====================================================

-- Show sample products to verify structure
SELECT 
    id,
    name,
    LEFT(description, 50) as description_preview,
    category,
    created_at,
    updated_at
FROM products 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 5. TEST FRONTEND ACCESS
-- =====================================================

-- Test if we can select products (this simulates what the frontend does)
SELECT 
    'Frontend access test' as test_type,
    COUNT(*) as accessible_products
FROM products;

-- Test with specific filters (like the frontend does)
SELECT 
    'Filtered access test' as test_type,
    COUNT(*) as filtered_products
FROM products 
WHERE category = 'Waterproofing';

-- =====================================================
-- 6. VERIFY RLS POLICIES ARE WORKING
-- =====================================================

-- Check final RLS status
SELECT 
    'Final RLS status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- Check final policies
SELECT 
    'Final policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'products';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Product access issues fixed! Products should now be visible on the website.' as status;
