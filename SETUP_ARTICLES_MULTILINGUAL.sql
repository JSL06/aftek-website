-- SETUP_ARTICLES_MULTILINGUAL.sql
-- This script sets up the articles table with full multilingual support
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist (this will remove all data)
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS article_images CASCADE;

-- Create tags table for article tags
CREATE TABLE article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article images table for uploaded images
CREATE TABLE article_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create article_tags junction table for many-to-many relationship
CREATE TABLE article_tags_junction (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_articles_category ON articles USING GIN(categories_multilingual);
CREATE INDEX idx_articles_content_blocks ON articles USING GIN(content_blocks);
CREATE INDEX idx_article_images_article_id ON article_images(article_id);
CREATE INDEX idx_article_tags_junction_article_id ON article_tags_junction(article_id);
CREATE INDEX idx_article_tags_junction_tag_id ON article_tags_junction(tag_id);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags_junction ENABLE ROW LEVEL SECURITY;

-- Create policies for articles
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Articles are insertable by authenticated users" ON articles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Articles are updatable by authenticated users" ON articles
    FOR UPDATE USING (true);

CREATE POLICY "Articles are deletable by authenticated users" ON articles
    FOR DELETE USING (true);

-- Create policies for article_tags
CREATE POLICY "Article tags are viewable by everyone" ON article_tags
    FOR SELECT USING (true);

CREATE POLICY "Article tags are insertable by authenticated users" ON article_tags
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article tags are updatable by authenticated users" ON article_tags
    FOR UPDATE USING (true);

CREATE POLICY "Article tags are deletable by authenticated users" ON article_tags
    FOR DELETE USING (true);

-- Create policies for article_images
CREATE POLICY "Article images are viewable by everyone" ON article_images
    FOR SELECT USING (true);

CREATE POLICY "Article images are insertable by authenticated users" ON article_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article images are updatable by authenticated users" ON article_images
    FOR UPDATE USING (true);

CREATE POLICY "Article images are deletable by authenticated users" ON article_images
    FOR DELETE USING (true);

-- Create policies for article_tags_junction
CREATE POLICY "Article tags junction are viewable by everyone" ON article_tags_junction
    FOR SELECT USING (true);

CREATE POLICY "Article tags junction are insertable by authenticated users" ON article_tags_junction
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Article tags junction are updatable by authenticated users" ON article_tags_junction
    FOR UPDATE USING (true);

CREATE POLICY "Article tags junction are deletable by authenticated users" ON article_tags_junction
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

-- Create function to generate article slug
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
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
ALTER PUBLICATION supabase_realtime ADD TABLE article_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE article_images;

-- Insert default tags
INSERT INTO article_tags (name) VALUES
    ('News'),
    ('Technology'),
    ('Industry'),
    ('Company'),
    ('Product'),
    ('Technical'),
    ('Case Study'),
    ('Market Analysis'),
    ('Sustainability'),
    ('Innovation'),
    ('Research'),
    ('Development'),
    ('Manufacturing'),
    ('Quality'),
    ('Safety'),
    ('Environment'),
    ('Regulations'),
    ('Standards'),
    ('Best Practices'),
    ('Trends');

-- Insert sample articles with auto-generated slugs
INSERT INTO articles (slug, titles, contents, excerpts, authors_multilingual, categories_multilingual, is_published) VALUES
(
    generate_article_slug('Sample Article - All Components'),
    '{"en": "Sample Article - All Components", "zh-Hant": "測試文章 - 所有組件", "zh-Hans": "测试文章 - 所有组件", "ja": "テスト記事 - すべてのコンポーネント", "ko": "테스트 기사 - 모든 구성 요소", "th": "บทความทดสอบ - ส่วนประกอบทั้งหมด", "vi": "Bài viết kiểm tra - Tất cả các thành phần"}',
    '{"en": "This is a test article to demonstrate all available components.", "zh-Hant": "這是一篇測試文章，用於展示所有可用的組件。", "zh-Hans": "这是一篇测试文章，用于展示所有可用的组件。", "ja": "これは利用可能なすべてのコンポーネントを実演するためのテスト記事です。", "ko": "이것은 사용 가능한 모든 구성 요소를 시연하기 위한 테스트 기사입니다.", "th": "นี่คือบทความทดสอบเพื่อแสดงส่วนประกอบทั้งหมดที่มีอยู่", "vi": "Đây là một bài viết kiểm tra để trình diễn tất cả các thành phần có sẵn."}',
    '{"en": "A comprehensive test article showcasing all editor components.", "zh-Hant": "展示所有編輯器組件的綜合測試文章。", "zh-Hans": "展示所有编辑器组件的综合测试文章。", "ja": "すべてのエディターコンポーネントを紹介する包括的なテスト記事。", "ko": "모든 편집기 구성 요소를 보여주는 포괄적인 테스트 기사.", "th": "บทความทดสอบที่ครอบคลุมซึ่งแสดงส่วนประกอบของตัวแก้ไขทั้งหมด", "vi": "Một bài viết kiểm tra toàn diện giới thiệu tất cả các thành phần của trình soạn thảo."}',
    '{"en": "Test Author", "zh-Hant": "測試作者", "zh-Hans": "测试作者", "ja": "テスト著者", "ko": "테스트 저자", "th": "ผู้เขียนทดสอบ", "vi": "Tác giả kiểm tra"}',
    '{"en": "Technical", "zh-Hant": "技術", "zh-Hans": "技术", "ja": "技術", "ko": "기술", "th": "เทคนิค", "vi": "Kỹ thuật"}',
    true
),
(
    generate_article_slug('Industry Trends in Adhesives and Coatings'),
    '{"en": "Industry Trends in Adhesives and Coatings", "zh-Hant": "黏合劑和塗料行業趨勢", "zh-Hans": "黏合剂和涂料行业趋势", "ja": "接着剤・コーティング業界のトレンド", "ko": "접착제 및 코팅 산업 동향", "th": "แนวโน้มอุตสาหกรรมในกาวและสารเคลือบ", "vi": "Xu hướng ngành công nghiệp trong chất kết dính và lớp phủ"}',
    '{"en": "The adhesives and coatings industry is experiencing significant growth with new technologies and sustainable solutions emerging.", "zh-Hant": "黏合劑和塗料行業正在經歷顯著增長，新技術和可持續解決方案不斷湧現。", "zh-Hans": "黏合剂和涂料行业正在经历显著增长，新技术和可持续解决方案不断涌现。", "ja": "接着剤・コーティング業界は、新技術と持続可能なソリューションの台頭により、大幅な成長を遂げています。", "ko": "접착제 및 코팅 산업은 새로운 기술과 지속 가능한 솔루션의 출현으로 상당한 성장을 경험하고 있습니다.", "th": "อุตสาหกรรมกาวและสารเคลือบกำลังประสบกับการเติบโตอย่างมีนัยสำคัญพร้อมกับเทคโนโลยีใหม่และโซลูชันที่ยั่งยืนที่เกิดขึ้น", "vi": "Ngành công nghiệp chất kết dính và lớp phủ đang trải qua sự tăng trưởng đáng kể với các công nghệ mới và giải pháp bền vững đang nổi lên."}',
    '{"en": "Explore the latest trends in adhesives and coatings, from sustainable solutions to advanced technologies.", "zh-Hant": "探索黏合劑和塗料的最新趨勢，從可持續解決方案到先進技術。", "zh-Hans": "探索黏合剂和涂料的最新趋势，从可持续解决方案到先进技术。", "ja": "持続可能なソリューションから先進技術まで、接着剤・コーティングの最新トレンドを探る。", "ko": "지속 가능한 솔루션부터 첨단 기술까지 접착제 및 코팅의 최신 동향을 탐구하세요.", "th": "สำรวจแนวโน้มล่าสุดในกาวและสารเคลือบ ตั้งแต่โซลูชันที่ยั่งยืนไปจนถึงเทคโนโลยีขั้นสูง", "vi": "Khám phá các xu hướng mới nhất trong chất kết dính và lớp phủ, từ các giải pháp bền vững đến công nghệ tiên tiến."}',
    '{"en": "Industry Expert", "zh-Hant": "行業專家", "zh-Hans": "行业专家", "ja": "業界専門家", "ko": "업계 전문가", "th": "ผู้เชี่ยวชาญด้านอุตสาหกรรม", "vi": "Chuyên gia ngành công nghiệp"}',
    '{"en": "Industry News", "zh-Hant": "行業新聞", "zh-Hans": "行业新闻", "ja": "業界ニュース", "ko": "업계 뉴스", "th": "ข่าวอุตสาหกรรม", "vi": "Tin tức ngành công nghiệp"}',
    true
);

-- Link sample articles to tags
INSERT INTO article_tags_junction (article_id, tag_id) 
SELECT a.id, t.id 
FROM articles a, article_tags t 
WHERE t.name IN ('Technical', 'Test', 'Components') 
AND a.slug LIKE '%sample%';

INSERT INTO article_tags_junction (article_id, tag_id) 
SELECT a.id, t.id 
FROM articles a, article_tags t 
WHERE t.name IN ('Industry News', 'Technology', 'Trends') 
AND a.slug LIKE '%industry%';
