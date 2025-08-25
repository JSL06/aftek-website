-- Add missing related content fields to articles table
-- This script adds the fields that are causing the 400 error when saving articles

DO $$ BEGIN
    -- Add related_products field (array of strings)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_products TEXT[];
    
    -- Add related_links field (JSONB for structured link data)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_links JSONB;
    
    -- Add custom_buttons field (JSONB for button configurations)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS custom_buttons JSONB;
    
    -- Set default values for existing articles
    UPDATE articles 
    SET 
        related_products = COALESCE(related_products, '{}'),
        related_links = COALESCE(related_links, '[]'),
        custom_buttons = COALESCE(custom_buttons, '[]')
    WHERE related_products IS NULL OR related_links IS NULL OR custom_buttons IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'Columns already exist, skipping...';
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
    AND column_name IN ('related_products', 'related_links', 'custom_buttons')
ORDER BY column_name;
