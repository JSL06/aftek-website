-- Setup Product Categories Table and Data
-- This script creates the product_categories table and populates it with existing categories

-- Step 1: Create the product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

-- Step 3: Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at 
    BEFORE UPDATE ON product_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Insert the existing categories from the system
-- These are the categories shown in the first image
INSERT INTO product_categories (name, description, display_order, is_active) VALUES
    ('Waterproofing', 'Waterproofing materials and systems for construction applications', 1, true),
    ('Sealants & Adhesives', 'Sealants, adhesives, and bonding materials for various construction needs', 2, true),
    ('Redi-Mix G&M', 'Ready-mix grouts and mortars for construction and repair', 3, true),
    ('Flooring Systems', 'Complete flooring solutions including materials and installation systems', 4, true),
    ('Others (Insulation, Coatings)', 'Additional construction materials including insulation and protective coatings', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Add a category_id column to the products table if it doesn't exist
-- This will link products to categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    END IF;
END $$;

-- Step 6: Update existing products to use the new category system
-- Map existing category text to new category IDs
UPDATE products 
SET category_id = pc.id
FROM product_categories pc
WHERE products.category = pc.name;

-- Step 7: Verify the setup
SELECT 
    'Table created successfully' as status,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories
FROM product_categories;

-- Step 8: Show the categories that were created
SELECT 
    name,
    description,
    display_order,
    is_active,
    CASE 
        WHEN parent_id IS NULL THEN 'Top Level'
        ELSE 'Sub-category'
    END as category_type
FROM product_categories 
ORDER BY display_order;

-- Step 9: Show products and their category mappings
SELECT 
    p.name as product_name,
    p.category as old_category,
    pc.name as new_category_name,
    CASE 
        WHEN pc.id IS NOT NULL THEN '✅ Mapped'
        ELSE '❌ Not Mapped'
    END as mapping_status
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LIMIT 10;
