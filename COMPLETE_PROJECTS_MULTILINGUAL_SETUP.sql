-- Complete Projects Multilingual Setup
-- This script ensures all project fields have proper database support for multilingual editing
-- Run this in Supabase SQL Editor before using the enhanced admin project editor

-- 1. Add missing columns to project_translations table
ALTER TABLE project_translations 
ADD COLUMN IF NOT EXISTS category VARCHAR(255),
ADD COLUMN IF NOT EXISTS completion_date VARCHAR(50),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS project_value VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration VARCHAR(255);

-- 2. Add missing columns to main projects table if they don't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS case_study_pdf TEXT,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS testimonial TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 3. Update projects table to ensure all existing records have default values
UPDATE projects SET 
    gallery_images = COALESCE(gallery_images, ARRAY[]::text[]),
    specifications = COALESCE(specifications, '{}'::jsonb),
    tags = COALESCE(tags, ARRAY[]::text[])
WHERE gallery_images IS NULL OR specifications IS NULL OR tags IS NULL;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_translations_category ON project_translations(category);
CREATE INDEX IF NOT EXISTS idx_project_translations_completion_date ON project_translations(completion_date);
CREATE INDEX IF NOT EXISTS idx_project_translations_project_type ON project_translations(project_type);
CREATE INDEX IF NOT EXISTS idx_project_translations_project_value ON project_translations(project_value);
CREATE INDEX IF NOT EXISTS idx_project_translations_duration ON project_translations(duration);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

-- 5. Update existing translations to include the new fields
UPDATE project_translations 
SET 
  category = p.category,
  completion_date = p.completion_date,
  project_type = p.project_type,
  project_value = p.project_value,
  duration = p.duration
FROM projects p 
WHERE project_translations.project_id = p.id
AND (
  project_translations.category IS NULL OR
  project_translations.completion_date IS NULL OR
  project_translations.project_type IS NULL OR
  project_translations.project_value IS NULL OR
  project_translations.duration IS NULL
);

-- 6. Generate slugs for existing projects that don't have them
UPDATE projects 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 7. Verify the structure is complete
SELECT 'Projects table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

SELECT 'Project translations table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'project_translations'
ORDER BY ordinal_position;

-- 8. Show sample data to verify everything is working
SELECT 'Sample projects with all fields:' as info;
SELECT 
  id,
  title,
  category,
  location,
  client,
  completion_date,
  project_type,
  project_value,
  duration,
  array_length(gallery_images, 1) as gallery_count,
  array_length(features, 1) as features_count,
  array_length(products_used, 1) as products_count,
  isActive,
  showInFeatured,
  slug
FROM projects 
LIMIT 3;

SELECT 'Sample translations:' as info;
SELECT 
  pt.project_id,
  pt.language_code,
  pt.title,
  pt.description,
  pt.category,
  pt.location,
  pt.client,
  pt.completion_date,
  pt.project_type,
  pt.project_value,
  pt.duration
FROM project_translations pt
LIMIT 5;

SELECT 'Setup complete! Projects now have full multilingual support with all fields.' as result;
