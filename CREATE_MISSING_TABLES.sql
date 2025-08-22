-- =====================================================
-- CREATE MISSING TABLES FOR AFTEK WEBSITE
-- =====================================================
-- This script creates all the missing tables that the application needs
-- Run this in your Supabase SQL editor to fix the 404 errors

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

-- 5. Insert base product categories
INSERT INTO product_categories (name, description, display_order) VALUES
  ('Adhesives', 'Industrial and commercial adhesive products', 1),
  ('Coatings', 'Protective and decorative coating solutions', 2),
  ('Sealants', 'Sealing and bonding materials', 3),
  ('Specialty Products', 'Custom and specialized solutions', 4)
ON CONFLICT (name) DO NOTHING;

-- 6. Insert base category translations for English
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'en',
  pc.name,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 7. Insert base category translations for Traditional Chinese
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'zh-Hant',
  CASE pc.name
    WHEN 'Adhesives' THEN '接著劑'
    WHEN 'Coatings' THEN '塗料'
    WHEN 'Sealants' THEN '密封劑'
    WHEN 'Specialty Products' THEN '特殊產品'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 8. Insert base category translations for Japanese
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ja',
  CASE pc.name
    WHEN 'Adhesives' THEN '接着剤'
    WHEN 'Coatings' THEN '塗料'
    WHEN 'Sealants' THEN 'シーラント'
    WHEN 'Specialty Products' THEN '特殊製品'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 9. Insert base category translations for Korean
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ko',
  CASE pc.name
    WHEN 'Adhesives' THEN '접착제'
    WHEN 'Coatings' THEN '도료'
    WHEN 'Sealants' THEN '실런트'
    WHEN 'Specialty Products' THEN '특수 제품'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 10. Insert base category translations for Thai
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'th',
  CASE pc.name
    WHEN 'Adhesives' THEN 'กาว'
    WHEN 'Coatings' THEN 'สี'
    WHEN 'Sealants' THEN 'ซีลแลนท์'
    WHEN 'Specialty Products' THEN 'ผลิตภัณฑ์พิเศษ'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 11. Insert base category translations for Vietnamese
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'vi',
  CASE pc.name
    WHEN 'Adhesives' THEN 'Keo dán'
    WHEN 'Coatings' THEN 'Sơn phủ'
    WHEN 'Sealants' THEN 'Chất bịt kín'
    WHEN 'Specialty Products' THEN 'Sản phẩm đặc biệt'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 12. Insert base features
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
  ('thermal_insulation', 'Specialty Products', 2)
ON CONFLICT (feature_key) DO NOTHING;

-- 13. Insert base feature translations for English
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
    ELSE mf.feature_key
  END
FROM master_features mf
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- 14. Insert base feature translations for Traditional Chinese
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
    ELSE mf.feature_key
  END
FROM master_features mf
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- 15. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_feature_translations_language ON feature_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_master_features_category ON master_features(category);
CREATE INDEX IF NOT EXISTS idx_master_features_active ON master_features(is_active);

-- 16. Enable Row Level Security (RLS)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_translations ENABLE ROW LEVEL SECURITY;

-- 17. Create RLS policies for public read access
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
-- Run these to verify the tables were created correctly:

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('product_categories', 'category_translations', 'master_features', 'feature_translations');

-- Check category data:
-- SELECT * FROM product_categories;

-- Check category translations:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id;

-- Check features:
-- SELECT * FROM master_features;

-- Check feature translations:
-- SELECT ft.*, mf.feature_key FROM feature_translations ft JOIN master_features mf ON ft.feature_id = mf.id;
