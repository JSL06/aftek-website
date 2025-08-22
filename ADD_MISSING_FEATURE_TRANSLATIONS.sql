-- Add missing feature translations for all supported languages
-- This will ensure features translate properly in all languages

-- First, let's see what we have
SELECT 
  mf.feature_key,
  mf.category,
  ft.language_code,
  ft.display_name
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id
WHERE mf.is_active = true
ORDER BY mf.display_order, ft.language_code;

-- Now add missing translations for each language
-- You'll need to run this for each feature that's missing translations

-- Example for adding a missing translation:
-- INSERT INTO feature_translations (feature_id, language_code, display_name)
-- SELECT mf.id, 'zh-Hans', '抗紫外線' 
-- FROM master_features mf 
-- WHERE mf.feature_key = 'UV Resistance' 
-- AND NOT EXISTS (
--   SELECT 1 FROM feature_translations ft 
--   WHERE ft.feature_id = mf.id AND ft.language_code = 'zh-Hans'
-- );
