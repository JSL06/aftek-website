-- =====================================================
-- COMPLETE FIX FOR AFTEK WEBSITE CATEGORIES
-- =====================================================
-- This script creates ALL missing tables AND adds ALL missing categories
-- Run this in your Supabase SQL editor to fix ALL the 400 errors

-- =====================================================
-- STEP 1: CREATE ALL MISSING TABLES
-- =====================================================

-- 1. Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create category_translations table
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

-- 3. Create master_features table
CREATE TABLE IF NOT EXISTS master_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create feature_translations table
CREATE TABLE IF NOT EXISTS feature_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID NOT NULL REFERENCES master_features(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feature_id, language_code)
);

-- =====================================================
-- STEP 2: INSERT ALL PRODUCT CATEGORIES
-- =====================================================

-- Insert ALL categories that your website needs
INSERT INTO product_categories (name, description, display_order) VALUES
  ('Adhesives', 'Industrial and commercial adhesive products', 1),
  ('Coatings', 'Protective and decorative coating solutions', 2),
  ('Sealants', 'Sealing and bonding materials', 3),
  ('Specialty Products', 'Custom and specialized solutions', 4),
  ('Redi-Mix G&M', 'Ready-mix concrete and grout materials for construction', 5),
  ('Flooring', 'Flooring solutions and materials', 6),
  ('Waterproofing', 'Waterproofing membranes and coatings', 7),
  ('Grout', 'Tile and construction grout materials', 8),
  ('Repair', 'Repair compounds and materials', 9),
  ('Primers', 'Surface preparation primers', 10),
  ('Sealant & Adhesive', 'Combined sealant and adhesive solutions', 11)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 3: ADD ALL CATEGORY TRANSLATIONS
-- =====================================================

-- English translations for all categories
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'en',
  pc.name,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Traditional Chinese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'zh-Hant',
  CASE pc.name
    WHEN 'Adhesives' THEN '接著劑'
    WHEN 'Coatings' THEN '塗料'
    WHEN 'Sealants' THEN '密封劑'
    WHEN 'Specialty Products' THEN '特殊產品'
    WHEN 'Redi-Mix G&M' THEN '預拌混凝土與灌漿材料'
    WHEN 'Flooring' THEN '地板材料'
    WHEN 'Waterproofing' THEN '防水材料'
    WHEN 'Grout' THEN '灌漿材料'
    WHEN 'Repair' THEN '修補材料'
    WHEN 'Primers' THEN '底漆'
    WHEN 'Sealant & Adhesive' THEN '密封劑與接著劑'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Japanese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ja',
  CASE pc.name
    WHEN 'Adhesives' THEN '接着剤'
    WHEN 'Coatings' THEN '塗料'
    WHEN 'Sealants' THEN 'シーラント'
    WHEN 'Specialty Products' THEN '特殊製品'
    WHEN 'Redi-Mix G&M' THEN 'レディミックスコンクリート・グラウト'
    WHEN 'Flooring' THEN '床材'
    WHEN 'Waterproofing' THEN '防水材'
    WHEN 'Grout' THEN 'グラウト材'
    WHEN 'Repair' THEN '補修材'
    WHEN 'Primers' THEN 'プライマー'
    WHEN 'Sealant & Adhesive' THEN 'シーラント・接着剤'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Korean translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ko',
  CASE pc.name
    WHEN 'Adhesives' THEN '접착제'
    WHEN 'Coatings' THEN '도료'
    WHEN 'Sealants' THEN '실런트'
    WHEN 'Specialty Products' THEN '특수 제품'
    WHEN 'Redi-Mix G&M' THEN '레디믹스 콘크리트 및 그라우트'
    WHEN 'Flooring' THEN '바닥재'
    WHEN 'Waterproofing' THEN '방수재'
    WHEN 'Grout' THEN '그라우트재'
    WHEN 'Repair' THEN '보수재'
    WHEN 'Primers' THEN '프라이머'
    WHEN 'Sealant & Adhesive' THEN '실런트・접착제'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Thai translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'th',
  CASE pc.name
    WHEN 'Adhesives' THEN 'กาว'
    WHEN 'Coatings' THEN 'สี'
    WHEN 'Sealants' THEN 'ซีลแลนท์'
    WHEN 'Specialty Products' THEN 'ผลิตภัณฑ์พิเศษ'
    WHEN 'Redi-Mix G&M' THEN 'คอนกรีตผสมสำเร็จและวัสดุอุดรอยต่อ'
    WHEN 'Flooring' THEN 'วัสดุปูพื้น'
    WHEN 'Waterproofing' THEN 'วัสดุกันน้ำ'
    WHEN 'Grout' THEN 'วัสดุอุดรอยต่อ'
    WHEN 'Repair' THEN 'วัสดุซ่อมแซม'
    WHEN 'Primers' THEN 'ไพรเมอร์'
    WHEN 'Sealant & Adhesive' THEN 'ซีลแลนท์และกาว'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Vietnamese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'vi',
  CASE pc.name
    WHEN 'Adhesives' THEN 'Keo dán'
    WHEN 'Coatings' THEN 'Sơn phủ'
    WHEN 'Sealants' THEN 'Chất bịt kín'
    WHEN 'Specialty Products' THEN 'Sản phẩm đặc biệt'
    WHEN 'Redi-Mix G&M' THEN 'Bê tông trộn sẵn và vật liệu vữa'
    WHEN 'Flooring' THEN 'Vật liệu sàn'
    WHEN 'Waterproofing' THEN 'Vật liệu chống thấm'
    WHEN 'Grout' THEN 'Vật liệu vữa'
    WHEN 'Repair' THEN 'Vật liệu sửa chữa'
    WHEN 'Primers' THEN 'Sơn lót'
    WHEN 'Sealant & Adhesive' THEN 'Chất bịt kín và keo dán'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- =====================================================
-- STEP 4: ADD FEATURES FOR ALL CATEGORIES
-- =====================================================

-- Insert features for all categories
INSERT INTO master_features (feature_key, category, display_order) VALUES
  ('high_temperature_resistance', 'Adhesives', 1),
  ('chemical_resistance', 'Adhesives', 2),
  ('water_resistance', 'Adhesives', 3),
  ('uv_resistance', 'Coatings', 1),
  ('corrosion_protection', 'Coatings', 2),
  ('weather_resistance', 'Coatings', 3),
  ('flexible_bonding', 'Sealants', 1),
  ('gap_filling', 'Sealants', 2),
  ('sound_dampening', 'Specialty Products', 1),
  ('thermal_insulation', 'Specialty Products', 2),
  ('quick_setting', 'Redi-Mix G&M', 1),
  ('high_strength', 'Redi-Mix G&M', 2),
  ('easy_mixing', 'Redi-Mix G&M', 3),
  ('durable_surface', 'Flooring', 1),
  ('easy_maintenance', 'Flooring', 2),
  ('slip_resistant', 'Flooring', 3),
  ('long_lasting', 'Waterproofing', 1),
  ('flexible_membrane', 'Waterproofing', 2),
  ('uv_resistant', 'Waterproofing', 3),
  ('stain_resistant', 'Grout', 1),
  ('mold_resistant', 'Grout', 2),
  ('color_consistent', 'Grout', 3),
  ('fast_curing', 'Repair', 1),
  ('structural_grade', 'Repair', 2),
  ('shrinkage_resistant', 'Repair', 3),
  ('enhanced_bonding', 'Primers', 1),
  ('quick_drying', 'Primers', 2),
  ('low_voc', 'Primers', 3),
  ('dual_purpose', 'Sealant & Adhesive', 1),
  ('versatile_application', 'Sealant & Adhesive', 2),
  ('professional_grade', 'Sealant & Adhesive', 3)
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- STEP 5: ADD FEATURE TRANSLATIONS
-- =====================================================

-- English feature translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT 
  mf.id,
  'en',
  CASE mf.feature_key
    WHEN 'high_temperature_resistance' THEN 'High Temperature Resistance'
    WHEN 'chemical_resistance' THEN 'Chemical Resistance'
    WHEN 'water_resistance' THEN 'Water Resistance'
    WHEN 'uv_resistance' THEN 'UV Resistance'
    WHEN 'corrosion_protection' THEN 'Corrosion Protection'
    WHEN 'weather_resistance' THEN 'Weather Resistance'
    WHEN 'flexible_bonding' THEN 'Flexible Bonding'
    WHEN 'gap_filling' THEN 'Gap Filling'
    WHEN 'sound_dampening' THEN 'Sound Dampening'
    WHEN 'thermal_insulation' THEN 'Thermal Insulation'
    WHEN 'quick_setting' THEN 'Quick Setting'
    WHEN 'high_strength' THEN 'High Strength'
    WHEN 'easy_mixing' THEN 'Easy Mixing'
    WHEN 'durable_surface' THEN 'Durable Surface'
    WHEN 'easy_maintenance' THEN 'Easy Maintenance'
    WHEN 'slip_resistant' THEN 'Slip Resistant'
    WHEN 'long_lasting' THEN 'Long Lasting'
    WHEN 'flexible_membrane' THEN 'Flexible Membrane'
    WHEN 'uv_resistant' THEN 'UV Resistant'
    WHEN 'stain_resistant' THEN 'Stain Resistant'
    WHEN 'mold_resistant' THEN 'Mold Resistant'
    WHEN 'color_consistent' THEN 'Color Consistent'
    WHEN 'fast_curing' THEN 'Fast Curing'
    WHEN 'structural_grade' THEN 'Structural Grade'
    WHEN 'shrinkage_resistant' THEN 'Shrinkage Resistant'
    WHEN 'enhanced_bonding' THEN 'Enhanced Bonding'
    WHEN 'quick_drying' THEN 'Quick Drying'
    WHEN 'low_voc' THEN 'Low VOC'
    WHEN 'dual_purpose' THEN 'Dual Purpose'
    WHEN 'versatile_application' THEN 'Versatile Application'
    WHEN 'professional_grade' THEN 'Professional Grade'
    ELSE mf.feature_key
  END
FROM master_features mf
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- Traditional Chinese feature translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT 
  mf.id,
  'zh-Hant',
  CASE mf.feature_key
    WHEN 'high_temperature_resistance' THEN '高溫抗性'
    WHEN 'chemical_resistance' THEN '化學抗性'
    WHEN 'water_resistance' THEN '防水性'
    WHEN 'uv_resistance' THEN '抗紫外線'
    WHEN 'corrosion_protection' THEN '防腐保護'
    WHEN 'weather_resistance' THEN '耐候性'
    WHEN 'flexible_bonding' THEN '彈性黏合'
    WHEN 'gap_filling' THEN '填縫'
    WHEN 'sound_dampening' THEN '隔音'
    WHEN 'thermal_insulation' THEN '隔熱'
    WHEN 'quick_setting' THEN '快速凝固'
    WHEN 'high_strength' THEN '高強度'
    WHEN 'easy_mixing' THEN '易於混合'
    WHEN 'durable_surface' THEN '耐用表面'
    WHEN 'easy_maintenance' THEN '易於維護'
    WHEN 'slip_resistant' THEN '防滑'
    WHEN 'long_lasting' THEN '持久耐用'
    WHEN 'flexible_membrane' THEN '彈性膜'
    WHEN 'uv_resistant' THEN '抗紫外線'
    WHEN 'stain_resistant' THEN '防污'
    WHEN 'mold_resistant' THEN '防霉'
    WHEN 'color_consistent' THEN '顏色一致'
    WHEN 'fast_curing' THEN '快速固化'
    WHEN 'structural_grade' THEN '結構級'
    WHEN 'shrinkage_resistant' THEN '抗收縮'
    WHEN 'enhanced_bonding' THEN '增強黏合'
    WHEN 'quick_drying' THEN '快速乾燥'
    WHEN 'low_voc' THEN '低揮發性'
    WHEN 'dual_purpose' THEN '雙重用途'
    WHEN 'versatile_application' THEN '多功能應用'
    WHEN 'professional_grade' THEN '專業級'
    ELSE mf.feature_key
  END
FROM master_features mf
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- =====================================================
-- STEP 6: CREATE INDEXES AND SECURITY
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_feature_translations_language ON feature_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_master_features_category ON master_features(category);
CREATE INDEX IF NOT EXISTS idx_master_features_active ON master_features(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to product_categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to category_translations" ON category_translations
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to master_features" ON master_features
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to feature_translations" ON feature_translations
  FOR SELECT USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything was created correctly:

-- Check all categories:
-- SELECT * FROM product_categories ORDER BY display_order;

-- Check all category translations:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id ORDER BY pc.display_order, ct.language_code;

-- Check all features:
-- SELECT * FROM master_features ORDER BY category, display_order;

-- Check all feature translations:
-- SELECT ft.*, mf.feature_key FROM feature_translations ft JOIN master_features mf ON ft.feature_id = mf.id ORDER BY mf.category, mf.display_order, ft.language_code;

-- Check specific missing categories:
-- SELECT * FROM product_categories WHERE name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive');

-- Check translations for specific categories:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive') ORDER BY pc.name, ct.language_code;
