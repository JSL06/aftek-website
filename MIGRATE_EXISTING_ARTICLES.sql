-- Migration script for existing articles table
-- This script adds missing columns to an existing articles table without dropping it
-- Run this if you want to preserve existing data

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add content_blocks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_blocks') THEN
        ALTER TABLE articles ADD COLUMN content_blocks JSONB DEFAULT '[]';
    END IF;
    
    -- Add titles column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'titles') THEN
        ALTER TABLE articles ADD COLUMN titles JSONB DEFAULT '{}';
    END IF;
    
    -- Add contents column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'contents') THEN
        ALTER TABLE articles ADD COLUMN contents JSONB DEFAULT '{}';
    END IF;
    
    -- Add excerpts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpts') THEN
        ALTER TABLE articles ADD COLUMN excerpts JSONB DEFAULT '{}';
    END IF;
    
    -- Add authors_multilingual column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'authors_multilingual') THEN
        ALTER TABLE articles ADD COLUMN authors_multilingual JSONB DEFAULT '{}';
    END IF;
    
    -- Add categories_multilingual column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'categories_multilingual') THEN
        ALTER TABLE articles ADD COLUMN categories_multilingual JSONB DEFAULT '{}';
    END IF;
    
    -- Add featured_image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'featured_image') THEN
        ALTER TABLE articles ADD COLUMN featured_image TEXT;
    END IF;
    
    -- Add read_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'read_time') THEN
        ALTER TABLE articles ADD COLUMN read_time INTEGER DEFAULT 5;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'tags') THEN
        ALTER TABLE articles ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'slug') THEN
        ALTER TABLE articles ADD COLUMN slug TEXT;
    END IF;
    
    -- Add published_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_at') THEN
        ALTER TABLE articles ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'is_published') THEN
        ALTER TABLE articles ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'created_at') THEN
        ALTER TABLE articles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'updated_at') THEN
        ALTER TABLE articles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles USING GIN(categories_multilingual);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks ON articles USING GIN(content_blocks);

-- Enable Row Level Security if not already enabled
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Articles are insertable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles are updatable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles are deletable by authenticated users" ON articles;

-- Create policies
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Articles are insertable by authenticated users" ON articles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Articles are updatable by authenticated users" ON articles
    FOR UPDATE USING (true);

CREATE POLICY "Articles are deletable by authenticated users" ON articles
    FOR DELETE USING (true);

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON articles TO authenticated;
GRANT ALL ON articles TO anon;

-- Enable realtime for articles table (optional, for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
