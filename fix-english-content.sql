-- Fix English Content Issue
-- This script ensures the main products table has proper English content
-- so that when English language is selected, it shows English text, not Chinese

-- First, let's see what's currently in the main products table
SELECT 
    id,
    name,
    LEFT(description, 100) || '...' as description_preview,
    category
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Now let's check what translations we have for English
SELECT 
    product_id,
    language_code,
    name,
    LEFT(description, 100) || '...' as description_preview
FROM product_translations 
WHERE language_code = 'en'
ORDER BY product_id
LIMIT 10;

-- The problem: Main products table has Chinese content, but English should show English content
-- Solution: Update the main products table to use English content from translations

-- Step 1: Update product names to English
UPDATE products 
SET name = (
    SELECT pt.name 
    FROM product_translations pt 
    WHERE pt.product_id = products.id 
    AND pt.language_code = 'en'
    AND pt.name IS NOT NULL
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 
    FROM product_translations pt 
    WHERE pt.product_id = products.id 
    AND pt.language_code = 'en'
    AND pt.name IS NOT NULL
);

-- Step 2: Update product descriptions to English
UPDATE products 
SET description = (
    SELECT pt.description 
    FROM product_translations pt 
    WHERE pt.product_id = products.id 
    AND pt.language_code = 'en'
    AND pt.description IS NOT NULL
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 
    FROM product_translations pt 
    WHERE pt.product_id = products.id 
    AND pt.language_code = 'en'
    AND pt.description IS NOT NULL
);

-- Step 3: Verify the changes
SELECT 
    id,
    name,
    LEFT(description, 100) || '...' as description_preview,
    category
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Check if we have any products without English translations
SELECT 
    p.id,
    p.name as main_name,
    p.category,
    pt.language_code,
    pt.name as translation_name
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.language_code = 'en'
WHERE pt.name IS NULL
ORDER BY p.id;

-- If there are products without English translations, we need to create them
-- This will ensure every product has English content
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    p.id,
    'en' as language_code,
    COALESCE(p.name, 'Product Name') as name,
    COALESCE(p.description, 'Product Description') as description
FROM products p
WHERE NOT EXISTS (
    SELECT 1 
    FROM product_translations pt 
    WHERE pt.product_id = p.id 
    AND pt.language_code = 'en'
)
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Final verification
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN name ~ '^[A-Za-z]' THEN 1 END) as english_names,
    COUNT(CASE WHEN name ~ '[\u4e00-\u9fff]' THEN 1 END) as chinese_names
FROM products;
