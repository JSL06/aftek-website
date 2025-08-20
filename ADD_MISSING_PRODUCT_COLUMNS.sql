-- Add missing columns to products table for new functionality
-- This script adds the projects_used and specifications columns that are referenced in the code

-- 1. Add projects_used column (array of project IDs where this product was used)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'projects_used'
    ) THEN
        ALTER TABLE products ADD COLUMN projects_used TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added projects_used column to products table';
    ELSE
        RAISE NOTICE 'projects_used column already exists in products table';
    END IF;
END $$;

-- 2. Add specifications column (JSONB for multilingual technical specifications)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'specifications'
    ) THEN
        ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added specifications column to products table';
    ELSE
        RAISE NOTICE 'specifications column already exists in products table';
    END IF;
END $$;

-- 3. Update existing records to have default values
UPDATE products SET 
    projects_used = ARRAY[]::text[] 
WHERE projects_used IS NULL;

UPDATE products SET 
    specifications = '{}'::jsonb 
WHERE specifications IS NULL;

-- 4. Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name IN ('projects_used', 'specifications')
ORDER BY column_name;

-- 5. Show sample data to confirm
SELECT 
    id, 
    name, 
    projects_used, 
    specifications
FROM products 
LIMIT 3;

-- Script completed successfully! New columns added to products table.
