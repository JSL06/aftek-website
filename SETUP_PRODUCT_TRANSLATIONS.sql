-- Setup product_translations table for multilingual product names and descriptions
-- Run this in Supabase SQL editor if the table is missing

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL CHECK (language_code IN ('zh-Hant', 'en', 'zh-Hans', 'ja', 'ko', 'th', 'vi')),
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_product_translations_product_language ON product_translations(product_id, language_code);

-- Enable Row Level Security
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public read access" ON product_translations;
CREATE POLICY "Public read access" ON product_translations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert" ON product_translations;
CREATE POLICY "Authenticated users can insert" ON product_translations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update" ON product_translations;
CREATE POLICY "Authenticated users can update" ON product_translations
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete" ON product_translations;
CREATE POLICY "Authenticated users can delete" ON product_translations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON product_translations TO authenticated;
GRANT ALL ON product_translations TO anon;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;
