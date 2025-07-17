-- =====================================================
-- COMPLETE AFTEK WEBSITE DATABASE SETUP SCRIPT
-- =====================================================
-- This script creates all necessary tables, columns, indexes,
-- policies, and sample data for the Aftek website
-- =====================================================

-- =====================================================
-- 1. DROP EXISTING POLICIES IF THEY EXIST (SAFE)
-- =====================================================

DO $$ 
BEGIN
    -- Drop policies only if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        DROP POLICY IF EXISTS "Public read access for products" ON products;
        DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'website_texts') THEN
        DROP POLICY IF EXISTS "Public read access for website_texts" ON website_texts;
        DROP POLICY IF EXISTS "Authenticated users can manage website_texts" ON website_texts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
        DROP POLICY IF EXISTS "Public read access for articles" ON articles;
        DROP POLICY IF EXISTS "Authenticated users can manage articles" ON articles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media') THEN
        DROP POLICY IF EXISTS "Public read access for media" ON media;
        DROP POLICY IF EXISTS "Authenticated users can manage media" ON media;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'featured_products') THEN
        DROP POLICY IF EXISTS "Public read access for featured_products" ON featured_products;
        DROP POLICY IF EXISTS "Authenticated users can manage featured_products" ON featured_products;
    END IF;
END $$;

-- =====================================================
-- 2. CREATE PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    names JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    descriptions JSONB DEFAULT '{}'::jsonb,
    category TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    images TEXT[] DEFAULT ARRAY[]::text[],
    thumbnail TEXT,
    slug TEXT UNIQUE,
    tags TEXT[] DEFAULT ARRAY[]::text[],
    sizes TEXT[] DEFAULT ARRAY[]::text[],
    rating DECIMAL(3,2) DEFAULT 0,
    features TEXT[] DEFAULT ARRAY[]::text[],
    specifications JSONB DEFAULT '{}'::jsonb,
    related_products TEXT[] DEFAULT ARRAY[]::text[],
    "isActive" BOOLEAN DEFAULT true,
    "showInFeatured" BOOLEAN DEFAULT false,
    "showInProducts" BOOLEAN DEFAULT true,
    "displayOrder" INTEGER DEFAULT 99,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. CREATE WEBSITE_TEXTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS website_texts (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    language TEXT NOT NULL,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, language)
);

-- =====================================================
-- 4. CREATE ARTICLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    titles JSONB DEFAULT '{}'::jsonb,
    content TEXT,
    contents JSONB DEFAULT '{}'::jsonb,
    excerpt TEXT,
    excerpts JSONB DEFAULT '{}'::jsonb,
    slug TEXT UNIQUE,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::text[],
    featured_image TEXT,
    images TEXT[] DEFAULT ARRAY[]::text[],
    author TEXT,
    "isPublished" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    "publishDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. CREATE MEDIA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    titles JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    descriptions JSONB DEFAULT '{}'::jsonb,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::text[],
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. CREATE FEATURED_PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "displayOrder" INTEGER DEFAULT 1,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- =====================================================
-- 7. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add names column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'names') THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add descriptions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'descriptions') THEN
        ALTER TABLE products ADD COLUMN descriptions JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add related_products column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'related_products') THEN
        ALTER TABLE products ADD COLUMN related_products TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add features column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'features') THEN
        ALTER TABLE products ADD COLUMN features TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add specifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'specifications') THEN
        ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add images column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isActive') THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    -- Add showInFeatured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInFeatured') THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    END IF;
    
    -- Add showInProducts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInProducts') THEN
        ALTER TABLE products ADD COLUMN "showInProducts" BOOLEAN DEFAULT true;
    END IF;
    
    -- Add displayOrder column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'displayOrder') THEN
        ALTER TABLE products ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    
    -- Add currency column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    
    -- Add thumbnail column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail') THEN
        ALTER TABLE products ADD COLUMN thumbnail TEXT;
    END IF;
END $$;

-- =====================================================
-- 8. UPDATE NULL VALUES WITH PROPER DEFAULTS
-- =====================================================

-- Update NULL boolean values
UPDATE products 
SET "isActive" = true 
WHERE "isActive" IS NULL;

UPDATE products 
SET "showInFeatured" = false 
WHERE "showInFeatured" IS NULL;

UPDATE products 
SET "showInProducts" = true 
WHERE "showInProducts" IS NULL;

UPDATE products 
SET "displayOrder" = 99 
WHERE "displayOrder" IS NULL;

-- Update NULL JSONB values
UPDATE products 
SET names = '{}'::jsonb 
WHERE names IS NULL;

UPDATE products 
SET descriptions = '{}'::jsonb 
WHERE descriptions IS NULL;

UPDATE products 
SET specifications = '{}'::jsonb 
WHERE specifications IS NULL;

-- Update NULL array values with proper PostgreSQL syntax
UPDATE products 
SET related_products = ARRAY[]::text[] 
WHERE related_products IS NULL;

UPDATE products 
SET tags = ARRAY[]::text[] 
WHERE tags IS NULL;

UPDATE products 
SET sizes = ARRAY[]::text[] 
WHERE sizes IS NULL;

UPDATE products 
SET features = ARRAY[]::text[] 
WHERE features IS NULL;

UPDATE products 
SET images = ARRAY[]::text[] 
WHERE images IS NULL;

-- Update NULL numeric values
UPDATE products 
SET rating = 0 
WHERE rating IS NULL;

-- Update NULL text values
UPDATE products 
SET currency = 'USD' 
WHERE currency IS NULL;

-- =====================================================
-- 9. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_isActive ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_showInFeatured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_displayOrder ON products("displayOrder");
CREATE INDEX IF NOT EXISTS idx_products_showInProducts ON products("showInProducts");
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Website texts table indexes
CREATE INDEX IF NOT EXISTS idx_website_texts_key ON website_texts(key);
CREATE INDEX IF NOT EXISTS idx_website_texts_language ON website_texts(language);
CREATE INDEX IF NOT EXISTS idx_website_texts_key_language ON website_texts(key, language);

-- Articles table indexes
CREATE INDEX IF NOT EXISTS idx_articles_isPublished ON articles("isPublished");
CREATE INDEX IF NOT EXISTS idx_articles_isActive ON articles("isActive");
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_isActive ON media("isActive");
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Featured products table indexes
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_products_isActive ON featured_products("isActive");
CREATE INDEX IF NOT EXISTS idx_featured_products_displayOrder ON featured_products("displayOrder");

-- =====================================================
-- 10. INSERT SAMPLE WEBSITE TEXTS
-- =====================================================

-- Insert basic website texts for English
INSERT INTO website_texts (key, value, language, section) VALUES
('nav.home', 'Home', 'en', 'navigation'),
('nav.about', 'About', 'en', 'navigation'),
('nav.products', 'Products', 'en', 'navigation'),
('nav.projects', 'Projects', 'en', 'navigation'),
('nav.articles', 'Articles', 'en', 'navigation'),
('nav.contact', 'Contact', 'en', 'navigation'),
('nav.guide', 'Guide', 'en', 'navigation'),
('products.title', 'Our Products', 'en', 'products'),
('products.subtitle', 'Discover our comprehensive range of construction and building materials', 'en', 'products'),
('home.hero.title', 'Building Excellence with Quality Materials', 'en', 'home'),
('home.hero.subtitle', 'Your trusted partner for construction and building solutions', 'en', 'home'),
('about.title', 'About Aftek', 'en', 'about'),
('contact.title', 'Contact Us', 'en', 'contact'),
('products.relatedProducts', 'Related Products', 'en', 'products'),
('products.specifications', 'Specifications', 'en', 'products'),
('products.features', 'Features', 'en', 'products'),
('products.viewPdf', 'View Product PDF', 'en', 'products')
ON CONFLICT (key, language) DO NOTHING;

-- Insert basic website texts for Traditional Chinese
INSERT INTO website_texts (key, value, language, section) VALUES
('nav.home', '首頁', 'zh-Hant', 'navigation'),
('nav.about', '關於我們', 'zh-Hant', 'navigation'),
('nav.products', '產品', 'zh-Hant', 'navigation'),
('nav.projects', '專案', 'zh-Hant', 'navigation'),
('nav.articles', '文章', 'zh-Hant', 'navigation'),
('nav.contact', '聯絡', 'zh-Hant', 'navigation'),
('nav.guide', '指南', 'zh-Hant', 'navigation'),
('products.title', '我們的產品', 'zh-Hant', 'products'),
('products.subtitle', '探索我們全面的建築和建材系列', 'zh-Hant', 'products'),
('home.hero.title', '以優質材料打造卓越建築', 'zh-Hant', 'home'),
('home.hero.subtitle', '您值得信賴的建築解決方案合作夥伴', 'zh-Hant', 'home'),
('about.title', '關於 Aftek', 'zh-Hant', 'about'),
('contact.title', '聯絡我們', 'zh-Hant', 'contact'),
('products.relatedProducts', '相關產品', 'zh-Hant', 'products'),
('products.specifications', '規格', 'zh-Hant', 'products'),
('products.features', '特色', 'zh-Hant', 'products'),
('products.viewPdf', '查看產品PDF', 'zh-Hant', 'products')
ON CONFLICT (key, language) DO NOTHING;

-- Insert basic website texts for Thai
INSERT INTO website_texts (key, value, language, section) VALUES
('nav.home', 'หน้าแรก', 'th', 'navigation'),
('nav.about', 'เกี่ยวกับเรา', 'th', 'navigation'),
('nav.products', 'ผลิตภัณฑ์', 'th', 'navigation'),
('nav.projects', 'โครงการ', 'th', 'navigation'),
('nav.articles', 'บทความ', 'th', 'navigation'),
('nav.contact', 'ติดต่อ', 'th', 'navigation'),
('nav.guide', 'คู่มือ', 'th', 'navigation'),
('products.title', 'ผลิตภัณฑ์ของเรา', 'th', 'products'),
('products.subtitle', 'ค้นพบผลิตภัณฑ์ก่อสร้างและวัสดุก่อสร้างครบครัน', 'th', 'products'),
('home.hero.title', 'สร้างความเป็นเลิศด้วยวัสดุคุณภาพ', 'th', 'home'),
('home.hero.subtitle', 'พันธมิตรที่เชื่อถือได้สำหรับโซลูชันการก่อสร้าง', 'th', 'home'),
('about.title', 'เกี่ยวกับ Aftek', 'th', 'about'),
('contact.title', 'ติดต่อเรา', 'th', 'contact'),
('products.relatedProducts', 'ผลิตภัณฑ์ที่เกี่ยวข้อง', 'th', 'products'),
('products.specifications', 'ข้อมูลจำเพาะ', 'th', 'products'),
('products.features', 'คุณสมบัติ', 'th', 'products'),
('products.viewPdf', 'ดู PDF ผลิตภัณฑ์', 'th', 'products')
ON CONFLICT (key, language) DO NOTHING;

-- =====================================================
-- 11. INSERT SAMPLE PRODUCTS
-- =====================================================

-- Insert sample products with multilingual content
INSERT INTO products (
    name, 
    names,
    description, 
    descriptions,
    category, 
    price, 
    currency,
    tags,
    features,
    specifications,
    slug,
    "isActive",
    "showInProducts",
    "showInFeatured"
) VALUES 
(
    'FlexPro PU Sealant',
    '{"en": "FlexPro PU Sealant", "zh-Hant": "FlexPro PU 密封膠", "th": "ซีลานท์ FlexPro PU"}',
    'High-performance polyurethane sealant for construction applications',
    '{"en": "High-performance polyurethane sealant for construction applications", "zh-Hant": "高性能聚氨酯密封膠，適用於建築應用", "th": "ซีลานท์โพลียูรีเทนประสิทธิภาพสูงสำหรับงานก่อสร้าง"}',
    'Sealants',
    299.99,
    'USD',
    ARRAY['polyurethane', 'construction', 'waterproof'],
    ARRAY['Weather resistant', 'Flexible', 'Easy application'],
    '{"viscosity": "Medium", "temperature_range": "-40°C to +80°C", "curing_time": "24 hours"}',
    'flexpro-pu-sealant',
    true,
    true,
    true
),
(
    'AquaShield Membrane',
    '{"en": "AquaShield Membrane", "zh-Hant": "AquaShield 防水膜", "th": "เมมเบรน AquaShield"}',
    'Premium waterproofing membrane for roofs and foundations',
    '{"en": "Premium waterproofing membrane for roofs and foundations", "zh-Hant": "優質屋頂和地基防水膜", "th": "เมมเบรนกันน้ำพรีเมียมสำหรับหลังคาและฐานราก"}',
    'Waterproofing',
    89.99,
    'USD',
    ARRAY['waterproofing', 'membrane', 'roofing'],
    ARRAY['UV resistant', 'Durable', 'Self-adhesive'],
    '{"thickness": "1.5mm", "width": "1m", "length": "20m"}',
    'aquashield-membrane',
    true,
    true,
    false
),
(
    'ProBond Adhesive',
    '{"en": "ProBond Adhesive", "zh-Hant": "ProBond 粘合劑", "th": "กาวยึด ProBond"}',
    'Industrial strength adhesive for heavy-duty applications',
    '{"en": "Industrial strength adhesive for heavy-duty applications", "zh-Hant": "工業強度粘合劑，適用於重型應用", "th": "กาวยึดความแรงสูงสำหรับงานหนัก"}',
    'Adhesives',
    45.50,
    'USD',
    ARRAY['adhesive', 'industrial', 'strong'],
    ARRAY['Fast curing', 'High strength', 'Multi-surface'],
    '{"bond_strength": "25 MPa", "working_time": "30 minutes", "full_cure": "24 hours"}',
    'probond-adhesive',
    true,
    true,
    false
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 12. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Public read access for website_texts" ON website_texts
    FOR SELECT USING (true);

CREATE POLICY "Public read access for articles" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Public read access for media" ON media
    FOR SELECT USING (true);

CREATE POLICY "Public read access for featured_products" ON featured_products
    FOR SELECT USING (true);

-- Create policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage website_texts" ON website_texts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage media" ON media
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage featured_products" ON featured_products
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 13. CREATE UPDATE TRIGGERS
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_texts_updated_at BEFORE UPDATE ON website_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_products_updated_at BEFORE UPDATE ON featured_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. VERIFY THE DATABASE STRUCTURE
-- =====================================================

-- Show all tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Count records in each table
SELECT 
    'products' as table_name,
    COUNT(*) as record_count
FROM products
UNION ALL
SELECT 
    'website_texts' as table_name,
    COUNT(*) as record_count
FROM website_texts
UNION ALL
SELECT 
    'articles' as table_name,
    COUNT(*) as record_count
FROM articles
UNION ALL
SELECT 
    'media' as table_name,
    COUNT(*) as record_count
FROM media
UNION ALL
SELECT 
    'featured_products' as table_name,
    COUNT(*) as record_count
FROM featured_products;

-- =====================================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- =====================================================

-- This script has:
-- 1. Created all necessary tables with proper structure
-- 2. Added all missing columns with correct data types
-- 3. Fixed array syntax issues using ARRAY[]::text[]
-- 4. Set proper default values for all columns
-- 5. Created indexes for performance optimization
-- 6. Set up Row Level Security policies
-- 7. Added sample data for testing
-- 8. Created update triggers for timestamp management
-- 9. Verified the database structure

COMMENT ON TABLE products IS 'Main products table with multilingual support';
COMMENT ON TABLE website_texts IS 'Stores all website text translations';
COMMENT ON TABLE articles IS 'Blog articles and news with multilingual content';
COMMENT ON TABLE media IS 'Media files and documents';
COMMENT ON TABLE featured_products IS 'Featured products configuration'; 