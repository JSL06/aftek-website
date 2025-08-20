-- Update Projects table to add multilingual support for missing fields
-- Run this in Supabase SQL Editor to extend the multilingual system

-- 1. Add new columns to project_translations table for the missing fields
ALTER TABLE project_translations 
ADD COLUMN IF NOT EXISTS category VARCHAR(255),
ADD COLUMN IF NOT EXISTS completion_date VARCHAR(50),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS project_value VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration VARCHAR(255);

-- 2. Create indexes for the new multilingual fields
CREATE INDEX IF NOT EXISTS idx_project_translations_category ON project_translations(category);
CREATE INDEX IF NOT EXISTS idx_project_translations_completion_date ON project_translations(completion_date);
CREATE INDEX IF NOT EXISTS idx_project_translations_project_type ON project_translations(project_type);
CREATE INDEX IF NOT EXISTS idx_project_translations_project_value ON project_translations(project_value);
CREATE INDEX IF NOT EXISTS idx_project_translations_duration ON project_translations(duration);

-- 3. Update existing translations to include the new fields
-- This will populate the new multilingual fields with existing data from the main projects table
UPDATE project_translations 
SET 
  category = p.category,
  completion_date = p.completion_date,
  project_type = p.project_type,
  project_value = p.project_value,
  duration = p.duration
FROM projects p 
WHERE project_translations.project_id = p.id;

-- 4. Verify the updated structure
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

-- 5. Show sample data with new fields
SELECT 'Sample translations with new fields:' as info;
SELECT 
  pt.project_id,
  pt.language_code,
  pt.title,
  pt.category,
  pt.location,
  pt.client,
  pt.completion_date,
  pt.project_type,
  pt.project_value,
  pt.duration
FROM project_translations pt
LIMIT 5;

SELECT 'Update complete! Projects now have full multilingual support.' as result;
