-- FINAL FIX for Projects RLS Policies
-- This script will completely resolve the "new row violates row-level security policy" error

-- 1. First, let's see what policies currently exist
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

-- 2. Completely disable RLS temporarily to test
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
SELECT 'RLS disabled for projects table' as status;

-- 3. Test if we can insert data now (this should work)
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
  'Test Project',
  'Test Description',
  'Test Location',
  'Test Category',
  'Test Client',
  '2024',
  'Test Type',
  '/placeholder.svg',
  ARRAY['Feature 1', 'Feature 2'],
  ARRAY['Product 1'],
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

SELECT 'Test insert completed successfully' as status;

-- 4. Clean up test data
DELETE FROM projects WHERE title = 'Test Project';
SELECT 'Test data cleaned up' as status;

-- 5. Re-enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
SELECT 'RLS re-enabled for projects table' as status;

-- 6. Drop ALL existing policies (force removal)
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
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 7. Create a very permissive policy for testing
CREATE POLICY "projects_allow_all" ON projects
FOR ALL USING (true)
WITH CHECK (true);

SELECT 'Created permissive policy: projects_allow_all' as status;

-- 8. Test insert with RLS enabled
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
  'Test Project 2',
  'Test Description 2',
  'Test Location 2',
  'Test Category 2',
  'Test Client 2',
  '2024',
  'Test Type 2',
  '/placeholder.svg',
  ARRAY['Feature 1', 'Feature 2'],
  ARRAY['Product 1'],
  '$200K',
  '12 months',
  'Test Challenge 2',
  'Test Solution 2',
  'Test Result 2',
  true,
  false,
  2,
  NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Test insert with RLS enabled completed successfully' as status;

-- 9. Clean up test data
DELETE FROM projects WHERE title = 'Test Project 2';
SELECT 'Test data 2 cleaned up' as status;

-- 10. Now create proper, secure policies
DROP POLICY IF EXISTS "projects_allow_all" ON projects;

-- Public read access
CREATE POLICY "projects_public_read" ON projects
FOR SELECT USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "projects_authenticated_insert" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_authenticated_update" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "projects_authenticated_delete" ON projects
FOR DELETE USING (auth.role() = 'authenticated');

SELECT 'Created secure RLS policies for projects table' as status;

-- 11. Verify final policy structure
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

-- 12. Final test insert
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
  'Final Test Project',
  'Final Test Description',
  'Final Test Location',
  'Final Test Category',
  'Final Test Client',
  '2024',
  'Final Test Type',
  '/placeholder.svg',
  ARRAY['Final Feature 1', 'Final Feature 2'],
  ARRAY['Final Product 1'],
  '$300K',
  '18 months',
  'Final Test Challenge',
  'Final Test Solution',
  'Final Test Result',
  true,
  false,
  3,
  NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Final test insert completed successfully' as status;

-- 13. Clean up final test data
DELETE FROM projects WHERE title = 'Final Test Project';
SELECT 'Final test data cleaned up' as status;

-- 14. Summary
SELECT 'PROJECTS RLS FIX COMPLETE!' as result;
SELECT 'The projects table now has proper RLS policies that allow authenticated users to create, update, and delete projects.' as details;
SELECT 'You should now be able to create projects in the admin panel without RLS errors.' as next_step;
