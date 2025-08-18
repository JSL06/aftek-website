-- Check current product data to see what needs to be loaded into the editor

-- 1. Check main products table
SELECT 
    id,
    name,
    description,
    category,
    model,
    "inStock",
    "showInFeatured",
    "isActive",
    created_at,
    updated_at
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check product_translations table
SELECT 
    product_id,
    language_code,
    name,
    LEFT(description, 100) || '...' as description_preview,
    created_at
FROM product_translations 
ORDER BY product_id, language_code
LIMIT 20;

-- 3. Count translations per product
SELECT 
    product_id,
    COUNT(*) as translation_count,
    STRING_AGG(language_code, ', ' ORDER BY language_code) as languages
FROM product_translations 
GROUP BY product_id
ORDER BY translation_count DESC;

-- 4. Check specific product (the one you're testing with)
SELECT 
    p.id,
    p.name as original_name,
    p.description as original_description,
    p.category,
    p.model,
    p."inStock",
    p."showInFeatured",
    p."isActive"
FROM products p
WHERE p.id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';

-- 5. Check translations for specific product
SELECT 
    language_code,
    name,
    description,
    created_at
FROM product_translations 
WHERE product_id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
ORDER BY language_code;
