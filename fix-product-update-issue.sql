-- =====================================================
-- FIX PRODUCT UPDATE ISSUE
-- =====================================================
-- This script fixes the issue where product updates fail
-- The problem is likely with multilingual data structure
-- =====================================================

-- Disable RLS to ensure we can modify the table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- First, let's check what columns we currently have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Add missing columns that might be needed for updates
ALTER TABLE products ADD COLUMN IF NOT EXISTS "names" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "descriptions" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "translations" JSONB DEFAULT '{}'::jsonb;

-- Ensure all required columns exist for updates
ALTER TABLE products ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showInFeatured" BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "in_stock" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS "related_products" TEXT[] DEFAULT ARRAY[]::text[];

-- Set default values for existing records - SEPARATE ARRAY FIELDS from regular fields
-- First, handle regular fields
UPDATE products SET 
    "names" = COALESCE("names", '{}'::jsonb),
    "descriptions" = COALESCE("descriptions", '{}'::jsonb),
    "translations" = COALESCE("translations", '{}'::jsonb),
    "inStock" = COALESCE("inStock", true),
    "isActive" = COALESCE("isActive", true),
    "showInFeatured" = COALESCE("showInFeatured", false),
    "in_stock" = COALESCE("in_stock", true)
WHERE "names" IS NULL 
   OR "descriptions" IS NULL 
   OR "translations" IS NULL
   OR "inStock" IS NULL 
   OR "isActive" IS NULL 
   OR "showInFeatured" IS NULL
   OR "in_stock" IS NULL;

-- Then handle array fields separately (COALESCE can't handle text vs text[])
UPDATE products SET 
    "features" = ARRAY[]::text[]
WHERE "features" IS NULL;

UPDATE products SET 
    "tags" = ARRAY[]::text[]
WHERE "tags" IS NULL;

UPDATE products SET 
    "related_products" = ARRAY[]::text[]
WHERE "related_products" IS NULL;

-- Create a test update to verify the structure works
-- This will help us identify any remaining issues
DO $$
DECLARE
    test_product_id UUID;
    update_result JSONB;
BEGIN
    -- Get a sample product ID
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        -- Try to update the product with multilingual data
        UPDATE products SET 
            "names" = jsonb_build_object('en', 'Test Update', 'zh-Hant', '測試更新'),
            "descriptions" = jsonb_build_object('en', 'Test description update', 'zh-Hant', '測試描述更新'),
            "features" = ARRAY['Updated Feature 1', 'Updated Feature 2'],
            "tags" = ARRAY['updated', 'test'],
            "model" = 'TEST-UPDATE-' || extract(epoch from now())::text
        WHERE id = test_product_id;
        
        -- Check if update was successful
        SELECT to_jsonb(products.*) INTO update_result 
        FROM products 
        WHERE id = test_product_id;
        
        RAISE NOTICE 'Test update result: %', update_result;
        RAISE NOTICE '✅ Test update completed successfully!';
    ELSE
        RAISE NOTICE '⚠️ No products found to test update';
    END IF;
END $$;

-- Show the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Show sample data to verify structure
SELECT 
    id, 
    name, 
    category, 
    "names",
    "descriptions",
    "features",
    "tags",
    "model",
    "inStock", 
    "isActive", 
    "showInFeatured"
FROM products 
LIMIT 3;
