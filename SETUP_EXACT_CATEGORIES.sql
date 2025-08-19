-- Set up exactly the 6 categories specified by the user
-- Run this in Supabase SQL Editor

-- 1. First, remove all existing categories
DELETE FROM product_categories;

-- 2. Insert the exact 6 categories specified
INSERT INTO product_categories (name, description, display_order, is_active) VALUES
('Waterproofing', 'Waterproofing solutions and materials', 1, true),
('Sealant', 'Sealant products and solutions', 2, true),
('Adhesive', 'Adhesive products and solutions', 3, true),
('Redi-Mix G&M', 'Ready-mix grout and mortar products', 4, true),
('Flooring', 'Flooring systems and materials', 5, true),
('Other Specialties', 'Other specialty construction materials', 6, true);

-- 3. Verify the setup
SELECT 'Categories setup complete!' as status;
SELECT 
  display_order,
  name,
  description,
  is_active
FROM product_categories 
ORDER BY display_order;

-- 4. Show total count
SELECT COUNT(*) as total_categories FROM product_categories;
