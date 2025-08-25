-- SETUP_ARTICLES_MULTILINGUAL.sql
-- This script sets up the articles table with full multilingual support
-- Run this in your Supabase SQL editor

-- Drop existing articles table if it exists (this will remove all data)
DROP TABLE IF EXISTS articles CASCADE;

-- Create articles table with multilingual support and content blocks
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    featured_image TEXT,
    read_time INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    content_blocks JSONB DEFAULT '[]',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Multilingual fields
    titles JSONB DEFAULT '{}',
    contents JSONB DEFAULT '{}',
    excerpts JSONB DEFAULT '{}',
    authors_multilingual JSONB DEFAULT '{}',
    categories_multilingual JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_articles_category ON articles USING GIN(categories_multilingual);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX idx_articles_content_blocks ON articles USING GIN(content_blocks);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Articles are insertable by authenticated users" ON articles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Articles are updatable by authenticated users" ON articles
    FOR UPDATE USING (true);

CREATE POLICY "Articles are deletable by authenticated users" ON articles
    FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON articles TO authenticated;
GRANT ALL ON articles TO anon;

-- Enable realtime for articles table (optional, for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE articles;

-- Insert sample articles AFTER table creation
INSERT INTO articles (slug, titles, contents, excerpts, authors_multilingual, categories_multilingual, is_published) VALUES
(
    'sample-article-1',
    '{"en": "Sample Article 1", "zh-Hant": "範例文章 1", "zh-Hans": "示例文章 1", "ja": "サンプル記事 1", "ko": "샘플 기사 1", "th": "ตัวอย่างบทความ 1", "vi": "Bài viết mẫu 1"}',
    '{"en": "This is a sample article content.", "zh-Hant": "這是範例文章內容。", "zh-Hans": "这是示例文章内容。", "ja": "これはサンプル記事の内容です。", "ko": "이것은 샘플 기사 내용입니다.", "th": "นี่คือเนื้อหาบทความตัวอย่าง", "vi": "Đây là nội dung bài viết mẫu"}',
    '{"en": "A brief excerpt of the sample article.", "zh-Hant": "範例文章的簡短摘要。", "zh-Hans": "示例文章的简短摘要。", "ja": "サンプル記事の簡単な抜粋。", "ko": "샘플 기사의 간단한 발췌.", "th": "บทคัดย่อสั้นๆ ของบทความตัวอย่าง", "vi": "Tóm tắt ngắn gọn của bài viết mẫu"}',
    '{"en": "Sample Author", "zh-Hant": "範例作者", "zh-Hans": "示例作者", "ja": "サンプル著者", "ko": "샘플 저자", "th": "ผู้เขียนตัวอย่าง", "vi": "Tác giả mẫu"}',
    '{"en": "News", "zh-Hant": "新聞", "zh-Hans": "新闻", "ja": "ニュース", "ko": "뉴스", "th": "ข่าว", "vi": "Tin tức"}',
    true
),
(
    'sample-article-2',
    '{"en": "Sample Article 2", "zh-Hant": "範例文章 2", "zh-Hans": "示例文章 2", "ja": "サンプル記事 2", "ko": "샘플 기사 2", "th": "ตัวอย่างบทความ 2", "vi": "Bài viết mẫu 2"}',
    '{"en": "Another sample article content.", "zh-Hant": "另一個範例文章內容。", "zh-Hans": "另一个示例文章内容。", "ja": "別のサンプル記事の内容。", "ko": "또 다른 샘플 기사 내용.", "th": "เนื้อหาบทความตัวอย่างอีกบทความ", "vi": "Nội dung bài viết mẫu khác"}',
    '{"en": "Second article excerpt.", "zh-Hant": "第二篇文章摘要。", "zh-Hans": "第二篇文章摘要。", "ja": "2番目の記事の抜粋。", "ko": "두 번째 기사 발췌.", "th": "บทคัดย่อบทความที่สอง", "vi": "Tóm tắt bài viết thứ hai"}',
    '{"en": "Another Author", "zh-Hant": "另一位作者", "zh-Hans": "另一位作者", "ja": "別の著者", "ko": "또 다른 저자", "th": "ผู้เขียนอีกคน", "vi": "Tác giả khác"}',
    '{"en": "Technical", "zh-Hant": "技術", "zh-Hans": "技术", "ja": "技術", "ko": "기술", "th": "เทคนิค", "vi": "Kỹ thuật"}',
    true
);
