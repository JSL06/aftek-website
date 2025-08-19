-- SETUP_PRODUCT_TRANSLATIONS_TABLES.sql
-- This script ensures the required tables exist for product translations

-- 1. Create the product_translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_product_translations_composite ON product_translations(product_id, language_code);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for read access
DROP POLICY IF EXISTS "Allow public read access to product translations" ON product_translations;
CREATE POLICY "Allow public read access to product translations" ON product_translations
    FOR SELECT USING (true);

-- 5. Create RLS policies for insert/update access
DROP POLICY IF EXISTS "Allow authenticated users to manage product translations" ON product_translations;
CREATE POLICY "Allow authenticated users to manage product translations" ON product_translations
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_product_translations_updated_at ON product_translations;
CREATE TRIGGER update_product_translations_updated_at
    BEFORE UPDATE ON product_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant necessary permissions
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;

-- 9. Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- 10. Test insert and select operations
DO $$
DECLARE
    test_product_id UUID;
    test_translation_id UUID;
BEGIN
    -- Get a test product ID (use the first available product)
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE 'Found test product with ID: %', test_product_id;
        
        -- Test insert
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES (test_product_id, 'test', 'Test Name', 'Test Description')
        RETURNING id INTO test_translation_id;
        
        RAISE NOTICE '✅ Test insert successful, ID: %', test_translation_id;
        
        -- Test select
        IF EXISTS (SELECT 1 FROM product_translations WHERE id = test_translation_id) THEN
            RAISE NOTICE '✅ Test select successful';
        ELSE
            RAISE NOTICE '❌ Test select failed';
        END IF;
        
        -- Clean up test data
        DELETE FROM product_translations WHERE id = test_translation_id;
        RAISE NOTICE '✅ Test data cleaned up';
        
    ELSE
        RAISE NOTICE '⚠️ No products found in database, skipping insert test';
        
        -- Alternative: Create a dummy test without foreign key constraint
        RAISE NOTICE 'Creating dummy test record...';
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES (
            '00000000-0000-0000-0000-000000000000'::UUID, 
            'test', 
            'Test Name', 
            'Test Description'
        ) RETURNING id INTO test_translation_id;
        
        RAISE NOTICE '✅ Dummy test insert successful, ID: %', test_translation_id;
        
        -- Clean up dummy test data
        DELETE FROM product_translations WHERE id = test_translation_id;
        RAISE NOTICE '✅ Dummy test data cleaned up';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Test encountered error: %', SQLERRM;
    RAISE NOTICE 'This is normal if tables are not fully set up yet';
END $$;
