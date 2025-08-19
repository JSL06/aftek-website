-- Check and populate product translations
-- This script will ensure all products have translations for all languages

-- 1. First, let's see what we have in the database
SELECT 'Current products:' as info;
SELECT id, name, description FROM products WHERE "isActive" = true LIMIT 5;

SELECT 'Current translations count:' as info;
SELECT COUNT(*) as total_translations FROM product_translations;

SELECT 'Translations by language:' as info;
SELECT language_code, COUNT(*) as count 
FROM product_translations 
GROUP BY language_code 
ORDER BY language_code;

SELECT 'Products without translations:' as info;
SELECT p.id, p.name 
FROM products p 
LEFT JOIN product_translations pt ON p.id = pt.product_id 
WHERE pt.product_id IS NULL AND p."isActive" = true;

-- 2. Populate missing translations
-- This will create translations for all active products in all 7 languages
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    lang.language_code,
    COALESCE(
        (SELECT pt.name FROM product_translations pt 
         WHERE pt.product_id = p.id AND pt.language_code = lang.language_code),
        p.name  -- Use original product name as default
    ) as name,
    COALESCE(
        (SELECT pt.description FROM product_translations pt 
         WHERE pt.product_id = p.id AND pt.language_code = lang.language_code),
        p.description  -- Use original product description as default
    ) as description
FROM products p
CROSS JOIN (
    SELECT 'en' as language_code UNION ALL
    SELECT 'zh-Hant' UNION ALL
    SELECT 'zh-Hans' UNION ALL
    SELECT 'ja' UNION ALL
    SELECT 'ko' UNION ALL
    SELECT 'th' UNION ALL
    SELECT 'vi'
) lang
WHERE p."isActive" = true
ON CONFLICT (product_id, language_code) 
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. Verify the results
SELECT 'After population - translations count:' as info;
SELECT COUNT(*) as total_translations FROM product_translations;

SELECT 'Translations by language after population:' as info;
SELECT language_code, COUNT(*) as count 
FROM product_translations 
GROUP BY language_code 
ORDER BY language_code;

SELECT 'Sample translations for first product:' as info;
SELECT pt.language_code, pt.name, pt.description 
FROM product_translations pt
JOIN products p ON pt.product_id = p.id
WHERE p."isActive" = true
ORDER BY p.id, pt.language_code
LIMIT 14;

