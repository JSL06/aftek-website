-- ADD PROJECT FEATURES COLUMN
-- This script adds the features column to project_translations table for multilingual features support
-- Run this in your Supabase SQL Editor

-- 1. Check if features column exists in project_translations table
SELECT 'Checking project_translations table for features column:' as info;

DO $$
BEGIN
    -- Check if features column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'project_translations'
        AND column_name = 'features'
    ) THEN
        -- Add features column to project_translations table
        ALTER TABLE project_translations ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added features column to project_translations table';
    ELSE
        RAISE NOTICE 'Features column already exists in project_translations table';
    END IF;
END $$;

-- 2. Update existing project_translations with empty features array if NULL
UPDATE project_translations
SET features = ARRAY[]::TEXT[]
WHERE features IS NULL;

-- 3. Copy existing features from projects table to English translations
UPDATE project_translations 
SET features = (
  SELECT p.features 
  FROM projects p 
  WHERE p.id = project_translations.project_id
)
WHERE language_code = 'en' 
AND features = '{}'::TEXT[]
AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_translations.project_id 
  AND p.features IS NOT NULL 
  AND p.features != '{}'::TEXT[]
);

-- 4. Show the updated table structure
SELECT 'Updated project_translations table structure:' as info;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'project_translations'
ORDER BY ordinal_position;

-- 5. Show sample data
SELECT 'Sample project_translations with features:' as info;

SELECT
    pt.project_id,
    pt.language_code,
    pt.title,
    LEFT(pt.description, 50) as description_preview,
    pt.features,
    array_length(pt.features, 1) as feature_count
FROM project_translations pt
WHERE pt.features IS NOT NULL 
  AND array_length(pt.features, 1) > 0
LIMIT 5;

SELECT 'Features column added successfully to project_translations table!' as status;
