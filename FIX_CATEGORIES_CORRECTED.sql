-- =====================================================
-- CORRECTED FIX FOR CATEGORIES AND TRANSLATIONS
-- =====================================================
-- This script fixes all category and translation issues
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CLEAN UP CONFLICTING TABLES
-- =====================================================

-- Drop the feature-related tables to avoid conflicts
DROP TABLE IF EXISTS feature_translations CASCADE;
DROP TABLE IF EXISTS master_features CASCADE;
DROP TABLE IF EXISTS feature_categories CASCADE;

-- Keep only the product-related category_translations table
-- (Don't drop category_translations if it references product_categories)

-- =====================================================
-- 2. ENSURE PRODUCT_CATEGORIES TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ENSURE CATEGORY_TRANSLATIONS TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS category_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language_code ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_composite ON category_translations(category_id, language_code);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Product categories policies
DROP POLICY IF EXISTS "Allow public read access to active categories" ON product_categories;
CREATE POLICY "Allow public read access to active categories" ON product_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON product_categories;
CREATE POLICY "Allow authenticated users to manage categories" ON product_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Category translations policies
DROP POLICY IF EXISTS "Allow public read access to category translations" ON category_translations;
CREATE POLICY "Allow public read access to category translations" ON category_translations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage category translations" ON category_translations;
CREATE POLICY "Allow authenticated users to manage category translations" ON category_translations
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_translations_updated_at ON category_translations;
CREATE TRIGGER update_category_translations_updated_at
  BEFORE UPDATE ON category_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. CLEAN UP EXISTING DATA AND INSERT FRESH
-- =====================================================

-- Clear existing data
DELETE FROM category_translations;
DELETE FROM product_categories;

-- Insert the 6 base categories
INSERT INTO product_categories (id, name, description, display_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Waterproofing', 'Waterproofing solutions and materials', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Sealant & Adhesive', 'Sealant and adhesive products and solutions', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Redi-Mix G&M', 'Ready-mix grout and mortar products', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Flooring', 'Flooring systems and materials', 4, true),
('550e8400-e29b-41d4-a716-446655440005', 'Other Specialties', 'Other specialty construction materials', 5, true);

-- =====================================================
-- 9. INSERT TRANSLATIONS FOR ALL CATEGORIES
-- =====================================================

-- Waterproofing translations
INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'en', 'Waterproofing', 'Waterproofing solutions and materials'),
('550e8400-e29b-41d4-a716-446655440001', 'zh-Hant', '防水', '防水解決方案和材料'),
('550e8400-e29b-41d4-a716-446655440001', 'zh-Hans', '防水', '防水解决方案和材料'),
('550e8400-e29b-41d4-a716-446655440001', 'ja', '防水', '防水ソリューションと材料'),
('550e8400-e29b-41d4-a716-446655440001', 'ko', '방수', '방수 솔루션 및 재료'),
('550e8400-e29b-41d4-a716-446655440001', 'th', 'กันน้ำ', 'โซลูชันและวัสดุกันน้ำ'),
('550e8400-e29b-41d4-a716-446655440001', 'vi', 'Chống thấm', 'Giải pháp và vật liệu chống thấm');

-- Sealant & Adhesive translations
INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'en', 'Sealant & Adhesive', 'Sealant and adhesive products and solutions'),
('550e8400-e29b-41d4-a716-446655440002', 'zh-Hant', '密封膠與黏合劑', '密封膠和黏合劑產品和解決方案'),
('550e8400-e29b-41d4-a716-446655440002', 'zh-Hans', '密封胶与黏合剂', '密封胶和黏合剂产品和解决方案'),
('550e8400-e29b-41d4-a716-446655440002', 'ja', 'シーラント・接着剤', 'シーラントと接着剤の製品とソリューション'),
('550e8400-e29b-41d4-a716-446655440002', 'ko', '실런트 및 접착제', '실런트 및 접착제 제품 및 솔루션'),
('550e8400-e29b-41d4-a716-446655440002', 'th', 'ซีแลนท์และกาว', 'ผลิตภัณฑ์และโซลูชันซีแลนท์และกาว'),
('550e8400-e29b-41d4-a716-446655440002', 'vi', 'Chất bịt kín & Chất kết dính', 'Sản phẩm và giải pháp chất bịt kín và chất kết dính');

-- Redi-Mix G&M translations
INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'en', 'Redi-Mix G&M', 'Ready-mix grout and mortar products'),
('550e8400-e29b-41d4-a716-446655440003', 'zh-Hant', '預拌砂漿', '預拌砂漿產品'),
('550e8400-e29b-41d4-a716-446655440003', 'zh-Hans', '预拌砂浆', '预拌砂浆产品'),
('550e8400-e29b-41d4-a716-446655440003', 'ja', 'レディミックス', 'レディミックス製品'),
('550e8400-e29b-41d4-a716-446655440003', 'ko', '레디믹스', '레디믹스 제품'),
('550e8400-e29b-41d4-a716-446655440003', 'th', 'ปูนผสมสำเร็จ', 'ผลิตภัณฑ์ปูนผสมสำเร็จ'),
('550e8400-e29b-41d4-a716-446655440003', 'vi', 'Vữa trộn sẵn', 'Sản phẩm vữa trộn sẵn');

-- Flooring translations
INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'en', 'Flooring', 'Flooring systems and materials'),
('550e8400-e29b-41d4-a716-446655440004', 'zh-Hant', '地板系統', '地板系統和材料'),
('550e8400-e29b-41d4-a716-446655440004', 'zh-Hans', '地板系统', '地板系统和材料'),
('550e8400-e29b-41d4-a716-446655440004', 'ja', '床材', '床材システムと材料'),
('550e8400-e29b-41d4-a716-446655440004', 'ko', '바닥재', '바닥재 시스템 및 재료'),
('550e8400-e29b-41d4-a716-446655440004', 'th', 'ระบบพื้น', 'ระบบพื้นและวัสดุ'),
('550e8400-e29b-41d4-a716-446655440004', 'vi', 'Hệ thống sàn', 'Hệ thống và vật liệu sàn');

-- Other Specialties translations
INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'en', 'Other Specialties', 'Other specialty construction materials'),
('550e8400-e29b-41d4-a716-446655440005', 'zh-Hant', '其他專業', '其他專業建築材料'),
('550e8400-e29b-41d4-a716-446655440005', 'zh-Hans', '其他专业', '其他专业建筑材料'),
('550e8400-e29b-41d4-a716-446655440005', 'ja', 'その他専門', 'その他の専門建築材料'),
('550e8400-e29b-41d4-a716-446655440005', 'ko', '기타 전문', '기타 전문 건축 자재'),
('550e8400-e29b-41d4-a716-446655440005', 'th', 'อื่นๆ', 'วัสดุก่อสร้างเฉพาะทางอื่นๆ'),
('550e8400-e29b-41d4-a716-446655440005', 'vi', 'Chuyên ngành khác', 'Vật liệu xây dựng chuyên ngành khác');

-- =====================================================
-- 10. VERIFY THE SETUP
-- =====================================================

SELECT 'Categories setup complete!' as status;

SELECT 'Product categories:' as info;
SELECT 
  id,
  name,
  description,
  display_order,
  is_active
FROM product_categories 
ORDER BY display_order;

SELECT 'Category translations count:' as info;
SELECT 
  language_code,
  COUNT(*) as translation_count
FROM category_translations 
GROUP BY language_code 
ORDER BY language_code;

SELECT 'Total translations:' as info;
SELECT COUNT(*) as total_translations FROM category_translations;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON product_categories TO authenticated;
GRANT SELECT ON product_categories TO anon;

GRANT ALL ON category_translations TO authenticated;
GRANT SELECT ON category_translations TO anon;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your categories should now work properly in the admin panel
-- and display correctly in multiple languages on the frontend
