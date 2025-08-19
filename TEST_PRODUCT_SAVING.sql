-- TEST PRODUCT SAVING FUNCTIONALITY
-- Run this after setting up the product_translations table

-- 1. Check if we have products to work with
SELECT COUNT(*) as total_products FROM products;

-- 2. Check if we have any existing translations
SELECT COUNT(*) as total_translations FROM product_translations;

-- 3. Show a sample product with its translations
SELECT 
    p.id,
    p.name as product_name,
    p.description as product_description,
    pt.language_code,
    pt.name as translation_name,
    pt.description as translation_description
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
LIMIT 3;

-- 4. Test inserting a new translation (this simulates what the admin panel does)
DO $$
DECLARE
    test_product_id UUID;
    test_result RECORD;
BEGIN
    -- Get a sample product ID
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        -- Insert a test translation
        INSERT INTO product_translations (product_id, language_code, name, description)
        VALUES (test_product_id, 'en', 'TEST NAME ' || NOW(), 'TEST DESCRIPTION ' || NOW())
        RETURNING * INTO test_result;
        
        RAISE NOTICE 'Test translation inserted: %', test_result;
        
        -- Verify it was saved
        IF EXISTS (SELECT 1 FROM product_translations WHERE id = test_result.id) THEN
            RAISE NOTICE '✅ Translation was successfully saved to database';
        ELSE
            RAISE NOTICE '❌ Translation was NOT saved to database';
        END IF;
        
        -- Clean up test data
        DELETE FROM product_translations WHERE id = test_result.id;
        RAISE NOTICE 'Test data cleaned up';
        
    ELSE
        RAISE NOTICE 'No products available for testing';
    END IF;
END $$;
