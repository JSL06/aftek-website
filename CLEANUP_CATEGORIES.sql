-- Clean up categories to match user requirements
-- Run this in Supabase SQL Editor

-- 1. Check current state
SELECT 'Current categories before cleanup:' as status;
SELECT 
  id,
  name,
  description,
  display_order,
  is_active,
  created_at
FROM product_categories 
ORDER BY display_order;

-- 2. Show count of current categories
SELECT COUNT(*) as current_category_count FROM product_categories;

-- 3. Remove all existing categories
DELETE FROM product_categories;

-- 4. Insert the exact 6 categories specified by user
INSERT INTO product_categories (name, description, display_order, is_active) VALUES
('Waterproofing', 'Waterproofing solutions and materials', 1, true),
('Sealant', 'Sealant products and solutions', 2, true),
('Adhesive', 'Adhesive products and solutions', 3, true),
('Redi-Mix G&M', 'Ready-mix grout and mortar products', 4, true),
('Flooring', 'Flooring systems and materials', 5, true),
('Other Specialties', 'Other specialty construction materials', 6, true);

-- 5. Verify final state
SELECT 'Categories cleanup complete!' as status;
SELECT 
  display_order,
  name,
  description,
  is_active
FROM product_categories 
ORDER BY display_order;

-- 6. Final count
SELECT COUNT(*) as final_category_count FROM product_categories;
