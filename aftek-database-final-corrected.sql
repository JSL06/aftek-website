-- =====================================================
-- AFTEK WEBSITE - FINAL CORRECTED DATABASE SETUP SCRIPT
-- =====================================================
-- This script uses the correct snake_case naming convention
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
-- 2. CREATE TABLES IF THEY DON'T EXIST
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    content TEXT,
    slug TEXT UNIQUE,
    category TEXT,
    author TEXT,
    is_published BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- =====================================================
-- 3. ADD ALL MISSING COLUMNS SAFELY
-- =====================================================

DO $$ 
DECLARE
    products_id_type TEXT;
BEGIN
    -- Get the existing data type for products.id
    SELECT data_type INTO products_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'id';
    
    -- Add ALL possible missing columns to products table
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE products ADD COLUMN slug TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail') THEN
        ALTER TABLE products ADD COLUMN thumbnail TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
        ALTER TABLE products ADD COLUMN image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model') THEN
        ALTER TABLE products ADD COLUMN model TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
    END IF;
    
    -- Use snake_case naming convention
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_in_featured') THEN
        ALTER TABLE products ADD COLUMN show_in_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_in_products') THEN
        ALTER TABLE products ADD COLUMN show_in_products BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'display_order') THEN
        ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 99;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
    END IF;
    
    -- Add array columns with correct type based on products.id type
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'specifications') THEN
        ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add missing columns to articles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'titles') THEN
        ALTER TABLE articles ADD COLUMN titles JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'contents') THEN
        ALTER TABLE articles ADD COLUMN contents JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt') THEN
        ALTER TABLE articles ADD COLUMN excerpt TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpts') THEN
        ALTER TABLE articles ADD COLUMN excerpts JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Articles table doesn't use tags column based on admin interface
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'featured_image') THEN
        ALTER TABLE articles ADD COLUMN featured_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'images') THEN
        ALTER TABLE articles ADD COLUMN images TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    
    -- Add missing columns to media table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'titles') THEN
        ALTER TABLE media ADD COLUMN titles JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'descriptions') THEN
        ALTER TABLE media ADD COLUMN descriptions JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'tags') THEN
        ALTER TABLE media ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
END $$;

-- =====================================================
-- 4. FIX FEATURED_PRODUCTS TABLE FOREIGN KEY TYPE
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
                display_order INTEGER DEFAULT 1,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id)
            );
        ELSE
            CREATE TABLE featured_products (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                display_order INTEGER DEFAULT 1,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id)
            );
        END IF;
    END IF;
END $$;

-- =====================================================
-- 5. UPDATE NULL VALUES WITH PROPER DEFAULTS (TYPE-SAFE)
-- =====================================================

DO $$
BEGIN
    -- Update NULL values with correct defaults for products (snake_case)
    UPDATE products SET is_active = true WHERE is_active IS NULL;
    UPDATE products SET show_in_featured = false WHERE show_in_featured IS NULL;
    UPDATE products SET show_in_products = true WHERE show_in_products IS NULL;
    UPDATE products SET display_order = 99 WHERE display_order IS NULL;
    UPDATE products SET in_stock = true WHERE in_stock IS NULL;
    UPDATE products SET names = '{}'::jsonb WHERE names IS NULL;
    UPDATE products SET descriptions = '{}'::jsonb WHERE descriptions IS NULL;
    UPDATE products SET specifications = '{}'::jsonb WHERE specifications IS NULL;
    UPDATE products SET rating = 0 WHERE rating IS NULL;
    UPDATE products SET currency = 'USD' WHERE currency IS NULL;
    
    -- Handle array columns safely
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        UPDATE products SET tags = ARRAY[]::text[] WHERE tags IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        UPDATE products SET sizes = ARRAY[]::text[] WHERE sizes IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'features') THEN
        UPDATE products SET features = ARRAY[]::text[] WHERE features IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        UPDATE products SET images = ARRAY[]::text[] WHERE images IS NULL;
    END IF;
    
    -- Handle related_products based on its actual type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'products' 
              AND column_name = 'related_products' 
              AND udt_name = '_int4') THEN
        -- It's integer[]
        UPDATE products SET related_products = ARRAY[]::integer[] WHERE related_products IS NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'related_products') THEN
        -- It's text[] or other text-based array
        UPDATE products SET related_products = ARRAY[]::text[] WHERE related_products IS NULL;
    END IF;
    
    -- Update articles table (uses snake_case for is_published, but isActive doesn't exist)
    UPDATE articles SET is_published = false WHERE is_published IS NULL;
    
    -- Articles table doesn't use tags column
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'images') THEN
        UPDATE articles SET images = ARRAY[]::text[] WHERE images IS NULL;
    END IF;
    
    UPDATE media SET is_active = true WHERE is_active IS NULL;
    UPDATE media SET titles = '{}'::jsonb WHERE titles IS NULL;
    UPDATE media SET descriptions = '{}'::jsonb WHERE descriptions IS NULL;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'tags') THEN
        UPDATE media SET tags = ARRAY[]::text[] WHERE tags IS NULL;
    END IF;
END $$;

-- =====================================================
-- 6. CREATE INDEXES ONLY ON EXISTING COLUMNS
-- =====================================================

DO $$
BEGIN
    -- Products table indexes (only if columns exist) - snake_case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_in_featured') THEN
        CREATE INDEX IF NOT EXISTS idx_products_show_in_featured ON products(show_in_featured);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'display_order') THEN
        CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_in_products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_show_in_products ON products(show_in_products);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    END IF;
    
    -- Website texts table indexes
    CREATE INDEX IF NOT EXISTS idx_website_texts_key ON website_texts(key);
    CREATE INDEX IF NOT EXISTS idx_website_texts_language ON website_texts(language);
    CREATE INDEX IF NOT EXISTS idx_website_texts_key_language ON website_texts(key, language);
    
    -- Articles table indexes (only if columns exist) - snake_case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'is_published') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'is_published') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    END IF;
    
    -- Articles table only has: id, title, content, excerpt, author, category, published_at, is_published, created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    END IF;
    
    -- Media table indexes - snake_case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_media_is_active ON media(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
    END IF;
    
    -- Featured products table indexes - snake_case
    CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_products' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_featured_products_is_active ON featured_products(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_products' AND column_name = 'display_order') THEN
        CREATE INDEX IF NOT EXISTS idx_featured_products_display_order ON featured_products(display_order);
    END IF;
END $$;

-- =====================================================
-- 7. INSERT SAMPLE WEBSITE TEXTS
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
-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE SECURITY POLICIES
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
-- 10. CREATE UPDATE TRIGGERS
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
-- 11. VERIFICATION QUERIES
-- =====================================================

SELECT 'Database setup completed successfully!' as status;

-- Show all tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show table structure with data types (only existing columns)
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('products', 'featured_products', 'website_texts', 'articles', 'media')
ORDER BY table_name, ordinal_position;

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
-- SCRIPT COMPLETE - NAMING CONVENTION CORRECTED!
-- ===================================================== 