-- COMPLETE SETUP FOR PRODUCT TRANSLATIONS TABLE
-- This script will create the table, set permissions, and ensure it works exactly like descriptions
-- Run this in Supabase SQL Editor

-- 1. Create the product_translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_product_translations_name ON product_translations(name);
CREATE INDEX IF NOT EXISTS idx_product_translations_description ON product_translations(description);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for full access
-- Allow public read access
CREATE POLICY "Allow public read access to product translations" ON product_translations
    FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert product translations" ON product_translations
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update product translations" ON product_translations
    FOR UPDATE USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete product translations" ON product_translations
    FOR DELETE USING (true);

-- 5. Grant permissions to authenticated and anon users
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;

-- 6. Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_translations_updated_at 
    BEFORE UPDATE ON product_translations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert sample data to test the table
-- First, check if we have any products
DO $$
DECLARE
    product_count INTEGER;
    sample_product_id UUID;
BEGIN
    -- Count products
    SELECT COUNT(*) INTO product_count FROM products;
    
    IF product_count > 0 THEN
        -- Get a sample product ID
        SELECT id INTO sample_product_id FROM products LIMIT 1;
        
        -- Insert sample translations for the first product
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES 
            (sample_product_id, 'en', 'Sample English Name', 'Sample English Description'),
            (sample_product_id, 'zh-Hant', '樣本中文名稱', '樣本中文描述'),
            (sample_product_id, 'ja', 'サンプル日本語名', 'サンプル日本語の説明')
        ON CONFLICT (product_id, language_code) 
        DO UPDATE SET 
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            updated_at = NOW();
            
        RAISE NOTICE 'Sample translations inserted for product %', sample_product_id;
    ELSE
        RAISE NOTICE 'No products found, skipping sample data insertion';
    END IF;
END $$;

-- 8. Verify the table was created and has data
SELECT 'product_translations table setup complete' as status;

-- 9. Show the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- 10. Show sample data
SELECT 
    pt.id,
    pt.product_id,
    pt.language_code,
    pt.name,
    pt.description,
    pt.created_at,
    pt.updated_at
FROM product_translations pt
LIMIT 5;

-- 11. Test basic operations
DO $$
DECLARE
    test_product_id UUID;
    test_translation_id UUID;
BEGIN
    -- Get a sample product ID
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        -- Test insert
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES (test_product_id, 'test', 'Test Name', 'Test Description')
        RETURNING id INTO test_translation_id;
        
        RAISE NOTICE 'Test insert successful, ID: %', test_translation_id;
        
        -- Test update
        UPDATE product_translations 
        SET name = 'Updated Test Name' 
        WHERE id = test_translation_id;
        
        RAISE NOTICE 'Test update successful';
        
        -- Test select
        IF EXISTS (SELECT 1 FROM product_translations WHERE id = test_translation_id) THEN
            RAISE NOTICE 'Test select successful';
        END IF;
        
        -- Clean up test data
        DELETE FROM product_translations WHERE id = test_translation_id;
        RAISE NOTICE 'Test cleanup successful';
        
    ELSE
        RAISE NOTICE 'No products available for testing';
    END IF;
END $$;
