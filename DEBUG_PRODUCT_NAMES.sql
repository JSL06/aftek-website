-- DEBUG: Product Names Issue Investigation
-- This script will help identify why product names are not being saved

-- 1. Check if product_translations table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- 2. Check current data in product_translations
SELECT 
    product_id,
    language_code,
    name,
    description,
    created_at,
    updated_at
FROM product_translations
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any products without translations
SELECT 
    p.id,
    p.name as product_name,
    COUNT(pt.language_code) as translation_count
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
GROUP BY p.id, p.name
ORDER BY translation_count ASC;

-- 4. Check RLS policies on product_translations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_translations';

-- 5. Test inserting a sample translation
-- (This will help identify if the issue is with permissions or data structure)
INSERT INTO product_translations (product_id, language_code, name, description)
VALUES (
    (SELECT id FROM products LIMIT 1), -- Use first available product
    'zh-Hant',
    'TEST NAME ' || NOW(),
    'Test description ' || NOW()
)
ON CONFLICT (product_id, language_code) 
DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW()
RETURNING *;

-- 6. Check if the test insert worked
SELECT 
    product_id,
    language_code,
    name,
    description,
    created_at,
    updated_at
FROM product_translations
WHERE name LIKE 'TEST NAME%'
ORDER BY created_at DESC
LIMIT 5;

-- 7. Check for any triggers that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'product_translations';

-- 8. Check for any constraints that might be preventing inserts
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'product_translations';
