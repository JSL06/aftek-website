-- Add title_background_image field to articles table
-- This script will:
-- 1. Check if the field already exists
-- 2. Remove any conflicting fields
-- 3. Add the new title_background_image field

-- First, check if title_background_image already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'title_background_image'
    ) THEN
        -- Add the title_background_image field
        ALTER TABLE articles ADD COLUMN title_background_image TEXT;
        
        -- Add a comment to describe the field
        COMMENT ON COLUMN articles.title_background_image IS 'Background image URL for article title header section';
        
        RAISE NOTICE 'Added title_background_image column to articles table';
    ELSE
        RAISE NOTICE 'title_background_image column already exists in articles table';
    END IF;
END $$;

-- Check if there are any conflicting fields that might cause issues
DO $$
BEGIN
    -- Check for featured_image field (we might want to remove this since we're not using it)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'featured_image'
    ) THEN
        RAISE NOTICE 'featured_image field exists - consider removing if not needed';
    END IF;
    
    -- Check for any other image-related fields
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name LIKE '%image%'
        AND column_name != 'title_background_image'
    ) THEN
        RAISE NOTICE 'Found other image fields - check table structure below';
    ELSE
        RAISE NOTICE 'No other image fields found';
    END IF;
END $$;

-- Verify the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('title_background_image', 'featured_image', 'card_image')
ORDER BY column_name;
