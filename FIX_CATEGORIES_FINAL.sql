-- =====================================================
-- FIX CATEGORIES FINAL - AFTEK WEBSITE
-- =====================================================
-- This script will fix the categories to match the exact requirements
-- and add proper translations for all supported languages
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CLEAN UP EXISTING CATEGORIES
-- =====================================================

-- First, remove all existing category translations
DELETE FROM category_translations;

-- Then remove all existing categories
DELETE FROM product_categories;

-- =====================================================
-- STEP 2: INSERT THE CORRECT CATEGORIES
-- =====================================================

-- Insert the exact categories specified by the user
INSERT INTO product_categories (name, description, display_order, is_active) VALUES
  ('Waterproofing', 'Waterproofing membranes and coatings for construction applications', 1, true),
  ('Sealant/Adhesive', 'Combined sealant and adhesive solutions for various materials', 2, true),
  ('Flooring', 'General flooring solutions and materials', 3, true),
  ('Redi-Mix G&M', 'Ready-mix concrete and grout materials', 4, true),
  ('Industrial Flooring', 'Specialized industrial flooring solutions', 5, true);

-- =====================================================
-- STEP 3: ADD TRANSLATIONS FOR ALL SUPPORTED LANGUAGES
-- =====================================================

-- Get the category IDs for reference
DO $$
DECLARE
  waterproofing_id UUID;
  sealant_adhesive_id UUID;
  flooring_id UUID;
  redi_mix_id UUID;
  industrial_flooring_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO waterproofing_id FROM product_categories WHERE name = 'Waterproofing';
  SELECT id INTO sealant_adhesive_id FROM product_categories WHERE name = 'Sealant/Adhesive';
  SELECT id INTO flooring_id FROM product_categories WHERE name = 'Flooring';
  SELECT id INTO redi_mix_id FROM product_categories WHERE name = 'Redi-Mix G&M';
  SELECT id INTO industrial_flooring_id FROM product_categories WHERE name = 'Industrial Flooring';

  -- =====================================================
  -- TRADITIONAL CHINESE (zh-Hant) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'zh-Hant', '防水', '建築應用的防水膜和塗層'),
    (sealant_adhesive_id, 'zh-Hant', '密封膠/黏合劑', '各種材料的密封膠和黏合劑解決方案'),
    (flooring_id, 'zh-Hant', '地板', '一般地板解決方案和材料'),
    (redi_mix_id, 'zh-Hant', '預拌混凝土和灌漿材料', '預拌混凝土和灌漿材料'),
    (industrial_flooring_id, 'zh-Hant', '工業地板', '專業工業地板解決方案');

  -- =====================================================
  -- SIMPLIFIED CHINESE (zh-Hans) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'zh-Hans', '防水', '建筑应用的防水膜和涂层'),
    (sealant_adhesive_id, 'zh-Hans', '密封胶/黏合剂', '各种材料的密封胶和黏合剂解决方案'),
    (flooring_id, 'zh-Hans', '地板', '一般地板解决方案和材料'),
    (redi_mix_id, 'zh-Hans', '预拌混凝土和灌浆材料', '预拌混凝土和灌浆材料'),
    (industrial_flooring_id, 'zh-Hans', '工业地板', '专业工业地板解决方案');

  -- =====================================================
  -- JAPANESE (ja) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'ja', '防水', '建設用途の防水膜とコーティング'),
    (sealant_adhesive_id, 'ja', 'シーラント/接着剤', '様々な材料用のシーラントと接着剤ソリューション'),
    (flooring_id, 'ja', '床材', '一般的な床材ソリューションと材料'),
    (redi_mix_id, 'ja', 'レディミックスコンクリート・グラウト', 'レディミックスコンクリートとグラウト材料'),
    (industrial_flooring_id, 'ja', '工業用床材', '専門的な工業用床材ソリューション');

  -- =====================================================
  -- KOREAN (ko) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'ko', '방수', '건설 응용을 위한 방수 막 및 코팅'),
    (sealant_adhesive_id, 'ko', '실런트/접착제', '다양한 재료용 실런트 및 접착제 솔루션'),
    (flooring_id, 'ko', '바닥재', '일반 바닥재 솔루션 및 재료'),
    (redi_mix_id, 'ko', '레디믹스 콘크리트 및 그라우트', '레디믹스 콘크리트 및 그라우트 재료'),
    (industrial_flooring_id, 'ko', '산업용 바닥재', '전문 산업용 바닥재 솔루션');

  -- =====================================================
  -- THAI (th) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'th', 'กันน้ำ', 'เมมเบรนกันน้ำและสารเคลือบสำหรับการใช้งานก่อสร้าง'),
    (sealant_adhesive_id, 'th', 'ซีแลนท์/กาว', 'โซลูชันซีแลนท์และกาวสำหรับวัสดุต่างๆ'),
    (flooring_id, 'th', 'พื้น', 'โซลูชันและวัสดุพื้นทั่วไป'),
    (redi_mix_id, 'th', 'คอนกรีตผสมสำเร็จและวัสดุอัด', 'คอนกรีตผสมสำเร็จและวัสดุอัด'),
    (industrial_flooring_id, 'th', 'พื้นอุตสาหกรรม', 'โซลูชันพื้นอุตสาหกรรมเฉพาะทาง');

  -- =====================================================
  -- VIETNAMESE (vi) TRANSLATIONS
  -- =====================================================
  
  INSERT INTO category_translations (category_id, language_code, display_name, description) VALUES
    (waterproofing_id, 'vi', 'Chống thấm', 'Màng chống thấm và lớp phủ cho ứng dụng xây dựng'),
    (sealant_adhesive_id, 'vi', 'Chất bịt kín/Keo dính', 'Giải pháp chất bịt kín và keo dính cho các vật liệu khác nhau'),
    (flooring_id, 'vi', 'Sàn', 'Giải pháp và vật liệu sàn chung'),
    (redi_mix_id, 'vi', 'Bê tông trộn sẵn và Vữa', 'Bê tông trộn sẵn và vật liệu vữa'),
    (industrial_flooring_id, 'vi', 'Sàn công nghiệp', 'Giải pháp sàn công nghiệp chuyên dụng');

  RAISE NOTICE 'All categories and translations have been added successfully!';
END $$;

-- =====================================================
-- STEP 4: VERIFY THE RESULTS
-- =====================================================

-- Show all categories
SELECT 
  'CATEGORIES' as info,
  name,
  description,
  display_order
FROM product_categories 
ORDER BY display_order;

-- Show translation count by language
SELECT 
  'TRANSLATION COUNT' as info,
  language_code,
  COUNT(*) as translation_count
FROM category_translations 
GROUP BY language_code
ORDER BY language_code;

-- Show sample translations
SELECT 
  'SAMPLE TRANSLATIONS' as info,
  pc.name as category_name,
  ct.language_code,
  ct.display_name,
  ct.description
FROM product_categories pc
JOIN category_translations ct ON pc.id = ct.category_id
ORDER BY pc.display_order, ct.language_code;

-- =====================================================
-- STEP 5: ENSURE RLS POLICIES ARE CORRECT
-- =====================================================

-- Create open read policies if they don't exist
DO $$
BEGIN
  -- Policy for product_categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Open read access for product_categories') THEN
    CREATE POLICY "Open read access for product_categories" ON product_categories
      FOR SELECT USING (true);
  END IF;
  
  -- Policy for category_translations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'category_translations' AND policyname = 'Open read access for category_translations') THEN
    CREATE POLICY "Open read access for category_translations" ON category_translations
      FOR SELECT USING (true);
  END IF;
  
  RAISE NOTICE 'RLS policies verified/created successfully!';
END $$;

-- Add missing English translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'en',
  pc.name,
  pc.description
FROM product_categories pc
WHERE NOT EXISTS (
  SELECT 1 FROM category_translations ct 
  WHERE ct.category_id = pc.id AND ct.language_code = 'en'
);

-- Fix the category name to match what the frontend expects
UPDATE product_categories 
SET name = 'Sealant & Adhesive' 
WHERE name = 'Sealant/Adhesive';

-- Also update the English translation to match
UPDATE category_translations 
SET display_name = 'Sealant & Adhesive' 
WHERE display_name = 'Sealant/Adhesive' AND language_code = 'en';
