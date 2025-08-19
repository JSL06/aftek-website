-- SAFELY FIX EXISTING PRODUCT TRANSLATIONS TABLE
-- This script checks what exists and fixes issues without recreating existing policies
-- Run this in Supabase SQL Editor

-- 1. Check if the table exists and show its current structure
SELECT 'Checking existing table structure...' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- 2. Check existing RLS policies
SELECT 'Checking existing RLS policies...' as status;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_translations';

-- 3. Check table permissions
SELECT 'Checking table permissions...' as status;

SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'product_translations';

-- 4. Check if RLS is enabled
SELECT 'Checking RLS status...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'product_translations';

-- 5. Safely enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'product_translations' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on product_translations table';
    ELSE
        RAISE NOTICE 'RLS already enabled on product_translations table';
    END IF;
END $$;

-- 6. Check what policies are missing and create only the missing ones
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Check if SELECT policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_translations' 
        AND policyname = 'Allow public read access to product translations'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Allow public read access to product translations" ON product_translations
            FOR SELECT USING (true);
        RAISE NOTICE 'Created SELECT policy';
    ELSE
        RAISE NOTICE 'SELECT policy already exists';
    END IF;
    
    -- Check if INSERT policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_translations' 
        AND policyname = 'Allow authenticated users to insert product translations'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Allow authenticated users to insert product translations" ON product_translations
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Created INSERT policy';
    ELSE
        RAISE NOTICE 'INSERT policy already exists';
    END IF;
    
    -- Check if UPDATE policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_translations' 
        AND policyname = 'Allow authenticated users to update product translations'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Allow authenticated users to update product translations" ON product_translations
            FOR UPDATE USING (true);
        RAISE NOTICE 'Created UPDATE policy';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists';
    END IF;
    
    -- Check if DELETE policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_translations' 
        AND policyname = 'Allow authenticated users to delete product translations'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Allow authenticated users to delete product translations" ON product_translations
            FOR DELETE USING (true);
        RAISE NOTICE 'Created DELETE policy';
    ELSE
        RAISE NOTICE 'DELETE policy already exists';
    END IF;
END $$;

-- 7. Grant permissions (this will not fail if already granted)
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;

-- 8. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_product_translations_name ON product_translations(name);
CREATE INDEX IF NOT EXISTS idx_product_translations_description ON product_translations(description);

-- 9. Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_product_translations_updated_at'
    ) THEN
        CREATE TRIGGER update_product_translations_updated_at 
            BEFORE UPDATE ON product_translations 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger';
    ELSE
        RAISE NOTICE 'updated_at trigger already exists';
    END IF;
END $$;

-- 11. Show final status
SELECT 'Product translations table setup complete!' as status;

-- 12. Show current table state
SELECT 
    'Current table state:' as info,
    COUNT(*) as total_translations
FROM product_translations;

-- 13. Show sample data if any exists
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
