-- Complete Database Fix for Aftek Website
-- Run this entire script in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE PRODUCTS TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT DEFAULT '/placeholder.svg',
    price NUMERIC(10,2) DEFAULT 0,
    model TEXT,
    sku TEXT,
    in_stock BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]',
    category TEXT DEFAULT 'Others',
    specifications JSONB DEFAULT '{}',
    isActive BOOLEAN DEFAULT true,
    names JSONB DEFAULT '{}',
    related_products JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    showInFeatured BOOLEAN DEFAULT false,
    displayOrder INTEGER DEFAULT 99,
    dateAdded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB DEFAULT '[]',
    rating NUMERIC(3,2) DEFAULT 0,
    sizes JSONB DEFAULT '[]',
    slug TEXT,
    showInProducts BOOLEAN DEFAULT true
);

-- =====================================================
-- 2. CREATE WEBSITE_TEXTS TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS website_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    language TEXT NOT NULL,
    section TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, language)
);

-- =====================================================
-- 3. CREATE ARTICLES TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]',
    image TEXT,
    isPublished BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slug TEXT,
    meta_description TEXT,
    featured BOOLEAN DEFAULT false,
    displayOrder INTEGER DEFAULT 99
);

-- =====================================================
-- 4. CREATE MEDIA TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    alt_text TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]',
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    displayOrder INTEGER DEFAULT 99
);

-- =====================================================
-- 5. CREATE FEATURED_PRODUCTS TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    displayOrder INTEGER DEFAULT 99,
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to products table
DO $$ 
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    -- Add showInFeatured column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'showInFeatured'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    END IF;
    
    -- Add displayOrder column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'displayOrder'
    ) THEN
        ALTER TABLE products ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
    END IF;
    
    -- Add dateAdded column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'dateAdded'
    ) THEN
        ALTER TABLE products ADD COLUMN "dateAdded" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add names column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'names'
    ) THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}';
    END IF;
    
    -- Add related_products column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'related_products'
    ) THEN
        ALTER TABLE products ADD COLUMN related_products JSONB DEFAULT '[]';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE products ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sizes'
    ) THEN
        ALTER TABLE products ADD COLUMN sizes JSONB DEFAULT '[]';
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
    END IF;
    
    -- Add showInProducts column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'showInProducts'
    ) THEN
        ALTER TABLE products ADD COLUMN "showInProducts" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 7. UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- =====================================================

-- Update products table
UPDATE products 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE products 
SET "dateAdded" = NOW() 
WHERE "dateAdded" IS NULL;

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

UPDATE products 
SET names = '{}' 
WHERE names IS NULL;

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
SET rating = 0 
WHERE rating IS NULL;

UPDATE products 
SET features = ARRAY[]::text[] 
WHERE features IS NULL;

UPDATE products 
SET specifications = '{}' 
WHERE specifications IS NULL;

-- =====================================================
-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_articles_isPublished ON articles(isPublished);
CREATE INDEX IF NOT EXISTS idx_articles_isActive ON articles(isActive);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_isActive ON media(isActive);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Featured products table indexes
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_products_isActive ON featured_products(isActive);
CREATE INDEX IF NOT EXISTS idx_featured_products_displayOrder ON featured_products(displayOrder);

-- =====================================================
-- 9. INSERT SAMPLE WEBSITE TEXTS
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
('contact.title', 'Contact Us', 'en', 'contact')
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
('contact.title', '聯絡我們', 'zh-Hant', 'contact')
ON CONFLICT (key, language) DO NOTHING;

-- =====================================================
-- 10. CREATE ROW LEVEL SECURITY (RLS) POLICIES
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
-- 11. VERIFY THE DATABASE STRUCTURE
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

-- Show website_texts table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'website_texts' 
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