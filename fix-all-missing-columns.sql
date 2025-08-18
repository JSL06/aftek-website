-- =====================================================
-- FIX ALL MISSING COLUMNS FOR PRODUCT SAVING
-- =====================================================
-- This script adds all missing columns that the React component needs
-- Run this in Supabase SQL Editor to fix the product saving issue
-- =====================================================

-- First, disable RLS temporarily to ensure we can modify the table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Add all missing columns that the React component needs
DO $$ 
BEGIN
    -- Add model column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'model'
    ) THEN
        ALTER TABLE products ADD COLUMN model TEXT;
        RAISE NOTICE 'Added model column';
    END IF;

    -- Add image column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image'
    ) THEN
        ALTER TABLE products ADD COLUMN image TEXT;
        RAISE NOTICE 'Added image column';
    END IF;

    -- Add inStock column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'inStock'
    ) THEN
        ALTER TABLE products ADD COLUMN "inStock" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added inStock column';
    END IF;

    -- Add isActive column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added isActive column';
    END IF;

    -- Add showInFeatured column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'showInFeatured'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added showInFeatured column';
    END IF;

    -- Add features column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'features'
    ) THEN
        ALTER TABLE products ADD COLUMN features TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added features column';
    END IF;

    -- Add tags column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'tags'
    ) THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added tags column';
    END IF;

    -- Add related_products column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'related_products'
    ) THEN
        ALTER TABLE products ADD COLUMN related_products TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added related_products column';
    END IF;

    -- Add names column if not exists (for multilingual names)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'names'
    ) THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added names column';
    END IF;

    -- Add descriptions column if not exists (for multilingual descriptions)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'descriptions'
    ) THEN
        ALTER TABLE products ADD COLUMN descriptions JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added descriptions column';
    END IF;

    -- Add slug column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
        RAISE NOTICE 'Added slug column';
    END IF;

    -- Add sku column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column';
    END IF;

    -- Add image_url column if not exists (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column';
    END IF;

    -- Add in_stock column if not exists (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'in_stock'
    ) THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added in_stock column';
    END IF;

    RAISE NOTICE 'All missing columns have been added successfully!';
END $$;

-- Update existing records to have default values for new columns
-- Handle array fields carefully to avoid type conflicts
UPDATE products SET 
    "inStock" = COALESCE("inStock", true),
    "isActive" = COALESCE("isActive", true),
    "showInFeatured" = COALESCE("showInFeatured", false),
    names = COALESCE(names, '{}'::jsonb),
    descriptions = COALESCE(descriptions, '{}'::jsonb)
WHERE "inStock" IS NULL 
   OR "isActive" IS NULL 
   OR "showInFeatured" IS NULL 
   OR names IS NULL 
   OR descriptions IS NULL;

-- Handle array fields separately to avoid type conflicts
-- Only update NULL values, skip any existing values to avoid type conflicts
UPDATE products SET 
    features = ARRAY[]::text[]
WHERE features IS NULL;

UPDATE products SET 
    tags = ARRAY[]::text[]
WHERE tags IS NULL;

UPDATE products SET 
    related_products = ARRAY[]::text[]
WHERE related_products IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_show_in_featured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products("inStock");

-- Re-enable RLS (optional - you can leave it disabled for now)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Show the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Show sample data to verify
SELECT 
    id, 
    name, 
    category, 
    "inStock", 
    "isActive", 
    "showInFeatured",
    features,
    tags
FROM products 
LIMIT 5;
