-- =====================================================
-- AFTEK WEBSITE - FINAL CORRECTED DATABASE SETUP SCRIPT
-- =====================================================
-- This script handles correct data types for all columns
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. SAFELY DROP EXISTING POLICIES
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
-- 2. CREATE PRODUCTS TABLE (HANDLE UUID OR INTEGER)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 3. CREATE OTHER TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS website_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    language TEXT NOT NULL,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, language)
);

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    "displayOrder" INTEGER DEFAULT 1,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- =====================================================
-- 4. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

DO $$ 
DECLARE
    related_products_type TEXT;
    products_id_type TEXT;
BEGIN
    -- Get the existing data types
    SELECT data_type INTO related_products_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'related_products';
    
    SELECT data_type INTO products_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'id';
    
    -- Add missing columns to products table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'names') THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'descriptions') THEN
        ALTER TABLE products ADD COLUMN descriptions JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add related_products with correct type based on products.id type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'related_products') THEN
        IF products_id_type = 'uuid' THEN
            ALTER TABLE products ADD COLUMN related_products TEXT[] DEFAULT ARRAY[]::text[];
        ELSE
            ALTER TABLE products ADD COLUMN related_products INTEGER[] DEFAULT ARRAY[]::integer[];
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'features') THEN
        ALTER TABLE products ADD COLUMN features TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'specifications') THEN
        ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isActive') THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInFeatured') THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'showInProducts') THEN
        ALTER TABLE products ADD COLUMN "showInProducts" BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'displayOrder') THEN
        ALTER TABLE products ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail') THEN
        ALTER TABLE products ADD COLUMN thumbnail TEXT;
    END IF;
END $$;

-- =====================================================
-- 5. FIX FEATURED_PRODUCTS TABLE FOREIGN KEY TYPE
-- =====================================================

DO $$
DECLARE
    products_id_type TEXT;
    featured_product_id_type TEXT;
BEGIN
    -- Get the data types
    SELECT data_type INTO products_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'id';
    
    SELECT data_type INTO featured_product_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'featured_products' AND column_name = 'product_id';
    
    -- If types don't match, recreate the featured_products table
    IF featured_product_id_type IS NOT NULL AND products_id_type != featured_product_id_type THEN
        DROP TABLE IF EXISTS featured_products CASCADE;
        
        IF products_id_type = 'uuid' THEN
            CREATE TABLE featured_products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                "displayOrder" INTEGER DEFAULT 1,
                "isActive" BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id)
            );
        ELSE
            CREATE TABLE featured_products (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                "displayOrder" INTEGER DEFAULT 1,
                "isActive" BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id)
            );
        END IF;
    END IF;
END $$;

-- =====================================================
-- 6. UPDATE NULL VALUES WITH PROPER DEFAULTS (TYPE-SAFE)
-- =====================================================

DO $$
DECLARE
    related_products_type TEXT;
BEGIN
    -- Get the related_products column type
    SELECT data_type INTO related_products_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'related_products';
    
    -- Update NULL values with correct defaults
    UPDATE products SET "isActive" = true WHERE "isActive" IS NULL;
    UPDATE products SET "showInFeatured" = false WHERE "showInFeatured" IS NULL;
    UPDATE products SET "showInProducts" = true WHERE "showInProducts" IS NULL;
    UPDATE products SET "displayOrder" = 99 WHERE "displayOrder" IS NULL;
    UPDATE products SET names = '{}'::jsonb WHERE names IS NULL;
    UPDATE products SET descriptions = '{}'::jsonb WHERE descriptions IS NULL;
    UPDATE products SET specifications = '{}'::jsonb WHERE specifications IS NULL;
    UPDATE products SET tags = ARRAY[]::text[] WHERE tags IS NULL;
    UPDATE products SET sizes = ARRAY[]::text[] WHERE sizes IS NULL;
    UPDATE products SET features = ARRAY[]::text[] WHERE features IS NULL;
    UPDATE products SET images = ARRAY[]::text[] WHERE images IS NULL;
    UPDATE products SET rating = 0 WHERE rating IS NULL;
    UPDATE products SET currency = 'USD' WHERE currency IS NULL;
    
    -- Handle related_products based on its actual type
    IF related_products_type = 'ARRAY' THEN
        -- Check if it's integer[] or text[]
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' 
                  AND column_name = 'related_products' 
                  AND udt_name = '_int4') THEN
            -- It's integer[]
            UPDATE products SET related_products = ARRAY[]::integer[] WHERE related_products IS NULL;
        ELSE
            -- It's text[] or other text-based array
            UPDATE products SET related_products = ARRAY[]::text[] WHERE related_products IS NULL;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_isActive ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_showInFeatured ON products("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_displayOrder ON products("displayOrder");
CREATE INDEX IF NOT EXISTS idx_products_showInProducts ON products("showInProducts");
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_website_texts_key ON website_texts(key);
CREATE INDEX IF NOT EXISTS idx_website_texts_language ON website_texts(language);
CREATE INDEX IF NOT EXISTS idx_website_texts_key_language ON website_texts(key, language);

CREATE INDEX IF NOT EXISTS idx_articles_isPublished ON articles("isPublished");
CREATE INDEX IF NOT EXISTS idx_articles_isActive ON articles("isActive");
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);

CREATE INDEX IF NOT EXISTS idx_media_isActive ON media("isActive");
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_products_isActive ON featured_products("isActive");
CREATE INDEX IF NOT EXISTS idx_featured_products_displayOrder ON featured_products("displayOrder");

-- =====================================================
-- 8. INSERT SAMPLE WEBSITE TEXTS
-- =====================================================

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
-- 9. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE SECURITY POLICIES
-- =====================================================

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
-- 11. CREATE UPDATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_website_texts_updated_at ON website_texts;
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
DROP TRIGGER IF EXISTS update_featured_products_updated_at ON featured_products;

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
-- 12. VERIFICATION QUERIES
-- =====================================================

SELECT 'Database setup completed successfully!' as status;

-- Show table structure with data types
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('products', 'featured_products', 'website_texts', 'articles', 'media')
AND column_name IN ('id', 'product_id', 'related_products', 'tags', 'features')
ORDER BY table_name, column_name;

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
-- SCRIPT COMPLETE - ALL TYPE ISSUES FIXED!
-- ===================================================== 