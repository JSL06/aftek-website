-- CREATE_TABLE_SIMPLE.sql
-- Run this in your Supabase SQL Editor

-- Create the product_translations table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);

-- Enable RLS
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to product translations" ON product_translations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage product translations" ON product_translations
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;

-- Verify the table was created
SELECT 'product_translations table created successfully' as status;
