-- Fix Article Content Persistence Issues
-- This script ensures all article fields are properly configured and content is saved correctly

-- 1. Ensure all required columns exist in articles table
DO $$ BEGIN
    -- Add missing related content fields to articles table
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_products TEXT[];
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_links JSONB;
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
    
    -- Add created_at and updated_at fields if they don't exist
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'Columns already exist, skipping...';
END $$;

-- 2. Set default values for existing articles to prevent NULL issues
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
    read_time = COALESCE(read_time, 5),
    published_at = COALESCE(published_at, NOW()),
    is_published = COALESCE(is_published, false),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
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
    is_published IS NULL OR
    created_at IS NULL OR
    updated_at IS NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_categories ON articles USING GIN(categories_multilingual);
CREATE INDEX IF NOT EXISTS idx_articles_titles ON articles USING GIN(titles);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks ON articles USING GIN(content_blocks);

-- 4. Ensure RLS policies allow updates
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

-- 5. Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Ensure article_tags table exists and has proper structure
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ensure article_tags_junction table exists and has proper structure
CREATE TABLE IF NOT EXISTS article_tags_junction (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, tag_id)
);

-- 8. Ensure article_images table exists and has proper structure
CREATE TABLE IF NOT EXISTS article_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create indexes for junction and images tables
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_article_id ON article_tags_junction(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_tag_id ON article_tags_junction(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON article_images(article_id);

-- 10. Insert some default tags if none exist
INSERT INTO article_tags (name) VALUES 
    ('Industry News'),
    ('Technical Guide'),
    ('Case Study'),
    ('Product Update'),
    ('Best Practices'),
    ('Innovation'),
    ('Sustainability'),
    ('Quality Control')
ON CONFLICT (name) DO NOTHING;

-- 11. Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- 12. Show sample article data to verify content
SELECT 
    id,
    slug,
    featured_image,
    read_time,
    is_published,
    created_at,
    updated_at,
    jsonb_typeof(titles) as titles_type,
    jsonb_typeof(contents) as contents_type,
    jsonb_typeof(excerpts) as excerpts_type,
    jsonb_typeof(authors_multilingual) as authors_type,
    jsonb_typeof(categories_multilingual) as categories_type,
    jsonb_typeof(content_blocks) as content_blocks_type,
    CASE 
        WHEN related_products IS NULL THEN 'NULL'
        WHEN array_length(related_products, 1) IS NULL THEN 'empty array'
        ELSE 'array with ' || array_length(related_products, 1) || ' elements'
    END as related_products_type,
    jsonb_typeof(related_links) as related_links_type,
    jsonb_typeof(custom_buttons) as custom_buttons_type
FROM articles 
LIMIT 5;
