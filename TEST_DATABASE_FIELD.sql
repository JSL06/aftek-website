-- Test to verify the exact field name and structure

-- Check the exact column name (case sensitive)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name ILIKE '%title%background%image%';

-- Check if there are any similar field names
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name LIKE '%image%';

-- Try to update the field directly to test if it works
UPDATE articles 
SET title_background_image = 'test-url-123'
WHERE id = 'd7f360e0-6d5f-4540-9645-ba4f1d5eaff0'
RETURNING id, title_background_image;

-- Check the result
SELECT 
    id,
    title_en,
    title_background_image
FROM articles 
WHERE id = 'd7f360e0-6d5f-4540-9645-ba4f1d5eaff0';
