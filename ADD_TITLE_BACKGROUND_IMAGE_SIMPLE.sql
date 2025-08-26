-- Simple script to add title_background_image field to articles table

-- Add the title_background_image field if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_background_image TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN articles.title_background_image IS 'Background image URL for article title header section';

-- Verify the field was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'title_background_image';
