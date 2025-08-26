-- Check if title_background_image field exists in articles table

-- Check the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY column_name;

-- Specifically check for image-related fields
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name LIKE '%image%'
ORDER BY column_name;

-- Check if there are any articles with data (only check existing columns)
SELECT 
    id,
    title_en,
    title_background_image
FROM articles 
LIMIT 5;
