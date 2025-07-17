-- Fix products table schema
-- Run this in your Supabase SQL editor

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$ 
BEGIN
    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    -- Add showInFeatured column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'showInFeatured'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    END IF;
    
    -- Add displayOrder column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'displayOrder'
    ) THEN
        ALTER TABLE products ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
    END IF;
    
    -- Add dateAdded column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'dateAdded'
    ) THEN
        ALTER TABLE products ADD COLUMN "dateAdded" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add names column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'names'
    ) THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}';
    END IF;
    
    -- Add related_products column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'related_products'
    ) THEN
        ALTER TABLE products ADD COLUMN related_products JSONB DEFAULT '[]';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE products ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sizes'
    ) THEN
        ALTER TABLE products ADD COLUMN sizes JSONB DEFAULT '[]';
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
    END IF;
    
    -- Add showInProducts column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'showInProducts'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInProducts" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing records to have created_at if they don't have it
UPDATE products 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Update existing records to have dateAdded if they don't have it
UPDATE products 
SET "dateAdded" = NOW() 
WHERE "dateAdded" IS NULL;

-- Set default values for boolean columns
UPDATE products 
SET "isActive" = true 
WHERE "isActive" IS NULL;

UPDATE products 
SET "showInFeatured" = false 
WHERE "showInFeatured" IS NULL;

UPDATE products 
SET "showInProducts" = true 
WHERE "showInProducts" IS NULL;

UPDATE products 
SET "displayOrder" = 99 
WHERE "displayOrder" IS NULL;

-- Set default values for JSON columns
UPDATE products 
SET names = '{}' 
WHERE names IS NULL;

UPDATE products 
SET related_products = '[]' 
WHERE related_products IS NULL;

UPDATE products 
SET tags = '[]' 
WHERE tags IS NULL;

UPDATE products 
SET sizes = '[]' 
WHERE sizes IS NULL;

-- Set default values for other columns
UPDATE products 
SET rating = 0 
WHERE rating IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_isActive ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_showInFeatured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_displayOrder ON products("displayOrder");

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Fix Products Table - Add Missing Columns
-- This script adds the missing created_at and updated_at columns to the existing products table

-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        -- Update existing rows to have a created_at value
        UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at column to products table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        -- Update existing rows to have an updated_at value
        UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at column to products table';
    END IF;
END $$;

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at 
            BEFORE UPDATE ON products 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update trigger for products table';
    END IF;
END $$;

-- Add performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name; 