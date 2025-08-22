-- ADD_SPECIFICATIONS_COLUMN.sql
-- Run this in your Supabase SQL Editor to add specifications support

-- 1. Check if specifications column exists in product_translations table
SELECT 'Checking product_translations table for specifications column:' as info;

DO $$
BEGIN
    -- Check if specifications column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_translations'
        AND column_name = 'specifications'
    ) THEN
        -- Add specifications column to product_translations table
        ALTER TABLE product_translations ADD COLUMN specifications TEXT;
        RAISE NOTICE 'Added specifications column to product_translations table';
    ELSE
        RAISE NOTICE 'Specifications column already exists in product_translations table';
    END IF;
END $$;

-- 2. Update existing product_translations with NULL specifications if NULL
UPDATE product_translations 
SET specifications = NULL 
WHERE specifications IS NULL;

-- 3. Show the updated table structure
SELECT 'Updated product_translations table structure:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_translations'
ORDER BY ordinal_position;

-- 4. Show sample data
SELECT 'Sample product_translations with specifications:' as info;

SELECT 
    pt.product_id,
    pt.language_code,
    pt.name,
    LEFT(pt.description, 50) as description_preview,
    LEFT(pt.specifications, 50) as specifications_preview,
    pt.created_at
FROM product_translations pt
LIMIT 5;

-- 5. Example usage
SELECT 'INSERT INTO product_translations (product_id, language_code, name, description, specifications) VALUES (product_id, language_code, name, description, specifications);' as example;

SELECT 'Specifications can now be stored per language in the product_translations table.' as details;
