-- Fix existing projects table to add missing columns and update structure
-- Run this after checking the existing structure

-- 1. Add missing columns to existing projects table
DO $$
BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE projects ADD COLUMN title VARCHAR(255);
    RAISE NOTICE 'Added title column to projects table';
  ELSE
    RAISE NOTICE 'Title column already exists';
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE projects ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to projects table';
  ELSE
    RAISE NOTICE 'Description column already exists';
  END IF;

  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'location'
  ) THEN
    ALTER TABLE projects ADD COLUMN location VARCHAR(255);
    RAISE NOTICE 'Added location column to projects table';
  ELSE
    RAISE NOTICE 'Location column already exists';
  END IF;

  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE projects ADD COLUMN category VARCHAR(255);
    RAISE NOTICE 'Added category column to projects table';
  ELSE
    RAISE NOTICE 'Category column already exists';
  END IF;

  -- Add client column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'client'
  ) THEN
    ALTER TABLE projects ADD COLUMN client VARCHAR(255);
    RAISE NOTICE 'Added client column to projects table';
  ELSE
    RAISE NOTICE 'Client column already exists';
  END IF;

  -- Add completion_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'completion_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN completion_date VARCHAR(50);
    RAISE NOTICE 'Added completion_date column to projects table';
  ELSE
    RAISE NOTICE 'Completion_date column already exists';
  END IF;

  -- Add project_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'project_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_type VARCHAR(255);
    RAISE NOTICE 'Added project_type column to projects table';
  ELSE
    RAISE NOTICE 'Project_type column already exists';
  END IF;

  -- Add image column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'image'
  ) THEN
    ALTER TABLE projects ADD COLUMN image TEXT;
    RAISE NOTICE 'Added image column to projects table';
  ELSE
    RAISE NOTICE 'Image column already exists';
  END IF;

  -- Add gallery column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'gallery'
  ) THEN
    ALTER TABLE projects ADD COLUMN gallery TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added gallery column to projects table';
  ELSE
    RAISE NOTICE 'Gallery column already exists';
  END IF;

  -- Add case_study_pdf column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'case_study_pdf'
  ) THEN
    ALTER TABLE projects ADD COLUMN case_study_pdf TEXT;
    RAISE NOTICE 'Added case_study_pdf column to projects table';
  ELSE
    RAISE NOTICE 'Case_study_pdf column already exists';
  END IF;

  -- Add features column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE projects ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added features column to projects table';
  ELSE
    RAISE NOTICE 'Features column already exists';
  END IF;

  -- Add specifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'specifications'
  ) THEN
    ALTER TABLE projects ADD COLUMN specifications JSONB DEFAULT '{}';
    RAISE NOTICE 'Added specifications column to projects table';
  ELSE
    RAISE NOTICE 'Specifications column already exists';
  END IF;

  -- Add products_used column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'products_used'
  ) THEN
    ALTER TABLE projects ADD COLUMN products_used TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added products_used column to projects table';
  ELSE
    RAISE NOTICE 'Products_used column already exists';
  END IF;

  -- Add project_value column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'project_value'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_value VARCHAR(255);
    RAISE NOTICE 'Added project_value column to projects table';
  ELSE
    RAISE NOTICE 'Project_value column already exists';
  END IF;

  -- Add duration column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'duration'
  ) THEN
    ALTER TABLE projects ADD COLUMN duration VARCHAR(255);
    RAISE NOTICE 'Added duration column to projects table';
  ELSE
    RAISE NOTICE 'Duration column already exists';
  END IF;

  -- Add challenges column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'challenges'
  ) THEN
    ALTER TABLE projects ADD COLUMN challenges TEXT;
    RAISE NOTICE 'Added challenges column to projects table';
  ELSE
    RAISE NOTICE 'Challenges column already exists';
  END IF;

  -- Add solutions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'solutions'
  ) THEN
    ALTER TABLE projects ADD COLUMN solutions TEXT;
    RAISE NOTICE 'Added solutions column to projects table';
  ELSE
    RAISE NOTICE 'Solutions column already exists';
  END IF;

  -- Add results column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'results'
  ) THEN
    ALTER TABLE projects ADD COLUMN results TEXT;
    RAISE NOTICE 'Added results column to projects table';
  ELSE
    RAISE NOTICE 'Results column already exists';
  END IF;

  -- Add testimonial column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'testimonial'
  ) THEN
    ALTER TABLE projects ADD COLUMN testimonial TEXT;
    RAISE NOTICE 'Added testimonial column to projects table';
  ELSE
    RAISE NOTICE 'Testimonial column already exists';
  END IF;

  -- Add isActive column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'isActive'
  ) THEN
    ALTER TABLE projects ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added isActive column to projects table';
  ELSE
    RAISE NOTICE 'isActive column already exists';
  END IF;

  -- Add showInFeatured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'showInFeatured'
  ) THEN
    ALTER TABLE projects ADD COLUMN "showInFeatured" BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added showInFeatured column to projects table';
  ELSE
    RAISE NOTICE 'showInFeatured column already exists';
  END IF;

  -- Add displayOrder column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'displayOrder'
  ) THEN
    ALTER TABLE projects ADD COLUMN "displayOrder" INTEGER DEFAULT 99;
    RAISE NOTICE 'Added displayOrder column to projects table';
  ELSE
    RAISE NOTICE 'displayOrder column already exists';
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE projects ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added tags column to projects table';
  ELSE
    RAISE NOTICE 'Tags column already exists';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to projects table';
  ELSE
    RAISE NOTICE 'Updated_at column already exists';
  END IF;

END $$;

-- 2. Create project_translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  challenges TEXT,
  solutions TEXT,
  results TEXT,
  location VARCHAR(255),
  client VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, language_code)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_isActive ON projects("isActive");
CREATE INDEX IF NOT EXISTS idx_projects_showInFeatured ON projects("showInFeatured");
CREATE INDEX IF NOT EXISTS idx_projects_displayOrder ON projects("displayOrder");
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_project_translations_project_id ON project_translations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_translations_language ON project_translations(language_code);

-- 4. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_translations ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for projects table
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON projects;

-- Public read access
CREATE POLICY "Enable read access for all users" ON projects
FOR SELECT USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Enable insert for authenticated users only" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON projects
FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Create RLS policies for project_translations table
DROP POLICY IF EXISTS "Enable read access for all users" ON project_translations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON project_translations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON project_translations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON project_translations;

-- Public read access
CREATE POLICY "Enable read access for all users" ON project_translations
FOR SELECT USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Enable insert for authenticated users only" ON project_translations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON project_translations
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON project_translations
FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_translations_updated_at ON project_translations;
CREATE TRIGGER update_project_translations_updated_at 
    BEFORE UPDATE ON project_translations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Update existing projects to populate new columns
UPDATE projects 
SET 
  title = COALESCE(title, name),
  description = COALESCE(description, ''),
  location = COALESCE(location, ''),
  category = COALESCE(category, 'General'),
  client = COALESCE(client, ''),
  completion_date = COALESCE(completion_date, ''),
  project_type = COALESCE(project_type, ''),
  image = COALESCE(image, '/placeholder.svg'),
  features = COALESCE(features, ARRAY[]::TEXT[]),
  "isActive" = COALESCE("isActive", true),
  "showInFeatured" = COALESCE("showInFeatured", false),
  "displayOrder" = COALESCE("displayOrder", 99)
WHERE title IS NULL OR description IS NULL;

-- 9. Insert sample translations for existing projects
INSERT INTO project_translations (
  project_id,
  language_code,
  title,
  description,
  location,
  client
) 
SELECT 
  p.id,
  'en',
  COALESCE(p.title, p.name),
  COALESCE(p.description, ''),
  COALESCE(p.location, ''),
  COALESCE(p.client, '')
FROM projects p 
WHERE NOT EXISTS (
  SELECT 1 FROM project_translations pt 
  WHERE pt.project_id = p.id AND pt.language_code = 'en'
)
ON CONFLICT (project_id, language_code) DO NOTHING;

-- 10. Verify the final structure
SELECT 'Final projects table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

SELECT 'Final project translations table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'project_translations'
ORDER BY ordinal_position;

SELECT 'Sample project data:' as info;
SELECT 
  id,
  title,
  description,
  category,
  "isActive",
  "showInFeatured"
FROM projects 
LIMIT 3;

SELECT 'Sample translations:' as info;
SELECT 
  pt.project_id,
  pt.language_code,
  pt.title,
  pt.description
FROM project_translations pt
LIMIT 3;

SELECT 'RLS policies:' as info;
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('projects', 'project_translations')
ORDER BY tablename, policyname;

SELECT 'Projects table fix complete! System is ready.' as result;
