-- Complete Products Table Fix - Add All Missing Columns
-- This script adds all missing columns that the productService expects

-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at column to products table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at column to products table';
    END IF;
    
    -- Add displayOrder column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'displayOrder') THEN
        ALTER TABLE products ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
        UPDATE products SET "displayOrder" = 99 WHERE "displayOrder" IS NULL;
        RAISE NOTICE 'Added displayOrder column to products table';
    END IF;
    
    -- Add showInFeatured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInFeatured') THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
        UPDATE products SET "showInFeatured" = false WHERE "showInFeatured" IS NULL;
        RAISE NOTICE 'Added showInFeatured column to products table';
    END IF;
    
    -- Add showInProducts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInProducts') THEN
        ALTER TABLE products ADD COLUMN "showInProducts" BOOLEAN DEFAULT true;
        UPDATE products SET "showInProducts" = true WHERE "showInProducts" IS NULL;
        RAISE NOTICE 'Added showInProducts column to products table';
    END IF;
    
    -- Add price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        ALTER TABLE products ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
        UPDATE products SET price = 0 WHERE price IS NULL;
        RAISE NOTICE 'Added price column to products table';
    END IF;
    
    -- Add model column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model') THEN
        ALTER TABLE products ADD COLUMN model TEXT DEFAULT '';
        UPDATE products SET model = '' WHERE model IS NULL;
        RAISE NOTICE 'Added model column to products table';
    END IF;
    
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT DEFAULT '';
        UPDATE products SET sku = '' WHERE sku IS NULL;
        RAISE NOTICE 'Added sku column to products table';
    END IF;
    
    -- Add specifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'specifications') THEN
        ALTER TABLE products ADD COLUMN specifications TEXT DEFAULT '{}';
        UPDATE products SET specifications = '{}' WHERE specifications IS NULL;
        RAISE NOTICE 'Added specifications column to products table';
    END IF;
    
    -- Add names column if it doesn't exist (for multilingual names)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'names') THEN
        ALTER TABLE products ADD COLUMN names TEXT DEFAULT '{}';
        UPDATE products SET names = '{}' WHERE names IS NULL;
        RAISE NOTICE 'Added names column to products table';
    END IF;
    
    -- Add related_products column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'related_products') THEN
        ALTER TABLE products ADD COLUMN related_products TEXT DEFAULT '[]';
        UPDATE products SET related_products = '[]' WHERE related_products IS NULL;
        RAISE NOTICE 'Added related_products column to products table';
    END IF;
    
    -- Add dateAdded column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dateAdded') THEN
        ALTER TABLE products ADD COLUMN "dateAdded" TIMESTAMPTZ DEFAULT NOW();
        UPDATE products SET "dateAdded" = NOW() WHERE "dateAdded" IS NULL;
        RAISE NOTICE 'Added dateAdded column to products table';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added tags column to products table';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,1) DEFAULT 0;
        UPDATE products SET rating = 0 WHERE rating IS NULL;
        RAISE NOTICE 'Added rating column to products table';
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT ARRAY[]::text[];
        RAISE NOTICE 'Added sizes column to products table';
    END IF;
    
    -- Ensure existing columns have proper defaults
    -- Update any NULL values in existing columns
    UPDATE products SET 
        description = COALESCE(description, ''),
        image = COALESCE(image, '/placeholder.svg'),
        category = COALESCE(category, 'Others'),
        in_stock = COALESCE(in_stock, true),
        "isActive" = COALESCE("isActive", true)
    WHERE description IS NULL 
       OR image IS NULL 
       OR category IS NULL 
       OR in_stock IS NULL 
       OR "isActive" IS NULL;
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
CREATE INDEX IF NOT EXISTS idx_products_displayOrder ON products("displayOrder");
CREATE INDEX IF NOT EXISTS idx_products_showInFeatured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_showInProducts ON products("showInProducts");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_isActive ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Verify the changes
SELECT 'Products table structure updated successfully!' as status;

-- Show all columns in the products table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 