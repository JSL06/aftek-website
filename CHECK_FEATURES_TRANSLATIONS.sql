-- =====================================================
-- CHECK FEATURES AND TRANSLATIONS STATUS
-- =====================================================
-- This script will show what features exist and what translations are missing
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK WHAT FEATURES EXIST
-- =====================================================

-- Show all features
SELECT 
  'All Features' as info,
  COUNT(*) as total_features
FROM master_features;

-- List all features
SELECT 
  id,
  name,
  description,
  display_order,
  is_active
FROM master_features 
ORDER BY display_order, name;

-- =====================================================
-- STEP 2: CHECK FEATURE TRANSLATIONS
-- =====================================================

-- Count translations by language
SELECT 
  'Translation Counts' as info,
  language_code,
  COUNT(*) as translation_count
FROM feature_translations 
GROUP BY language_code
ORDER BY language_code;

-- Show all feature translations
SELECT 
  ft.id,
  mf.name as feature_name,
  ft.language_code,
  ft.display_name,
  ft.description,
  ft.created_at
FROM feature_translations ft
JOIN master_features mf ON ft.feature_id = mf.id
ORDER BY mf.display_order, mf.name, ft.language_code;

-- =====================================================
-- STEP 3: FIND MISSING TRANSLATIONS
-- =====================================================

-- Find features missing specific language translations
SELECT 
  mf.name as feature_name,
  mf.display_order,
  'MISSING zh-Hant' as missing_language
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id AND ft.language_code = 'zh-Hant'
WHERE ft.id IS NULL AND mf.is_active = true
ORDER BY mf.display_order, mf.name;

SELECT 
  mf.name as feature_name,
  mf.display_order,
  'MISSING ja' as missing_language
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id AND ft.language_code = 'ja'
WHERE ft.id IS NULL AND mf.is_active = true
ORDER BY mf.display_order, mf.name;

SELECT 
  mf.name as feature_name,
  mf.display_order,
  'MISSING ko' as missing_language
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id AND ft.language_code = 'ko'
WHERE ft.id IS NULL AND mf.is_active = true
ORDER BY mf.display_order, mf.name;

SELECT 
  mf.name as feature_name,
  mf.display_order,
  'MISSING th' as missing_language
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id AND ft.language_code = 'th'
WHERE ft.id IS NULL AND mf.is_active = true
ORDER BY mf.display_order, mf.name;

SELECT 
  mf.name as feature_name,
  mf.display_order,
  'MISSING vi' as missing_language
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id AND ft.language_code = 'vi'
WHERE ft.id IS NULL AND mf.is_active = true
ORDER BY mf.display_order, mf.name;

-- =====================================================
-- STEP 4: SUMMARY OF MISSING TRANSLATIONS
-- =====================================================

-- Overall summary
SELECT 
  'SUMMARY' as info,
  COUNT(DISTINCT mf.id) as total_features,
  COUNT(DISTINCT ft.feature_id) as features_with_translations,
  (COUNT(DISTINCT mf.id) - COUNT(DISTINCT ft.feature_id)) as features_without_translations
FROM master_features mf
LEFT JOIN feature_translations ft ON mf.id = ft.feature_id
WHERE mf.is_active = true;

-- Count by language
SELECT 
  'LANGUAGE SUMMARY' as info,
  'en' as language,
  COUNT(*) as feature_count
FROM master_features
WHERE is_active = true

UNION ALL

SELECT 
  'LANGUAGE SUMMARY' as info,
  ft.language_code,
  COUNT(DISTINCT ft.feature_id) as feature_count
FROM feature_translations ft
JOIN master_features mf ON ft.feature_id = mf.id
WHERE mf.is_active = true
GROUP BY ft.language_code
ORDER BY language;
