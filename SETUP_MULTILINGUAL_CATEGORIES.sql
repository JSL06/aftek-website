-- Set up multilingual categories system
-- Run this in Supabase SQL Editor

-- 1. Create category_translations table for multilingual support
CREATE TABLE IF NOT EXISTS category_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language_code ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_composite ON category_translations(category_id, language_code);

-- 3. Enable Row Level Security
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public read access and authenticated write access
-- Allow public read access to category translations
DROP POLICY IF EXISTS "Allow public read access to category translations" ON category_translations;
CREATE POLICY "Allow public read access to category translations" ON category_translations
  FOR SELECT USING (true);

-- Allow authenticated users to manage category translations
DROP POLICY IF EXISTS "Allow authenticated users to manage category translations" ON category_translations;
CREATE POLICY "Allow authenticated users to manage category translations" ON category_translations
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_category_translations_updated_at ON category_translations;
CREATE TRIGGER update_category_translations_updated_at
  BEFORE UPDATE ON category_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_category_translations_updated_at();

-- 6. Clean up existing categories and insert the 6 base categories
DELETE FROM product_categories;

INSERT INTO product_categories (id, name, description, display_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Waterproofing', 'Waterproofing solutions and materials', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Sealant', 'Sealant products and solutions', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Adhesive', 'Adhesive products and solutions', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Redi-Mix G&M', 'Ready-mix grout and mortar products', 4, true),
('550e8400-e29b-41d4-a716-446655440005', 'Flooring', 'Flooring systems and materials', 5, true),
('550e8400-e29b-41d4-a716-446655440006', 'Other Specialties', 'Other specialty construction materials', 6, true);

-- 7. Insert translations for all 6 categories in all languages
-- Waterproofing
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'en', 'Waterproofing', 'Waterproofing solutions and materials'),
('550e8400-e29b-41d4-a716-446655440001', 'zh-Hant', '防水', '防水解決方案和材料'),
('550e8400-e29b-41d4-a716-446655440001', 'zh-Hans', '防水', '防水解决方案和材料'),
('550e8400-e29b-41d4-a716-446655440001', 'ja', '防水', '防水ソリューションと材料'),
('550e8400-e29b-41d4-a716-446655440001', 'ko', '방수', '방수 솔루션 및 재료'),
('550e8400-e29b-41d4-a716-446655440001', 'th', 'กันน้ำ', 'โซลูชันและวัสดุกันน้ำ'),
('550e8400-e29b-41d4-a716-446655440001', 'vi', 'Chống thấm', 'Giải pháp và vật liệu chống thấm');

-- Sealant
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'en', 'Sealant', 'Sealant products and solutions'),
('550e8400-e29b-41d4-a716-446655440002', 'zh-Hant', '密封膠', '密封膠產品和解決方案'),
('550e8400-e29b-41d4-a716-446655440002', 'zh-Hans', '密封胶', '密封胶产品和解决方案'),
('550e8400-e29b-41d4-a716-446655440002', 'ja', 'シーラント', 'シーラント製品とソリューション'),
('550e8400-e29b-41d4-a716-446655440002', 'ko', '실런트', '실런트 제품 및 솔루션'),
('550e8400-e29b-41d4-a716-446655440002', 'th', 'ซีแลนท์', 'ผลิตภัณฑ์และโซลูชันซีแลนท์'),
('550e8400-e29b-41d4-a716-446655440002', 'vi', 'Chất bịt kín', 'Sản phẩm và giải pháp chất bịt kín');

-- Adhesive
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'en', 'Adhesive', 'Adhesive products and solutions'),
('550e8400-e29b-41d4-a716-446655440003', 'zh-Hant', '黏合劑', '黏合劑產品和解決方案'),
('550e8400-e29b-41d4-a716-446655440003', 'zh-Hans', '黏合剂', '黏合剂产品和解决方案'),
('550e8400-e29b-41d4-a716-446655440003', 'ja', '接着剤', '接着剤製品とソリューション'),
('550e8400-e29b-41d4-a716-446655440003', 'ko', '접착제', '접착제 제품 및 솔루션'),
('550e8400-e29b-41d4-a716-446655440003', 'th', 'กาว', 'ผลิตภัณฑ์และโซลูชันกาว'),
('550e8400-e29b-41d4-a716-446655440003', 'vi', 'Chất kết dính', 'Sản phẩm và giải pháp chất kết dính');

-- Redi-Mix G&M
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'en', 'Redi-Mix G&M', 'Ready-mix grout and mortar products'),
('550e8400-e29b-41d4-a716-446655440004', 'zh-Hant', '預拌砂漿', '預拌砂漿和砂漿產品'),
('550e8400-e29b-41d4-a716-446655440004', 'zh-Hans', '预拌砂浆', '预拌砂浆和砂浆产品'),
('550e8400-e29b-41d4-a716-446655440004', 'ja', 'レディミックスG&M', 'レディミックスグラウトとモルタル製品'),
('550e8400-e29b-41d4-a716-446655440004', 'ko', '레디믹스 G&M', '레디믹스 그라우트 및 모르타르 제품'),
('550e8400-e29b-41d4-a716-446655440004', 'th', 'เรดี้มิกซ์ G&M', 'ผลิตภัณฑ์ปูนและปูนก่อสำเร็จรูป'),
('550e8400-e29b-41d4-a716-446655440004', 'vi', 'Vữa trộn sẵn G&M', 'Sản phẩm vữa và vữa trộn sẵn');

-- Flooring
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'en', 'Flooring', 'Flooring systems and materials'),
('550e8400-e29b-41d4-a716-446655440005', 'zh-Hant', '地板', '地板系統和材料'),
('550e8400-e29b-41d4-a716-446655440005', 'zh-Hans', '地板', '地板系统和材料'),
('550e8400-e29b-41d4-a716-446655440005', 'ja', '床材', '床材システムと材料'),
('550e8400-e29b-41d4-a716-446655440005', 'ko', '바닥재', '바닥재 시스템 및 재료'),
('550e8400-e29b-41d4-a716-446655440005', 'th', 'พื้น', 'ระบบและวัสดุพื้น'),
('550e8400-e29b-41d4-a716-446655440005', 'vi', 'Sàn', 'Hệ thống và vật liệu sàn');

-- Other Specialties
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'en', 'Other Specialties', 'Other specialty construction materials'),
('550e8400-e29b-41d4-a716-446655440006', 'zh-Hant', '其他專業', '其他專業建築材料'),
('550e8400-e29b-41d4-a716-446655440006', 'zh-Hans', '其他专业', '其他专业建筑材料'),
('550e8400-e29b-41d4-a716-446655440006', 'ja', 'その他の専門', 'その他の専門建設材料'),
('550e8400-e29b-41d4-a716-446655440006', 'ko', '기타 전문', '기타 전문 건설 재료'),
('550e8400-e29b-41d4-a716-446655440006', 'th', 'ความเชี่ยวชาญอื่นๆ', 'วัสดุก่อสร้างเฉพาะทางอื่นๆ'),
('550e8400-e29b-41d4-a716-446655440006', 'vi', 'Chuyên môn khác', 'Vật liệu xây dựng chuyên môn khác');

-- 8. Verify the setup
SELECT 'Multilingual categories setup complete!' as status;
SELECT 
  pc.display_order,
  pc.name as base_name,
  ct.language_code,
  ct.name as translated_name,
  ct.description as translated_description
FROM product_categories pc
JOIN category_translations ct ON pc.id = ct.category_id
ORDER BY pc.display_order, ct.language_code;

-- 9. Show final counts
SELECT 
  COUNT(*) as total_categories,
  (SELECT COUNT(*) FROM category_translations) as total_translations,
  (SELECT COUNT(DISTINCT language_code) FROM category_translations) as languages_supported
FROM product_categories;
