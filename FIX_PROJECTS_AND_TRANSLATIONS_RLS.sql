-- COMPREHENSIVE FIX for Projects AND Project_Translations RLS Policies
-- This script fixes RLS policies for both tables to resolve all permission errors

-- 1. Check current RLS policies for both tables
SELECT 'Current RLS policies for projects table:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects';

SELECT 'Current RLS policies for project_translations table:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'project_translations';

-- 2. Fix PROJECTS table RLS policies
-- Drop all existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'projects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON projects';
        RAISE NOTICE 'Dropped projects policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create proper policies for projects table
CREATE POLICY "projects_public_read" ON projects
FOR SELECT USING (true);

CREATE POLICY "projects_authenticated_insert" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_authenticated_update" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "projects_authenticated_delete" ON projects
FOR DELETE USING (auth.role() = 'authenticated');

SELECT 'Created RLS policies for projects table' as status;

-- 3. Fix PROJECT_TRANSLATIONS table RLS policies
-- Drop all existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_translations'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON project_translations';
        RAISE NOTICE 'Dropped project_translations policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create proper policies for project_translations table
CREATE POLICY "project_translations_public_read" ON project_translations
FOR SELECT USING (true);

CREATE POLICY "project_translations_authenticated_insert" ON project_translations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "project_translations_authenticated_update" ON project_translations
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "project_translations_authenticated_delete" ON project_translations
FOR DELETE USING (auth.role() = 'authenticated');

SELECT 'Created RLS policies for project_translations table' as status;

-- 4. Test both tables work correctly
-- Test projects table
INSERT INTO projects (
  id,
  title,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  image,
  features,
  products_used,
  project_value,
  duration,
  challenges,
  solutions,
  results,
  "isActive",
  "showInFeatured",
  "displayOrder",
  created_at
) VALUES (
  gen_random_uuid(),
  'RLS Test Project',
  'Testing RLS policies',
  'Test Location',
  'Test Category',
  'Test Client',
  '2024',
  'Test Type',
  '/placeholder.svg',
  ARRAY['Test Feature'],
  ARRAY['Test Product'],
  '$100K',
  '6 months',
  'Test Challenge',
  'Test Solution',
  'Test Result',
  true,
  false,
  1,
  NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Projects table test insert successful' as status;

-- Get the project ID for translation test
DO $$
DECLARE
    test_project_id UUID;
BEGIN
    SELECT id INTO test_project_id FROM projects WHERE title = 'RLS Test Project' LIMIT 1;
    
    -- Test project_translations table
    INSERT INTO project_translations (
      project_id,
      language_code,
      title,
      description
    ) VALUES (
      test_project_id,
      'en',
      'English Title',
      'English Description'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Project translations test insert successful for project ID: %', test_project_id;
END $$;

SELECT 'Project translations table test insert successful' as status;

-- 5. Clean up test data
DELETE FROM project_translations WHERE project_id IN (
  SELECT id FROM projects WHERE title = 'RLS Test Project'
);
DELETE FROM projects WHERE title = 'RLS Test Project';

SELECT 'Test data cleaned up' as status;

-- 6. Verify final policy structure
SELECT 'Final RLS policies for projects table:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

SELECT 'Final RLS policies for project_translations table:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'project_translations'
ORDER BY policyname;

-- 7. Summary
SELECT 'PROJECTS AND TRANSLATIONS RLS FIX COMPLETE!' as result;
SELECT 'Both projects and project_translations tables now have proper RLS policies.' as details;
SELECT 'You should now be able to create, edit, and save projects with translations without RLS errors.' as next_step;
