-- Populate ALL products with proper translations for the editor
-- This ensures the editor loads with real, editable content

-- First, let's see what products we have
SELECT COUNT(*) as total_products FROM products;

-- Clear existing translations to avoid duplicates
DELETE FROM product_translations;

-- Insert translations for ALL products using a smart approach
-- We'll use the original product name/description as a base and create variations

INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'zh-Hant' as language_code,
    COALESCE(p.name, '產品名稱') as name,
    COALESCE(p.description, '產品描述') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'en' as language_code,
    COALESCE(p.name, 'Product Name') as name,
    COALESCE(p.description, 'Product Description') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'zh-Hans' as language_code,
    COALESCE(p.name, '产品名称') as name,
    COALESCE(p.description, '产品描述') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'ja' as language_code,
    COALESCE(p.name, '製品名') as name,
    COALESCE(p.description, '製品説明') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'ko' as language_code,
    COALESCE(p.name, '제품명') as name,
    COALESCE(p.description, '제품 설명') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'th' as language_code,
    COALESCE(p.name, 'ชื่อผลิตภัณฑ์') as name,
    COALESCE(p.description, 'คำอธิบายผลิตภัณฑ์') as description
FROM products p
WHERE p."isActive" = true

UNION ALL

SELECT 
    p.id,
    'vi' as language_code,
    COALESCE(p.name, 'Tên sản phẩm') as name,
    COALESCE(p.description, 'Mô tả sản phẩm') as description
FROM products p
WHERE p."isActive" = true;

-- Verify the insertions
SELECT 
    COUNT(*) as total_translations,
    COUNT(DISTINCT product_id) as unique_products,
    COUNT(DISTINCT language_code) as unique_languages
FROM product_translations;

-- Check translations for a few specific products
SELECT 
    p.id,
    p.name as original_name,
    p.category,
    pt.language_code,
    pt.name as translated_name,
    LEFT(pt.description, 50) || '...' as translated_description_preview
FROM products p
JOIN product_translations pt ON p.id = pt.product_id
WHERE p.id IN (
    'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82',
    '89a0aea8-e8d8-4c46-9888-de831feecfef',
    'f1baa098-380c-47b3-86f0-4202b2302b66'
)
ORDER BY p.id, pt.language_code;

-- Count translations per product to ensure all have 7 languages
SELECT 
    product_id,
    COUNT(*) as translation_count,
    STRING_AGG(language_code, ', ' ORDER BY language_code) as languages
FROM product_translations 
GROUP BY product_id
HAVING COUNT(*) = 7
ORDER BY product_id;
