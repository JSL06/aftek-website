-- Debug categories to see which ones are active vs inactive
-- Run this in Supabase SQL Editor

-- 1. Show all categories with their active status
SELECT 
  id,
  name,
  description,
  is_active,
  display_order,
  created_at
FROM product_categories 
ORDER BY display_order, name;

-- 2. Count active vs inactive categories
SELECT 
  COUNT(*) as total_categories,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_categories
FROM product_categories;

-- 3. Show only active categories (what frontend should see)
SELECT 
  name,
  description,
  display_order
FROM product_categories 
WHERE is_active = true
ORDER BY display_order, name;

-- 4. Show only inactive categories (what admin sees but frontend doesn't)
SELECT 
  name,
  description,
  display_order
FROM product_categories 
WHERE is_active = false
ORDER BY display_order, name;
