-- FIX_EXISTING_TABLE.sql
-- This script safely handles existing tables and policies

-- 1. Check if the table exists and show its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- 2. Show existing policies
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

-- 3. Show table count
SELECT COUNT(*) as product_translations_count FROM product_translations;

-- 4. Test basic functionality (safe operations)
DO $$
DECLARE
    test_product_id UUID;
    test_translation_id UUID;
BEGIN
    -- Get a test product ID (use the first available product)
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE 'Found test product with ID: %', test_product_id;
        
        -- Test insert
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES (test_product_id, 'test', 'Test Name', 'Test Description')
        RETURNING id INTO test_translation_id;
        
        RAISE NOTICE '✅ Test insert successful, ID: %', test_translation_id;
        
        -- Test select
        IF EXISTS (SELECT 1 FROM product_translations WHERE id = test_translation_id) THEN
            RAISE NOTICE '✅ Test select successful';
        ELSE
            RAISE NOTICE '❌ Test select failed';
        END IF;
        
        -- Clean up test data
        DELETE FROM product_translations WHERE id = test_translation_id;
        RAISE NOTICE '✅ Test data cleaned up';
        
    ELSE
        RAISE NOTICE '⚠️ No products found in database, skipping insert test';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Test encountered error: %', SQLERRM;
    RAISE NOTICE 'This indicates a configuration issue that needs fixing';
END $$;

-- 5. Show final status
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_translations') 
        THEN '✅ product_translations table exists and is accessible'
        ELSE '❌ product_translations table does not exist'
    END as table_status;
