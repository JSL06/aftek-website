-- Quick check for product saving issue
-- Run this in Supabase SQL editor

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'product_translations'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_translations'
ORDER BY ordinal_position;

-- 3. Check if there's any data
SELECT COUNT(*) as total_translations FROM product_translations;

-- 4. Check RLS policies
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'product_translations';

-- 5. Check if we can insert data (this will test permissions)
INSERT INTO product_translations (product_id, language_code, name, description)
VALUES (
    (SELECT id FROM products LIMIT 1),
    'zh-Hant',
    'TEST NAME',
    'Test description'
)
ON CONFLICT (product_id, language_code) 
DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW()
RETURNING *;
