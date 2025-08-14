-- =====================================================
-- AFTEK WEBSITE - DATABASE UPDATE FOR CATEGORIES
-- =====================================================
-- This script adds product categories and filter options
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE PRODUCT CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE FILTER OPTIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS filter_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(type, value)
);

-- =====================================================
-- 3. ADD CATEGORY_ID TO PRODUCTS TABLE (if not exists)
-- =====================================================

-- Check if category_id column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- 4. INSERT DEFAULT PRODUCT CATEGORIES
-- =====================================================

INSERT INTO product_categories (name, description, display_order, is_active) VALUES
('Construction Chemicals', 'Chemical products for construction applications', 1, true),
('Adhesives & Sealants', 'Adhesive and sealing solutions', 2, true),
('Waterproofing', 'Waterproofing membranes and coatings', 3, true),
('Flooring Solutions', 'Flooring adhesives and materials', 4, true),
('Concrete & Mortar', 'Concrete additives and mortar products', 5, true),
('Protective Coatings', 'Protective and decorative coatings', 6, true),
('Repair & Maintenance', 'Repair and maintenance products', 7, true),
('Industrial Solutions', 'Industrial-grade chemical solutions', 8, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 5. INSERT DEFAULT FILTER OPTIONS
-- =====================================================

-- Project Categories
INSERT INTO filter_options (type, value, display_order, is_active) VALUES
('category', 'Infrastructure', 1, true),
('category', 'Industrial', 2, true),
('category', 'Commercial', 3, true),
('category', 'Residential', 4, true),
('category', 'Healthcare', 5, true),
('category', 'Education', 6, true),
('category', 'Transportation', 7, true),
('category', 'Energy', 8, true)
ON CONFLICT (type, value) DO NOTHING;

-- Project Features
INSERT INTO filter_options (type, value, display_order, is_active) VALUES
('feature', 'Energy Efficient', 1, true),
('feature', 'Sustainable Design', 2, true),
('feature', 'Smart Technology', 3, true),
('feature', 'Modular Construction', 4, true),
('feature', 'Green Building', 5, true),
('feature', 'LEED Certified', 6, true),
('feature', 'BIM Implementation', 7, true),
('feature', 'Prefabricated Components', 8, true),
('feature', 'Renewable Energy', 9, true),
('feature', 'Water Conservation', 10, true)
ON CONFLICT (type, value) DO NOTHING;

-- Project Locations
INSERT INTO filter_options (type, value, display_order, is_active) VALUES
('location', 'Taiwan', 1, true),
('location', 'Southeast Asia', 2, true),
('location', 'China', 3, true),
('location', 'Japan', 4, true),
('location', 'South Korea', 5, true),
('location', 'Australia', 6, true),
('location', 'Middle East', 7, true),
('location', 'Europe', 8, true),
('location', 'North America', 9, true)
ON CONFLICT (type, value) DO NOTHING;

-- Project Types
INSERT INTO filter_options (type, value, display_order, is_active) VALUES
('project_type', 'New Construction', 1, true),
('project_type', 'Renovation', 2, true),
('project_type', 'Retrofit', 3, true),
('project_type', 'Maintenance', 4, true),
('project_type', 'Infrastructure', 5, true),
('project_type', 'Industrial', 6, true),
('project_type', 'Commercial', 7, true),
('project_type', 'Residential', 8, true)
ON CONFLICT (type, value) DO NOTHING;

-- =====================================================
-- 6. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_filter_options_type ON filter_options(type);
CREATE INDEX IF NOT EXISTS idx_filter_options_display_order ON filter_options(display_order);
CREATE INDEX IF NOT EXISTS idx_filter_options_is_active ON filter_options(is_active);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- =====================================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Product Categories policies
DROP POLICY IF EXISTS "Public read access for product_categories" ON product_categories;
CREATE POLICY "Public read access for product_categories" ON product_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage product_categories" ON product_categories;
CREATE POLICY "Authenticated users can manage product_categories" ON product_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Filter Options policies
DROP POLICY IF EXISTS "Public read access for filter_options" ON filter_options;
CREATE POLICY "Public read access for filter_options" ON filter_options
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage filter_options" ON filter_options;
CREATE POLICY "Authenticated users can manage filter_options" ON filter_options
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filter_options_updated_at ON filter_options;
CREATE TRIGGER update_filter_options_updated_at
    BEFORE UPDATE ON filter_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT 'product_categories' as table_name, COUNT(*) as row_count FROM product_categories
UNION ALL
SELECT 'filter_options' as table_name, COUNT(*) as row_count FROM filter_options;

-- Check if category_id was added to products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'category_id';

-- =====================================================
-- SCRIPT COMPLETED
-- =====================================================
-- You can now use the CategoryManager and FilterManager
-- in your admin dashboard to manage categories and filters
