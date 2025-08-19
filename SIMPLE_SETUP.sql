-- SIMPLE_SETUP.sql
-- Simple script to create the product_translations table

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
    FOR ALL USING (true);

-- 6. Grant necessary permissions
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;

-- 7. Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- 8. Show table count
SELECT COUNT(*) as product_translations_count FROM product_translations;
