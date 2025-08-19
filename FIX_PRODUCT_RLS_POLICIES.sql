-- Fix RLS policies for products table
-- Run this in Supabase SQL Editor to fix permission issues

-- 1. First, let's see what RLS policies currently exist
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- 2. Drop existing problematic policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- 3. Create proper RLS policies for products table

-- Policy for reading products (public access)
CREATE POLICY "Enable read access for all users" ON products
FOR SELECT USING (true);

-- Policy for inserting products (authenticated users)
CREATE POLICY "Enable insert for authenticated users only" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating products (authenticated users)
CREATE POLICY "Enable update for authenticated users only" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for deleting products (authenticated users)
CREATE POLICY "Enable delete for authenticated users only" ON products
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify the policies were created
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- 5. Test if we can insert a product (this should work now)
-- Note: You might need to be authenticated in Supabase to test this
INSERT INTO products (
  name, 
  description, 
  category, 
  model, 
  "inStock", 
  "showInFeatured", 
  "isActive"
) VALUES (
  'Test Product', 
  'Test Description', 
  'Test Category', 
  'TEST-001', 
  true, 
  false, 
  true
) ON CONFLICT (id) DO NOTHING;

-- 6. Clean up test data
DELETE FROM products WHERE name = 'Test Product';

-- 7. Check if RLS is enabled on the table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'products';
