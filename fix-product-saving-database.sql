-- Fix Product Saving Database Issues
-- Run this script in your Supabase SQL Editor to ensure all columns exist

-- 1. Check if all necessary columns exist in the products table
DO $$
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to products table';
    ELSE
        RAISE NOTICE 'Category column already exists in products table';
    END IF;

    -- Add model column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model') THEN
        ALTER TABLE products ADD COLUMN model TEXT;
        RAISE NOTICE 'Added model column to products table';
    ELSE
        RAISE NOTICE 'Model column already exists in products table';
    END IF;

    -- Add inStock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'inStock') THEN
        ALTER TABLE products ADD COLUMN "inStock" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added inStock column to products table';
    ELSE
        RAISE NOTICE 'inStock column already exists in products table';
    END IF;

    -- Add showInFeatured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInFeatured') THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added showInFeatured column to products table';
    ELSE
        RAISE NOTICE 'showInFeatured column already exists in products table';
    END IF;

    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isActive') THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added isActive column to products table';
    ELSE
        RAISE NOTICE 'isActive column already exists in products table';
    END IF;
END $$;

-- 2. Ensure product_translations table exists and has correct structure
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);

-- 4. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for products table
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Create RLS policies for product_translations table
DROP POLICY IF EXISTS "Enable read access for all users" ON product_translations;
CREATE POLICY "Enable read access for all users" ON product_translations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON product_translations;
CREATE POLICY "Enable insert for authenticated users only" ON product_translations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON product_translations;
CREATE POLICY "Enable update for authenticated users only" ON product_translations
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON product_translations;
CREATE POLICY "Enable delete for authenticated users only" ON product_translations
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Verify the current table structure
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

SELECT 
    'product_translations' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- 8. Show sample data to verify everything is working
SELECT 
    'Current products count:' as info,
    COUNT(*) as count
FROM products;

SELECT 
    'Current translations count:' as info,
    COUNT(*) as count
FROM product_translations;

-- 9. Test data - show a few products with their translations
SELECT 
    p.id,
    p.name as original_name,
    p.category,
    p.model,
    p."inStock",
    p."showInFeatured",
    p."isActive",
    pt.language_code,
    pt.name as translated_name,
    pt.description as translated_description
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
ORDER BY p.id, pt.language_code
LIMIT 20;
