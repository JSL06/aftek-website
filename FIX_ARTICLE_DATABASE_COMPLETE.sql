-- Comprehensive fix for article database issues
-- This script ensures all fields exist and are properly configured for saving articles

DO $$ BEGIN
    -- Add missing related content fields to articles table
    -- These fields are causing the 400 error when saving articles
    
    -- Add related_products field (array of strings)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_products TEXT[];
    
    -- Add related_links field (JSONB for structured link data)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_links JSONB;
    
    -- Add custom_buttons field (JSONB for button configurations)
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS custom_buttons JSONB;
    
    -- Add missing multilingual fields if they don't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS titles JSONB;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS contents JSONB;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpts JSONB;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS authors_multilingual JSONB;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS categories_multilingual JSONB;
    
    -- Add content_blocks field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks JSONB;
    
    -- Add slug field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;
    
    -- Add featured_image field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image TEXT;
    
    -- Add read_time field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_time INTEGER;
    
    -- Add published_at field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
    
    -- Add is_published field if it doesn't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
    
EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'Columns already exist, skipping...';
END $$;

-- Set default values for existing articles to prevent NULL issues
UPDATE articles 
SET 
    related_products = COALESCE(related_products, '{}'),
    related_links = COALESCE(related_links, '[]'),
    custom_buttons = COALESCE(custom_buttons, '[]'),
    titles = COALESCE(titles, '{}'),
    contents = COALESCE(contents, '{}'),
    excerpts = COALESCE(excerpts, '{}'),
    authors_multilingual = COALESCE(authors_multilingual, '{}'),
    categories_multilingual = COALESCE(categories_multilingual, '{}'),
    content_blocks = COALESCE(content_blocks, '[]'),
    slug = COALESCE(slug, ''),
    featured_image = COALESCE(featured_image, ''),
    read_time = COALESCE(read_time, 0),
    published_at = COALESCE(published_at, NOW()),
    is_published = COALESCE(is_published, false)
WHERE 
    related_products IS NULL OR 
    related_links IS NULL OR 
    custom_buttons IS NULL OR
    titles IS NULL OR
    contents IS NULL OR
    excerpts IS NULL OR
    authors_multilingual IS NULL OR
    categories_multilingual IS NULL OR
    content_blocks IS NULL OR
    slug IS NULL OR
    featured_image IS NULL OR
    read_time IS NULL OR
    published_at IS NULL OR
    is_published IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_categories ON articles USING GIN(categories_multilingual);

-- Ensure RLS policies allow updates
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON articles;
    
    -- Create comprehensive update policy
    CREATE POLICY "Enable update for authenticated users only" ON articles
        FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
        
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Policy already exists, skipping...';
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
    AND column_name IN (
        'related_products', 
        'related_links', 
        'custom_buttons',
        'titles',
        'contents',
        'excerpts',
        'authors_multilingual',
        'categories_multilingual',
        'content_blocks',
        'slug',
        'featured_image',
        'read_time',
        'published_at',
        'is_published'
    )
ORDER BY column_name;

-- Show sample data structure
SELECT 
    id,
    slug,
    related_products,
    related_links,
    custom_buttons,
    content_blocks
FROM articles 
LIMIT 3;
