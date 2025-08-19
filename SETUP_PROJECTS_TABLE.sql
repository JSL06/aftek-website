-- Setup Projects table with multilingual support
-- Run this in Supabase SQL Editor to create the projects system

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  category VARCHAR(255),
  client VARCHAR(255),
  completion_date VARCHAR(50),
  project_type VARCHAR(255),
  image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  case_study_pdf TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  specifications JSONB DEFAULT '{}',
  products_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  project_value VARCHAR(255),
  duration VARCHAR(255),
  challenges TEXT,
  solutions TEXT,
  results TEXT,
  testimonial TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "showInFeatured" BOOLEAN DEFAULT false,
  "displayOrder" INTEGER DEFAULT 99,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create project_translations table for multilingual support
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

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_translations_updated_at 
    BEFORE UPDATE ON project_translations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert sample project data for testing
INSERT INTO projects (
  title,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  image,
  features,
  "isActive",
  "showInFeatured",
  "displayOrder"
) VALUES (
  'Modern Office Complex',
  'A state-of-the-art office complex featuring sustainable design and advanced construction techniques.',
  'Taipei, Taiwan',
  'Commercial',
  'TechCorp Inc.',
  '2023',
  'Office Building',
  '/placeholder.svg',
  ARRAY['Sustainable Design', 'Smart Building', 'Green Roof'],
  true,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- 9. Insert sample translations for the test project
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
  p.title,
  p.description,
  p.location,
  p.client
FROM projects p 
WHERE p.title = 'Modern Office Complex'
ON CONFLICT (project_id, language_code) DO NOTHING;

-- 10. Verify the setup
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

SELECT 'Setup complete! Projects system is ready.' as result;
