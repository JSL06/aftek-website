-- Test category saving operations
-- Run this in Supabase SQL Editor to verify the database is working

-- 1. Check if we can read from the table
SELECT 'Testing READ access' as test_type;
SELECT COUNT(*) as total_categories FROM product_categories;

-- 2. Test INSERT operation
SELECT 'Testing INSERT operation' as test_type;
INSERT INTO product_categories (name, description, display_order, is_active)
VALUES ('TEST_CATEGORY_' || EXTRACT(EPOCH FROM NOW())::INTEGER, 'Test category for debugging', 999, true)
RETURNING id, name, description, is_active;

-- 3. Test UPDATE operation
SELECT 'Testing UPDATE operation' as test_type;
UPDATE product_categories 
SET description = 'Updated test description - ' || NOW()::TEXT
WHERE name LIKE 'TEST_CATEGORY_%'
RETURNING id, name, description, is_active;

-- 4. Test DELETE operation (clean up test data)
SELECT 'Testing DELETE operation' as test_type;
DELETE FROM product_categories 
WHERE name LIKE 'TEST_CATEGORY_%'
RETURNING id, name;

-- 5. Show final state
SELECT 'Final state' as test_type;
SELECT COUNT(*) as total_categories FROM product_categories;
SELECT name, description, is_active FROM product_categories ORDER BY display_order LIMIT 5;
