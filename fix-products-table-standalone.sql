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
SELECT 'Products table structure verified' as status;

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