-- Add related_products column to products table if it doesn't exist
-- Run this in Supabase SQL Editor

-- 1. Add related_products column as JSONB to store array of product IDs
-- First check if column exists and what type it is
DO $$ 
BEGIN
    -- If column exists but is wrong type, drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'related_products'
        AND data_type != 'jsonb'
    ) THEN
        ALTER TABLE products DROP COLUMN related_products;
    END IF;
END $$;

-- Now add the column with correct type
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS related_products JSONB DEFAULT '[]'::jsonb;

-- 2. Create index for better performance (drop first if exists)
DROP INDEX IF EXISTS idx_products_related_products;
CREATE INDEX idx_products_related_products 
ON products USING GIN (related_products);

-- 3. Add constraint to ensure it's always an array (drop first if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_related_products_is_array'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT check_related_products_is_array;
    END IF;
END $$;

ALTER TABLE products 
ADD CONSTRAINT check_related_products_is_array 
CHECK (jsonb_typeof(related_products) = 'array');

-- 4. Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'related_products';

-- 5. Show sample data
SELECT 
  id, 
  name, 
  related_products,
  pg_typeof(related_products) as data_type
FROM products 
LIMIT 5;
