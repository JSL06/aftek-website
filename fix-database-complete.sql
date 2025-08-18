-- Complete database fix for multilingual products
-- This script will create the missing product_translations table and fix all issues

-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS product_translations CASCADE;

-- Step 2: Create the product_translations table
CREATE TABLE product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL CHECK (language_code IN ('zh-Hant', 'en', 'zh-Hans', 'ja', 'ko', 'th', 'vi')),
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX idx_product_translations_product_language ON product_translations(product_id, language_code);

-- Step 4: Enable Row Level Security
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Public read access" ON product_translations
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON product_translations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON product_translations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON product_translations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Create the function to get products with translations
CREATE OR REPLACE FUNCTION get_products_with_translations()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    model TEXT,
    features TEXT[],
    inStock BOOLEAN,
    showInFeatured BOOLEAN,
    isActive BOOLEAN,
    image TEXT,
    tags TEXT[],
    price NUMERIC,
    names JSONB,
    descriptions JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.category,
        p.model,
        p.features,
        p."inStock",
        p."showInFeatured",
        p."isActive",
        p.image,
        p.tags,
        p.price,
        COALESCE(
            jsonb_object_agg(
                pt.language_code, 
                pt.name
            ) FILTER (WHERE pt.name IS NOT NULL),
            '{}'::jsonb
        ) as names,
        COALESCE(
            jsonb_object_agg(
                pt.language_code, 
                pt.description
            ) FILTER (WHERE pt.description IS NOT NULL),
            '{}'::jsonb
        ) as descriptions,
        p.created_at,
        p.updated_at
    FROM products p
    LEFT JOIN product_translations pt ON p.id = pt.product_id
    WHERE p."isActive" = true
    GROUP BY p.id, p.name, p.description, p.category, p.model, p.features, 
             p."inStock", p."showInFeatured", p."isActive", p.image, p.tags, 
             p.price, p.created_at, p.updated_at
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Insert initial translations for all existing products
-- This will create translations for all 7 languages for each product
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'zh-Hant' as language_code,
    p.name as name,
    p.description as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert English translations (using existing names/descriptions or generating generic ones)
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'en' as language_code,
    COALESCE(p.name, 'Product ' || SUBSTRING(p.id::text, 1, 8)) as name,
    COALESCE(p.description, 'Product description for ' || SUBSTRING(p.id::text, 1, 8)) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert other language translations with basic content
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'zh-Hans' as language_code,
    '产品 ' || SUBSTRING(p.id::text, 1, 8) as name,
    '产品描述 ' || SUBSTRING(p.id::text, 1, 8) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'ja' as language_code,
    '製品 ' || SUBSTRING(p.id::text, 1, 8) as name,
    '製品説明 ' || SUBSTRING(p.id::text, 1, 8) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'ko' as language_code,
    '제품 ' || SUBSTRING(p.id::text, 1, 8) as name,
    '제품 설명 ' || SUBSTRING(p.id::text, 1, 8) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'th' as language_code,
    'ผลิตภัณฑ์ ' || SUBSTRING(p.id::text, 1, 8) as name,
    'คำอธิบายผลิตภัณฑ์ ' || SUBSTRING(p.id::text, 1, 8) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'vi' as language_code,
    'Sản phẩm ' || SUBSTRING(p.id::text, 1, 8) as name,
    'Mô tả sản phẩm ' || SUBSTRING(p.id::text, 1, 8) as description
FROM products p
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Step 8: Grant permissions
GRANT ALL ON product_translations TO authenticated;
GRANT ALL ON product_translations TO anon;
GRANT EXECUTE ON FUNCTION get_products_with_translations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_with_translations() TO anon;

-- Step 9: Show results
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_products FROM products WHERE "isActive" = true;
SELECT COUNT(*) as total_translations FROM product_translations;
SELECT language_code, COUNT(*) as translations_count FROM product_translations GROUP BY language_code ORDER BY language_code;
