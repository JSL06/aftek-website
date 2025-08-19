-- VERIFY_TABLE.sql
-- Simple verification that the table is working

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_translations') 
        THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as status;

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_translations' 
ORDER BY ordinal_position;

-- Check if we can read from the table
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM product_translations LIMIT 1) 
        THEN '✅ Can read from table'
        ELSE '⚠️ Table is empty or has access issues'
    END as read_status;

-- Show any existing data
SELECT COUNT(*) as total_records FROM product_translations;
