-- Setup Article Tags System
-- This script creates the necessary tables and relationships for article tags

-- Create tags table
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article_tags_junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS article_tags_junction (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, tag_id)
);

-- Insert some default tags
INSERT INTO article_tags (name) VALUES
    ('Technical'),
    ('Industry'),
    ('Innovation'),
    ('Sustainability'),
    ('Quality'),
    ('Safety'),
    ('Performance'),
    ('Research'),
    ('Development'),
    ('Case Study')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_article_id ON article_tags_junction(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_tag_id ON article_tags_junction(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_name ON article_tags(name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_tags_updated_at 
    BEFORE UPDATE ON article_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON article_tags TO authenticated;
GRANT ALL ON article_tags_junction TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'Tags table created successfully' as status;
SELECT COUNT(*) as tag_count FROM article_tags;
SELECT 'Article tags system is ready' as status;
