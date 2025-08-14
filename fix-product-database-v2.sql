-- =====================================================
-- AFTEK WEBSITE - FIX PRODUCT DATABASE STRUCTURE (V2)
-- =====================================================
-- This script fixes the product table structure to match the UnifiedProduct interface
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD MISSING COLUMNS TO PRODUCTS TABLE
-- =====================================================

-- Add names column for multilingual names
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'names'
    ) THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add isActive column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add showInFeatured column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'showInFeatured'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add tags column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'tags'
    ) THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add related_products column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'related_products'
    ) THEN
        ALTER TABLE products ADD COLUMN related_products TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add translations column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'translations'
    ) THEN
        ALTER TABLE products ADD COLUMN translations JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add features column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'features'
    ) THEN
        ALTER TABLE products ADD COLUMN features TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add model column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'model'
    ) THEN
        ALTER TABLE products ADD COLUMN model TEXT;
    END IF;
END $$;

-- Add sku column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
    END IF;
END $$;

-- Add slug column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Add inStock column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'inStock'
    ) THEN
        ALTER TABLE products ADD COLUMN "inStock" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 2. UPDATE EXISTING DATA (SAFE VERSION)
-- =====================================================

-- Update existing products to have default values - using safe UPDATE without ON CONFLICT
UPDATE products 
SET 
    names = '{}'
WHERE names IS NULL;

UPDATE products 
SET 
    "isActive" = true
WHERE "isActive" IS NULL;

UPDATE products 
SET 
    "showInFeatured" = false
WHERE "showInFeatured" IS NULL;

UPDATE products 
SET 
    tags = '{}'
WHERE tags IS NULL;

UPDATE products 
SET 
    related_products = '{}'
WHERE related_products IS NULL;

UPDATE products 
SET 
    translations = '{}'
WHERE translations IS NULL;

UPDATE products 
SET 
    features = '{}'
WHERE features IS NULL;

UPDATE products 
SET 
    "inStock" = true
WHERE "inStock" IS NULL;

-- =====================================================
-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_show_in_featured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products("inStock");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- =====================================================
-- 4. VERIFY TABLE STRUCTURE
-- =====================================================

-- Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check sample data
SELECT 
    id,
    name,
    category,
    "isActive",
    "showInFeatured",
    "inStock",
    created_at
FROM products 
LIMIT 5;

-- =====================================================
-- SCRIPT COMPLETED
-- =====================================================
-- After running this script, the product update errors should be resolved
-- The table structure will now match the UnifiedProduct interface
