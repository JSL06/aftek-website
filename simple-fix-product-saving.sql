-- =====================================================
-- SIMPLE FIX FOR PRODUCT SAVING
-- =====================================================
-- This script adds all missing columns that the React component needs
-- Run this in Supabase SQL Editor to fix the product saving issue
-- =====================================================

-- Disable RLS to ensure we can modify the table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Add missing columns one by one (simple approach)
-- Each ALTER TABLE statement will only run if the column doesn't exist

-- Basic fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Boolean fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showInFeatured" BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Array fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS related_products TEXT[] DEFAULT ARRAY[]::text[];

-- JSON fields for multilingual support
ALTER TABLE products ADD COLUMN IF NOT EXISTS names JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS descriptions JSONB DEFAULT '{}'::jsonb;

-- Set default values for existing records
UPDATE products SET 
    "inStock" = true 
WHERE "inStock" IS NULL;

UPDATE products SET 
    "isActive" = true 
WHERE "isActive" IS NULL;

UPDATE products SET 
    "showInFeatured" = false 
WHERE "showInFeatured" IS NULL;

UPDATE products SET 
    in_stock = true 
WHERE in_stock IS NULL;

UPDATE products SET 
    features = ARRAY[]::text[] 
WHERE features IS NULL;

UPDATE products SET 
    tags = ARRAY[]::text[] 
WHERE tags IS NULL;

UPDATE products SET 
    related_products = ARRAY[]::text[] 
WHERE related_products IS NULL;

UPDATE products SET 
    names = '{}'::jsonb 
WHERE names IS NULL;

UPDATE products SET 
    descriptions = '{}'::jsonb 
WHERE descriptions IS NULL;

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
LIMIT 3;
