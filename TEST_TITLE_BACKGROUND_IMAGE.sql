-- Test script to check title_background_image field and data

-- Check if the field exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'title_background_image';

-- Check if there are any articles with title_background_image data
SELECT 
    id,
    title_en,
    title_background_image,
    created_at
FROM articles 
WHERE title_background_image IS NOT NULL 
AND title_background_image != '';

-- Check all articles to see their current state
SELECT 
    id,
    title_en,
    title_background_image,
    created_at
FROM articles 
ORDER BY created_at DESC 
LIMIT 5;
