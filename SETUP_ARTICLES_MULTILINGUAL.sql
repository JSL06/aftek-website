-- SETUP_ARTICLES_MULTILINGUAL.sql
-- This script sets up the articles table with full multilingual support
-- Run this in your Supabase SQL editor

-- Check if tables exist and handle gracefully
DO $$ 
BEGIN
    -- Check if article_tags_junction exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_tags_junction') THEN
        -- Create article_tags_junction table for many-to-many relationship
        CREATE TABLE article_tags_junction (
            article_id UUID,
            tag_id UUID,
            PRIMARY KEY (article_id, tag_id)
        );
    END IF;
    
    -- Check if article_tags exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_tags') THEN
        -- Create tags table for article tags
        CREATE TABLE article_tags (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Check if article_images exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_images') THEN
        -- Create article images table for uploaded images
        CREATE TABLE article_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            article_id UUID,
            image_url TEXT NOT NULL,
            alt_text TEXT,
            caption TEXT,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Check if articles exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        -- Create articles table with multilingual support and content blocks
        CREATE TABLE articles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            featured_image TEXT,
            read_time INTEGER DEFAULT 5,
            published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_published BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Multilingual fields
            titles JSONB DEFAULT '{}',
            contents JSONB DEFAULT '{}',
            excerpts JSONB DEFAULT '{}',
            authors_multilingual JSONB DEFAULT '{}',
            categories_multilingual JSONB DEFAULT '{}',
            
            -- Content blocks for inline editor
            content_blocks JSONB DEFAULT '[]'
        );
    END IF;
END $$;

-- Add missing columns to existing tables if they don't exist
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

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key for article_images if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_article_images_article_id' 
        AND table_name = 'article_images'
    ) THEN
        ALTER TABLE article_images ADD CONSTRAINT fk_article_images_article_id 
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign keys for article_tags_junction if they don't exist
    -- First, remove any existing constraints to avoid duplicates
    ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_article_id_fkey;
    ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_tag_id_fkey;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_article_tags_junction_article_id' 
        AND table_name = 'article_tags_junction'
    ) THEN
        ALTER TABLE article_tags_junction ADD CONSTRAINT fk_article_tags_junction_article_id 
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_article_tags_junction_tag_id' 
        AND table_name = 'article_tags_junction'
    ) THEN
        ALTER TABLE article_tags_junction ADD CONSTRAINT fk_article_tags_junction_tag_id 
            FOREIGN KEY (tag_id) REFERENCES article_tags(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles USING GIN(categories_multilingual);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks ON articles USING GIN(content_blocks);
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON article_images(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_article_id ON article_tags_junction(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_junction_tag_id ON article_tags_junction(tag_id);

-- Enable Row Level Security if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'articles' AND rowsecurity = true) THEN
        ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'article_tags' AND rowsecurity = true) THEN
        ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'article_images' AND rowsecurity = true) THEN
        ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'article_tags_junction' AND rowsecurity = true) THEN
        ALTER TABLE article_tags_junction ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Articles are insertable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles are updatable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles are deletable by authenticated users" ON articles;

-- Create policies for articles
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Articles are insertable by authenticated users" ON articles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Articles are updatable by authenticated users" ON articles
    FOR UPDATE USING (true);

CREATE POLICY "Articles are deletable by authenticated users" ON articles
    FOR DELETE USING (true);

-- Drop and recreate policies for other tables
DROP POLICY IF EXISTS "Article tags are viewable by everyone" ON article_tags;
DROP POLICY IF EXISTS "Article tags are insertable by authenticated users" ON article_tags;
DROP POLICY IF EXISTS "Article tags are updatable by authenticated users" ON article_tags;
DROP POLICY IF EXISTS "Article tags are deletable by authenticated users" ON article_tags;

CREATE POLICY "Article tags are viewable by everyone" ON article_tags
    FOR SELECT USING (true);

CREATE POLICY "Article tags are insertable by authenticated users" ON article_tags
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article tags are updatable by authenticated users" ON article_tags
    FOR UPDATE USING (true);

CREATE POLICY "Article tags are deletable by authenticated users" ON article_tags
    FOR DELETE USING (true);

-- Drop and recreate policies for article_images
DROP POLICY IF EXISTS "Article images are viewable by everyone" ON article_images;
DROP POLICY IF EXISTS "Article images are insertable by authenticated users" ON article_images;
DROP POLICY IF EXISTS "Article images are updatable by authenticated users" ON article_images;
DROP POLICY IF EXISTS "Article images are deletable by authenticated users" ON article_images;

CREATE POLICY "Article images are viewable by everyone" ON article_images
    FOR SELECT USING (true);

CREATE POLICY "Article images are insertable by authenticated users" ON article_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article images are updatable by authenticated users" ON article_images
    FOR UPDATE USING (true);

CREATE POLICY "Article images are deletable by authenticated users" ON article_images
    FOR DELETE USING (true);

-- Drop and recreate policies for article_tags_junction
DROP POLICY IF EXISTS "Article tags junction are viewable by everyone" ON article_tags_junction;
DROP POLICY IF EXISTS "Article tags junction are insertable by authenticated users" ON article_tags_junction;
DROP POLICY IF EXISTS "Article tags junction are updatable by authenticated users" ON article_tags_junction;
DROP POLICY IF EXISTS "Article tags junction are deletable by authenticated users" ON article_tags_junction;

CREATE POLICY "Article tags junction are viewable by everyone" ON article_tags_junction
    FOR SELECT USING (true);

CREATE POLICY "Article tags junction are insertable by authenticated users" ON article_tags_junction
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article tags junction are updatable by authenticated users" ON article_tags_junction
    FOR UPDATE USING (true);

CREATE POLICY "Article tags junction are deletable by authenticated users" ON article_tags_junction
    FOR DELETE USING (true);

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;

-- Create trigger
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace function to generate article slug
CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convert title to slug format
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM articles WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON articles TO authenticated;
GRANT ALL ON articles TO anon;
GRANT ALL ON article_tags TO authenticated;
GRANT ALL ON article_tags TO anon;
GRANT ALL ON article_images TO authenticated;
GRANT ALL ON article_images TO anon;
GRANT ALL ON article_tags_junction TO authenticated;
GRANT ALL ON article_tags_junction TO anon;

-- Enable realtime for tables (optional, for real-time updates)
DO $$ 
BEGIN
    -- Check if supabase_realtime publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add tables to realtime if not already added
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'articles') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE articles;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'article_tags') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE article_tags;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'article_images') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE article_images;
        END IF;
    END IF;
END $$;

-- Insert default tags only if they don't exist
INSERT INTO article_tags (name) 
SELECT 'News' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'News');

INSERT INTO article_tags (name) 
SELECT 'Technology' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Technology');

INSERT INTO article_tags (name) 
SELECT 'Industry' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Industry');

INSERT INTO article_tags (name) 
SELECT 'Company' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Company');

INSERT INTO article_tags (name) 
SELECT 'Product' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Product');

INSERT INTO article_tags (name) 
SELECT 'Technical' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Technical');

INSERT INTO article_tags (name) 
SELECT 'Case Study' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Case Study');

INSERT INTO article_tags (name) 
SELECT 'Market Analysis' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Market Analysis');

INSERT INTO article_tags (name) 
SELECT 'Sustainability' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Sustainability');

INSERT INTO article_tags (name) 
SELECT 'Innovation' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Innovation');

INSERT INTO article_tags (name) 
SELECT 'Research' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Research');

INSERT INTO article_tags (name) 
SELECT 'Development' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Development');

INSERT INTO article_tags (name) 
SELECT 'Manufacturing' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Manufacturing');

INSERT INTO article_tags (name) 
SELECT 'Quality' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Quality');

INSERT INTO article_tags (name) 
SELECT 'Safety' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Safety');

INSERT INTO article_tags (name) 
SELECT 'Environment' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Environment');

INSERT INTO article_tags (name) 
SELECT 'Regulations' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Regulations');

INSERT INTO article_tags (name) 
SELECT 'Standards' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Standards');

INSERT INTO article_tags (name) 
SELECT 'Best Practices' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Best Practices');

INSERT INTO article_tags (name) 
SELECT 'Trends' WHERE NOT EXISTS (SELECT 1 FROM article_tags WHERE name = 'Trends');

-- Insert sample articles only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'sample-article-all-components') THEN
        INSERT INTO articles (slug, titles, contents, excerpts, authors_multilingual, categories_multilingual, is_published) VALUES
        (
            'sample-article-all-components',
            '{"en": "Sample Article - All Components", "zh-Hant": "測試文章 - 所有組件", "zh-Hans": "测试文章 - 所有组件", "ja": "テスト記事 - すべてのコンポーネント", "ko": "테스트 기사 - 모든 구성 요소", "th": "บทความทดสอบ - ส่วนประกอบทั้งหมด", "vi": "Bài viết kiểm tra - Tất cả các thành phần"}',
            '{"en": "This is a test article to demonstrate all available components.", "zh-Hant": "這是一篇測試文章，用於展示所有可用的組件。", "zh-Hans": "这是一篇测试文章，用于展示所有可用的组件。", "ja": "これは利用可能なすべてのコンポーネントを実演するためのテスト記事です。", "ko": "이것은 사용 가능한 모든 구성 요소를 시연하기 위한 테스트 기사입니다.", "th": "นี่คือบทความทดสอบเพื่อแสดงส่วนประกอบทั้งหมดที่มีอยู่", "vi": "Đây là một bài viết kiểm tra để trình diễn tất cả các thành phần có sẵn."}',
            '{"en": "A comprehensive test article showcasing all editor components.", "zh-Hant": "展示所有編輯器組件的綜合測試文章。", "zh-Hans": "展示所有编辑器组件的综合测试文章。", "ja": "すべてのエディターコンポーネントを紹介する包括的なテスト記事。", "ko": "모든 편집기 구성 요소를 보여주는 포괄적인 테스트 기사。", "th": "บทความทดสอบที่ครอบคลุมซึ่งแสดงส่วนประกอบของตัวแก้ไขทั้งหมด", "vi": "Một bài viết kiểm tra toàn diện giới thiệu tất cả các thành phần của trình soạn thảo."}',
            '{"en": "Test Author", "zh-Hant": "測試作者", "zh-Hans": "测试作者", "ja": "テスト著者", "ko": "테스트 저자", "th": "ผู้เขียนทดสอบ", "vi": "Tác giả kiểm tra"}',
            '{"en": "Technical", "zh-Hant": "技術", "zh-Hans": "技术", "ja": "技術", "ko": "기술", "th": "เทคนิค", "vi": "Kỹ thuật"}',
            true
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'industry-trends-in-adhesives-and-coatings') THEN
        INSERT INTO articles (slug, titles, contents, excerpts, authors_multilingual, categories_multilingual, is_published) VALUES
        (
            'industry-trends-in-adhesives-and-coatings',
            '{"en": "Industry Trends in Adhesives and Coatings", "zh-Hant": "黏合劑和塗料行業趨勢", "zh-Hans": "黏合剂和涂料行业趋势", "ja": "接着剤・コーティング業界のトレンド", "ko": "접착제 및 코팅 산업 동향", "th": "แนวโน้มอุตสาหกรรมในกาวและสารเคลือบ", "vi": "Xu hướng ngành công nghiệp trong chất kết dính và lớp phủ"}',
            '{"en": "The adhesives and coatings industry is experiencing significant growth with new technologies and sustainable solutions emerging.", "zh-Hant": "黏合劑和塗料行業正在經歷顯著增長，新技術和可持續解決方案不斷湧現。", "zh-Hans": "黏合剂和涂料行业正在经历显著增长，新技术和可持续解决方案不断涌现。", "ja": "接着剤・コーティング業界は、新技術と持続可能なソリューションの台頭により、大幅な成長を遂げています。", "ko": "접착제 및 코팅 산업은 새로운 기술과 지속 가능한 솔루션의 출현으로 상당한 성장을 경험하고 있습니다.", "th": "อุตสาหกรรมกาวและสารเคลือบกำลังประสบกับการเติบโตอย่างมีนัยสำคัญพร้อมกับเทคโนโลยีใหม่และโซลูชันที่ยั่งยืนที่เกิดขึ้น", "vi": "Ngành công nghiệp chất kết dính và lớp phủ đang trải qua sự tăng trưởng đáng kể với các công nghệ mới và giải pháp bền vững đang nổi lên."}',
            '{"en": "Explore the latest trends in adhesives and coatings, from sustainable solutions to advanced technologies.", "zh-Hant": "探索黏合劑和塗料的最新趨勢，從可持續解決方案到先進技術。", "zh-Hans": "探索黏合剂和涂料的最新趋势，从可持续解决方案到先进技术。", "ja": "持続可能なソリューションから先進技術まで、接着剤・コーティングの最新トレンドを探る。", "ko": "지속 가능한 솔루션부터 첨단 기술까지 접착제 및 코팅의 최신 동향을 탐구하세요.", "th": "สำรวจแนวโน้มล่าสุดในกาวและสารเคลือบ ตั้งแต่โซลูชันที่ยั่งยืนไปจนถึงเทคโนโลยีขั้นสูง", "vi": "Khám phá các xu hướng mới nhất trong chất kết dính và lớp phủ, từ các giải pháp bền vững đến công nghệ tiên tiến."}',
            '{"en": "Industry Expert", "zh-Hant": "行業專家", "zh-Hans": "行业专家", "ja": "業界専門家", "ko": "업계 전문가", "th": "ผู้เชี่ยวชาญด้านอุตสาหกรรม", "vi": "Chuyên gia ngành công nghiệp"}',
            '{"en": "Industry News", "zh-Hant": "行業新聞", "zh-Hans": "行业新闻", "ja": "業界ニュース", "ko": "업계 뉴스", "th": "ข่าวอุตสาหกรรม", "vi": "Tin tức ngành công nghiệp"}',
            true
        );
    END IF;
END $$;

-- Link sample articles to tags (only if not already linked)
DO $$ 
DECLARE
    sample_article_id UUID;
    technical_tag_id UUID;
    industry_news_tag_id UUID;
    technology_tag_id UUID;
    trends_tag_id UUID;
BEGIN
    -- Get sample article IDs
    SELECT id INTO sample_article_id FROM articles WHERE slug = 'sample-article-all-components';
    SELECT id INTO technical_tag_id FROM article_tags WHERE name = 'Technical';
    
    -- Link sample article to Technical tag if not already linked
    IF sample_article_id IS NOT NULL AND technical_tag_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM article_tags_junction WHERE article_id = sample_article_id AND tag_id = technical_tag_id) THEN
            INSERT INTO article_tags_junction (article_id, tag_id) VALUES (sample_article_id, technical_tag_id);
        END IF;
    END IF;
    
    -- Get industry trends article ID
    SELECT id INTO sample_article_id FROM articles WHERE slug = 'industry-trends-in-adhesives-and-coatings';
    SELECT id INTO industry_news_tag_id FROM article_tags WHERE name = 'Industry News';
    SELECT id INTO technology_tag_id FROM article_tags WHERE name = 'Technology';
    SELECT id INTO trends_tag_id FROM article_tags WHERE name = 'Trends';
    
    -- Link industry trends article to tags if not already linked
    IF sample_article_id IS NOT NULL AND industry_news_tag_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM article_tags_junction WHERE article_id = sample_article_id AND tag_id = industry_news_tag_id) THEN
            INSERT INTO article_tags_junction (article_id, tag_id) VALUES (sample_article_id, industry_news_tag_id);
        END IF;
    END IF;
    
    IF sample_article_id IS NOT NULL AND technology_tag_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM article_tags_junction WHERE article_id = sample_article_id AND tag_id = technology_tag_id) THEN
            INSERT INTO article_tags_junction (article_id, tag_id) VALUES (sample_article_id, technology_tag_id);
        END IF;
    END IF;
    
    IF sample_article_id IS NOT NULL AND trends_tag_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM article_tags_junction WHERE article_id = sample_article_id AND tag_id = trends_tag_id) THEN
            INSERT INTO article_tags_junction (article_id, tag_id) VALUES (sample_article_id, trends_tag_id);
        END IF;
    END IF;
END $$;
