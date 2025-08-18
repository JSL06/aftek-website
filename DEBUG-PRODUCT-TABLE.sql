-- Debug script to check products table structure and identify update issues

-- 1. Check if the products table exists and has the right structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'products'
);

-- 2. Check the actual column names in the products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if the specific product exists
SELECT id, name, category, "inStock", "showInFeatured", "isActive", model
FROM products 
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';

-- 4. Check RLS policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'products';

-- 5. Test a simple update to see what happens
UPDATE products 
SET "isActive" = true 
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
RETURNING id, name, "isActive";

-- 6. Check if there are any triggers or constraints
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';
