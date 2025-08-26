-- FIX_ARTICLE_MULTILINGUAL_COMPLETE.sql
-- This script completely fixes the multilingual article system

-- 1. First, ensure we have the articles table with proper structure
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    featured_image TEXT,
    read_time INTEGER DEFAULT 5,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Separate language columns for titles
    title_en TEXT,
    title_zh_hant TEXT,
    title_zh_hans TEXT,
    title_ja TEXT,
    title_ko TEXT,
    title_th TEXT,
    title_vi TEXT,
    
    -- Separate language columns for excerpts
    excerpt_en TEXT,
    excerpt_zh_hant TEXT,
    excerpt_zh_hans TEXT,
    excerpt_ja TEXT,
    excerpt_ko TEXT,
    excerpt_th TEXT,
    excerpt_vi TEXT,
    
    -- Separate language columns for authors
    author_en TEXT,
    author_zh_hant TEXT,
    author_zh_hans TEXT,
    author_ja TEXT,
    author_ko TEXT,
    author_th TEXT,
    author_vi TEXT,
    
    -- Separate language columns for categories
    category_en TEXT,
    category_zh_hant TEXT,
    category_zh_hans TEXT,
    category_ja TEXT,
    category_ko TEXT,
    category_th TEXT,
    category_vi TEXT,
    
    -- Separate language columns for content blocks
    content_blocks_en JSONB DEFAULT '[]'::jsonb,
    content_blocks_zh_hant JSONB DEFAULT '[]'::jsonb,
    content_blocks_zh_hans JSONB DEFAULT '[]'::jsonb,
    content_blocks_ja JSONB DEFAULT '[]'::jsonb,
    content_blocks_ko JSONB DEFAULT '[]'::jsonb,
    content_blocks_th JSONB DEFAULT '[]'::jsonb,
    content_blocks_vi JSONB DEFAULT '[]'::jsonb,
    
    -- Related content fields
    related_products TEXT[] DEFAULT '{}',
    related_links JSONB DEFAULT '[]'::jsonb,
    custom_buttons JSONB DEFAULT '[]'::jsonb
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- Language-specific indexes
CREATE INDEX IF NOT EXISTS idx_articles_title_en ON articles(title_en);
CREATE INDEX IF NOT EXISTS idx_articles_title_zh_hant ON articles(title_zh_hant);
CREATE INDEX IF NOT EXISTS idx_articles_title_zh_hans ON articles(title_zh_hans);
CREATE INDEX IF NOT EXISTS idx_articles_title_ja ON articles(title_ja);
CREATE INDEX IF NOT EXISTS idx_articles_title_ko ON articles(title_ko);
CREATE INDEX IF NOT EXISTS idx_articles_title_th ON articles(title_th);
CREATE INDEX IF NOT EXISTS idx_articles_title_vi ON articles(title_vi);

-- Content blocks indexes
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_en ON articles USING GIN(content_blocks_en);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_zh_hant ON articles USING GIN(content_blocks_zh_hant);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_zh_hans ON articles USING GIN(content_blocks_zh_hans);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_ja ON articles USING GIN(content_blocks_ja);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_ko ON articles USING GIN(content_blocks_ko);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_th ON articles USING GIN(content_blocks_th);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_vi ON articles USING GIN(content_blocks_vi);

-- 3. Create article tags table
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create article tags junction table
CREATE TABLE IF NOT EXISTS article_tags_junction (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 5. Create article images table
CREATE TABLE IF NOT EXISTS article_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    image_caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert some default tags
INSERT INTO article_tags (name) VALUES 
    ('Technical'), ('Industry'), ('Innovation'), ('Sustainability'), 
    ('Quality'), ('Safety'), ('Performance'), ('Research'), 
    ('Development'), ('Case Study')
ON CONFLICT (name) DO NOTHING;

-- 7. Create trigger to update updated_at column
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

-- 8. Create function to generate article slug
CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql;

-- 9. Sample article insertion removed to prevent hardcoded data conflicts
-- If you need sample data, insert it manually or create a separate data seeding script

-- 10. Verify the structure
SELECT 
    'Database Structure Verification' as check_type,
    COUNT(*) as total_articles,
    COUNT(CASE WHEN title_en IS NOT NULL THEN 1 END) as articles_with_english_titles,
    COUNT(CASE WHEN title_zh_hant IS NOT NULL THEN 1 END) as articles_with_traditional_chinese_titles,
    COUNT(CASE WHEN title_zh_hans IS NOT NULL THEN 1 END) as articles_with_simplified_chinese_titles,
    COUNT(CASE WHEN content_blocks_en IS NOT NULL THEN 1 END) as articles_with_english_content,
    COUNT(CASE WHEN content_blocks_zh_hant IS NOT NULL THEN 1 END) as articles_with_traditional_chinese_content
FROM articles;

-- 11. Show sample article data
SELECT 
    id,
    slug,
    title_en,
    title_zh_hant,
    title_zh_hans,
    title_ja,
    title_ko,
    title_th,
    title_vi,
    jsonb_typeof(content_blocks_en) as content_blocks_en_type,
    jsonb_typeof(content_blocks_zh_hant) as content_blocks_zh_hant_type,
    jsonb_typeof(content_blocks_zh_hans) as content_blocks_zh_hans_type,
    jsonb_typeof(content_blocks_ja) as content_blocks_ja_type,
    jsonb_typeof(content_blocks_ko) as content_blocks_ko_type,
    jsonb_typeof(content_blocks_th) as content_blocks_th_type,
    jsonb_typeof(content_blocks_vi) as content_blocks_vi_type
FROM articles
LIMIT 3;
