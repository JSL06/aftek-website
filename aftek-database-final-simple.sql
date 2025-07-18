-- Aftek Website Database Setup Script (Simple & Correct Version)
-- Based on codebase analysis of actual table structures and naming conventions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Drop existing tables safely
DROP TABLE IF EXISTS featured_products CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS website_text CASCADE;

-- Create Articles table (based on src/pages/admin/Articles.tsx interface)
-- Uses snake_case for is_published and published_at as seen in admin interface
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Featured Products table (based on admin interface usage)
-- Uses camelCase for isActive as seen throughout the codebase
CREATE TABLE featured_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL, -- Can handle both UUID and integer product IDs
    display_order INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Website Text table for multilingual content
CREATE TABLE website_text (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'zh-Hant',
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(key, language_code)
);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_products_updated_at 
    BEFORE UPDATE ON featured_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_text_updated_at 
    BEFORE UPDATE ON website_text 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_text ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (allow all operations for now - can be tightened later)
-- Articles policies
CREATE POLICY "articles_read_policy" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_insert_policy" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "articles_update_policy" ON articles FOR UPDATE USING (true);
CREATE POLICY "articles_delete_policy" ON articles FOR DELETE USING (true);

-- Featured Products policies
CREATE POLICY "featured_products_read_policy" ON featured_products FOR SELECT USING (true);
CREATE POLICY "featured_products_insert_policy" ON featured_products FOR INSERT WITH CHECK (true);
CREATE POLICY "featured_products_update_policy" ON featured_products FOR UPDATE USING (true);
CREATE POLICY "featured_products_delete_policy" ON featured_products FOR DELETE USING (true);

-- Website Text policies
CREATE POLICY "website_text_read_policy" ON website_text FOR SELECT USING (true);
CREATE POLICY "website_text_insert_policy" ON website_text FOR INSERT WITH CHECK (true);
CREATE POLICY "website_text_update_policy" ON website_text FOR UPDATE USING (true);
CREATE POLICY "website_text_delete_policy" ON website_text FOR DELETE USING (true);

-- Create performance indexes
-- Articles indexes
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_published_at ON articles(published_at);

-- Featured Products indexes
CREATE INDEX idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX idx_featured_products_isactive ON featured_products(isActive);
CREATE INDEX idx_featured_products_display_order ON featured_products(display_order);

-- Website Text indexes
CREATE INDEX idx_website_text_key ON website_text(key);
CREATE INDEX idx_website_text_language_code ON website_text(language_code);
CREATE INDEX idx_website_text_key_language ON website_text(key, language_code);

-- Insert sample data
INSERT INTO articles (title, content, excerpt, author, category, is_published, published_at) VALUES
('Construction Industry Trends 2024', 
 'The construction industry continues to evolve with new technologies and sustainable practices. From advanced building materials to smart construction techniques, the sector is experiencing rapid transformation. Key trends include the adoption of green building standards, integration of IoT devices for smart buildings, and the use of prefabricated construction methods to improve efficiency and reduce waste.', 
 'Exploring the latest trends shaping the construction industry in 2024', 
 'AFTEK Technical Team', 
 'Industry News', 
 true, 
 NOW()),
('Waterproofing Best Practices', 
 'Proper waterproofing is essential for building longevity and structural integrity. This comprehensive guide covers the selection of appropriate waterproofing membranes, proper surface preparation techniques, application methods, and quality control measures. We discuss both traditional and modern waterproofing solutions, including liquid membranes, sheet membranes, and crystalline systems.', 
 'A comprehensive guide to waterproofing best practices for construction projects', 
 'AFTEK Engineering', 
 'Technical Guides', 
 true, 
 NOW()),
('Sustainable Building Materials', 
 'The shift towards sustainable construction materials is gaining momentum across the Asia-Pacific region. This article explores eco-friendly alternatives to traditional building materials, including recycled content materials, bio-based composites, and low-carbon concrete solutions. We examine the environmental benefits, performance characteristics, and cost considerations of sustainable material choices.', 
 'How sustainable materials are transforming the construction landscape', 
 'AFTEK Research Team', 
 'Sustainability', 
 true, 
 NOW());

-- Insert multilingual website text
INSERT INTO website_text (key, language_code, value) VALUES
-- English content
('nav.home', 'en', 'Home'),
('nav.about', 'en', 'About'),
('nav.products', 'en', 'Products'),
('nav.projects', 'en', 'Projects'),
('nav.articles', 'en', 'Articles'),
('nav.contact', 'en', 'Contact'),
('home.hero.title', 'en', 'Professional Construction Chemicals & Building Materials'),
('home.hero.subtitle', 'en', 'Leading supplier of high-quality construction chemicals across Asia-Pacific'),
('footer.company.name', 'en', 'AFTEK Co., Ltd.'),
('footer.company.description', 'en', 'Leading supplier of construction chemicals and building materials'),

-- Traditional Chinese content  
('nav.home', 'zh-Hant', '首頁'),
('nav.about', 'zh-Hant', '關於我們'),
('nav.products', 'zh-Hant', '產品'),
('nav.projects', 'zh-Hant', '專案'),
('nav.articles', 'zh-Hant', '文章'),
('nav.contact', 'zh-Hant', '聯絡我們'),
('home.hero.title', 'zh-Hant', '專業建築化學品及建材'),
('home.hero.subtitle', 'zh-Hant', '亞太地區優質建築化學品領先供應商'),
('footer.company.name', 'zh-Hant', 'AFTEK 股份有限公司'),
('footer.company.description', 'zh-Hant', '建築化學品和建材的領先供應商'),

-- Thai content
('nav.home', 'th', 'หน้าแรก'),
('nav.about', 'th', 'เกี่ยวกับเรา'),
('nav.products', 'th', 'ผลิตภัณฑ์'),
('nav.projects', 'th', 'โครงการ'),
('nav.articles', 'th', 'บทความ'),
('nav.contact', 'th', 'ติดต่อ'),
('home.hero.title', 'th', 'สารเคมีก่อสร้างและวัสดุก่อสร้างมืออาชีพ'),
('home.hero.subtitle', 'th', 'ผู้จำหน่ายสารเคมีก่อสร้างคุณภาพสูงชั้นนำในภูมิภาคเอเชีย-แปซิฟิก'),
('footer.company.name', 'th', 'บริษัท AFTEK จำกัด'),
('footer.company.description', 'th', 'ผู้จำหน่ายสารเคมีก่อสร้างและวัสดุก่อสร้างชั้นนำ');

-- Success message
SELECT 'Database setup completed successfully!' as status;

-- Verification queries
SELECT 'articles' as table_name, COUNT(*) as record_count FROM articles
UNION ALL
SELECT 'featured_products', COUNT(*) FROM featured_products  
UNION ALL
SELECT 'website_text', COUNT(*) FROM website_text;

-- Show table structures for verification
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('articles', 'featured_products', 'website_text')
ORDER BY table_name, ordinal_position; 