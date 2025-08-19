-- Set up product_categories table for managing product categories
-- Run this in Supabase SQL Editor

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES product_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public read access and authenticated write access
-- Allow public read access to active categories
DROP POLICY IF EXISTS "Allow public read access to active categories" ON product_categories;
CREATE POLICY "Allow public read access to active categories" ON product_categories
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to manage categories (for admin panel)
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON product_categories;
CREATE POLICY "Allow authenticated users to manage categories" ON product_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert some default categories if the table is empty
INSERT INTO product_categories (name, description, display_order, is_active)
SELECT 
  'Adhesives' as name,
  'Industrial and construction adhesives' as description,
  1 as display_order,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE name = 'Adhesives');

INSERT INTO product_categories (name, description, display_order, is_active)
SELECT 
  'Coatings' as name,
  'Protective and decorative coatings' as description,
  2 as display_order,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE name = 'Coatings');

INSERT INTO product_categories (name, description, display_order, is_active)
SELECT 
  'Sealants' as name,
  'Construction and industrial sealants' as description,
  3 as display_order,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE name = 'Sealants');

-- 7. Show the result
SELECT 'Categories table setup complete!' as status;
SELECT COUNT(*) as total_categories FROM product_categories;
SELECT name, description, is_active FROM product_categories ORDER BY display_order;
