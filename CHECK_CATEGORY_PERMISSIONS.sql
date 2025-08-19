-- Check RLS policies and permissions for product_categories table
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'product_categories';

-- 2. Check all RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_categories';

-- 3. Check table permissions for different roles
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'product_categories';

-- 4. Check if the table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_categories'
ORDER BY ordinal_position;

-- 5. Test current user permissions
SELECT 
  current_user as current_user_role,
  session_user as session_user_role;

-- 6. Check if we can perform basic operations as current user
SELECT 'Testing current user permissions' as test_type;

-- Try to read
SELECT COUNT(*) as can_read FROM product_categories;

-- Try to insert (this might fail due to RLS)
DO $$
BEGIN
  INSERT INTO product_categories (name, description, display_order, is_active)
  VALUES ('PERMISSION_TEST', 'Testing permissions', 999, true);
  RAISE NOTICE 'INSERT successful - user has INSERT permission';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'INSERT failed: %', SQLERRM;
END $$;

-- Clean up test insert
DELETE FROM product_categories WHERE name = 'PERMISSION_TEST';
