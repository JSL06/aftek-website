-- =====================================================
-- ADD MISSING PRODUCT CATEGORIES FOR AFTEK WEBSITE
-- =====================================================
-- This script adds all the missing product categories that your website needs
-- Run this in your Supabase SQL editor to fix the 400 errors

-- 1. First, let's see what categories currently exist
-- SELECT * FROM product_categories;

-- 2. Add the missing product categories that your website is looking for
INSERT INTO product_categories (name, description, display_order) VALUES
  ('Redi-Mix G&M', 'Ready-mix concrete and grout materials for construction', 5),
  ('Flooring', 'Flooring solutions and materials', 6),
  ('Waterproofing', 'Waterproofing membranes and coatings', 7),
  ('Grout', 'Tile and construction grout materials', 8),
  ('Sealants', 'Sealant products for various applications', 9),
  ('Repair', 'Repair compounds and materials', 10),
  ('Adhesives', 'Construction and industrial adhesives', 11),
  ('Primers', 'Surface preparation primers', 12)
ON CONFLICT (name) DO NOTHING;

-- 3. Add English translations for all categories
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'en',
  pc.name,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 4. Add Traditional Chinese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'zh-Hant',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN '預拌混凝土與灌漿材料'
    WHEN 'Flooring' THEN '地板材料'
    WHEN 'Waterproofing' THEN '防水材料'
    WHEN 'Grout' THEN '灌漿材料'
    WHEN 'Sealants' THEN '密封劑'
    WHEN 'Repair' THEN '修補材料'
    WHEN 'Adhesives' THEN '接著劑'
    WHEN 'Primers' THEN '底漆'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 5. Add Japanese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ja',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN 'レディミックスコンクリート・グラウト'
    WHEN 'Flooring' THEN '床材'
    WHEN 'Waterproofing' THEN '防水材'
    WHEN 'Grout' THEN 'グラウト材'
    WHEN 'Sealants' THEN 'シーラント'
    WHEN 'Repair' THEN '補修材'
    WHEN 'Adhesives' THEN '接着剤'
    WHEN 'Primers' THEN 'プライマー'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 6. Add Korean translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'ko',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN '레디믹스 콘크리트 및 그라우트'
    WHEN 'Flooring' THEN '바닥재'
    WHEN 'Waterproofing' THEN '방수재'
    WHEN 'Grout' THEN '그라우트재'
    WHEN 'Sealants' THEN '실런트'
    WHEN 'Repair' THEN '보수재'
    WHEN 'Adhesives' THEN '접착제'
    WHEN 'Primers' THEN '프라이머'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 7. Add Thai translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'th',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN 'คอนกรีตผสมสำเร็จและวัสดุอุดรอยต่อ'
    WHEN 'Flooring' THEN 'วัสดุปูพื้น'
    WHEN 'Waterproofing' THEN 'วัสดุกันน้ำ'
    WHEN 'Grout' THEN 'วัสดุอุดรอยต่อ'
    WHEN 'Sealants' THEN 'ซีลแลนท์'
    WHEN 'Repair' THEN 'วัสดุซ่อมแซม'
    WHEN 'Adhesives' THEN 'กาว'
    WHEN 'Primers' THEN 'ไพรเมอร์'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 8. Add Vietnamese translations
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'vi',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN 'Bê tông trộn sẵn và vật liệu vữa'
    WHEN 'Flooring' THEN 'Vật liệu sàn'
    WHEN 'Waterproofing' THEN 'Vật liệu chống thấm'
    WHEN 'Grout' THEN 'Vật liệu vữa'
    WHEN 'Sealants' THEN 'Chất bịt kín'
    WHEN 'Repair' THEN 'Vật liệu sửa chữa'
    WHEN 'Adhesives' THEN 'Keo dán'
    WHEN 'Primers' THEN 'Sơn lót'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Grout', 'Sealants', 'Repair', 'Adhesives', 'Primers')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- 9. Add more features for these categories
INSERT INTO master_features (feature_key, category, display_order) VALUES
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
  ('flexible_seal', 'Sealants', 1),
  ('weather_resistant', 'Sealants', 2),
  ('easy_application', 'Sealants', 3),
  ('fast_curing', 'Repair', 1),
  ('structural_grade', 'Repair', 2),
  ('shrinkage_resistant', 'Repair', 3),
  ('multi_surface', 'Adhesives', 1),
  ('high_tack', 'Adhesives', 2),
  ('gap_filling', 'Adhesives', 3),
  ('enhanced_bonding', 'Primers', 1),
  ('quick_drying', 'Primers', 2),
  ('low_voc', 'Primers', 3)
ON CONFLICT (feature_key) DO NOTHING;

-- 10. Add English feature translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT 
  mf.id,
  'en',
  CASE mf.feature_key
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
    WHEN 'flexible_seal' THEN 'Flexible Seal'
    WHEN 'weather_resistant' THEN 'Weather Resistant'
    WHEN 'easy_application' THEN 'Easy Application'
    WHEN 'fast_curing' THEN 'Fast Curing'
    WHEN 'structural_grade' THEN 'Structural Grade'
    WHEN 'shrinkage_resistant' THEN 'Shrinkage Resistant'
    WHEN 'multi_surface' THEN 'Multi-Surface'
    WHEN 'high_tack' THEN 'High Tack'
    WHEN 'gap_filling' THEN 'Gap Filling'
    WHEN 'enhanced_bonding' THEN 'Enhanced Bonding'
    WHEN 'quick_drying' THEN 'Quick Drying'
    WHEN 'low_voc' THEN 'Low VOC'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.feature_key IN ('quick_setting', 'high_strength', 'easy_mixing', 'durable_surface', 'easy_maintenance', 'slip_resistant', 'long_lasting', 'flexible_membrane', 'uv_resistant', 'stain_resistant', 'mold_resistant', 'color_consistent', 'flexible_seal', 'weather_resistant', 'easy_application', 'fast_curing', 'structural_grade', 'shrinkage_resistant', 'multi_surface', 'high_tack', 'gap_filling', 'enhanced_bonding', 'quick_drying', 'low_voc')
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- 11. Add Traditional Chinese feature translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT 
  mf.id,
  'zh-Hant',
  CASE mf.feature_key
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
    WHEN 'flexible_seal' THEN '彈性密封'
    WHEN 'weather_resistant' THEN '耐候'
    WHEN 'easy_application' THEN '易於施工'
    WHEN 'fast_curing' THEN '快速固化'
    WHEN 'structural_grade' THEN '結構級'
    WHEN 'shrinkage_resistant' THEN '抗收縮'
    WHEN 'multi_surface' THEN '多表面'
    WHEN 'high_tack' THEN '高黏性'
    WHEN 'gap_filling' THEN '填縫'
    WHEN 'enhanced_bonding' THEN '增強黏合'
    WHEN 'quick_drying' THEN '快速乾燥'
    WHEN 'low_voc' THEN '低揮發性'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.feature_key IN ('quick_setting', 'high_strength', 'easy_mixing', 'durable_surface', 'easy_maintenance', 'slip_resistant', 'long_lasting', 'flexible_membrane', 'uv_resistant', 'stain_resistant', 'mold_resistant', 'color_consistent', 'flexible_seal', 'weather_resistant', 'easy_application', 'fast_curing', 'structural_grade', 'shrinkage_resistant', 'multi_surface', 'high_tack', 'gap_filling', 'enhanced_bonding', 'quick_drying', 'low_voc')
ON CONFLICT (feature_id, language_code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything was added correctly:

-- Check all categories:
-- SELECT * FROM product_categories ORDER BY display_order;

-- Check all category translations:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id ORDER BY pc.display_order, ct.language_code;

-- Check all features:
-- SELECT * FROM master_features ORDER BY category, display_order;

-- Check all feature translations:
-- SELECT ft.*, mf.feature_key FROM feature_translations ft JOIN master_features mf ON ft.feature_id = mf.id ORDER BY mf.category, mf.display_order, ft.language_code;

-- Check specific missing categories:
-- SELECT * FROM product_categories WHERE name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing');

-- Check translations for specific categories:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing') ORDER BY pc.name, ct.language_code;
