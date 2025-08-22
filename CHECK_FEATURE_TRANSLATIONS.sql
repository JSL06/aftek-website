-- Check what feature translations exist in the database
SELECT 
  ft.language_code,
  COUNT(*) as translation_count
FROM feature_translations ft
GROUP BY ft.language_code
ORDER BY ft.language_code;

-- Check what features exist
SELECT 
  mf.feature_key,
  mf.category,
  COUNT(ft.language_code) as languages_with_translations
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id
WHERE mf.is_active = true
GROUP BY mf.id, mf.feature_key, mf.category
ORDER BY mf.display_order;

-- Check specific language coverage
SELECT 
  mf.feature_key,
  mf.category,
  ft.language_code,
  ft.display_name
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id
WHERE mf.is_active = true
ORDER BY mf.display_order, ft.language_code;
