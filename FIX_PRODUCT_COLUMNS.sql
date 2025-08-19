-- Fix missing columns in products table
-- Run this in Supabase SQL Editor if category or model columns are missing

-- 1. Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category VARCHAR(255);
    RAISE NOTICE 'Added category column to products table';
  ELSE
    RAISE NOTICE 'Category column already exists';
  END IF;
END $$;

-- 2. Add model column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'model'
  ) THEN
    ALTER TABLE products ADD COLUMN model VARCHAR(255);
    RAISE NOTICE 'Added model column to products table';
  ELSE
    RAISE NOTICE 'Model column already exists';
  END IF;
END $$;

-- 3. Add inStock column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'inStock'
  ) THEN
    ALTER TABLE products ADD COLUMN "inStock" BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added inStock column to products table';
  ELSE
    RAISE NOTICE 'inStock column already exists';
  END IF;
END $$;

-- 4. Add showInFeatured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'showInFeatured'
  ) THEN
    ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added showInFeatured column to products table';
  ELSE
    RAISE NOTICE 'showInFeatured column already exists';
  END IF;
END $$;

-- 5. Add isActive column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'isActive'
  ) THEN
    ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added isActive column to products table';
  ELSE
    RAISE NOTICE 'isActive column already exists';
  END IF;
END $$;

-- 6. Verify the final structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name IN ('category', 'model', 'inStock', 'showInFeatured', 'isActive')
ORDER BY column_name;

-- 7. Show sample data to confirm columns work
SELECT 
  id,
  name,
  category,
  model,
  "inStock",
  "showInFeatured",
  "isActive"
FROM products 
LIMIT 3;
