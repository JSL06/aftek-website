-- FIX for Projects Table Name Column Issue
-- The table still has the old 'name' column with NOT NULL constraint

-- 1. Check current table structure
SELECT 'Current projects table columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  is_identity
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 2. Check if 'name' column exists and has data
SELECT 'Checking name column:' as info;
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'name'
  ) THEN 'EXISTS' ELSE 'MISSING' END as name_column_status;

-- 3. If 'name' column exists, update existing rows to use 'title' value
UPDATE projects 
SET name = COALESCE(title, 'Untitled Project')
WHERE name IS NULL AND title IS NOT NULL;

-- 4. If 'name' column exists, make it nullable
ALTER TABLE projects ALTER COLUMN name DROP NOT NULL;

-- 5. If 'name' column exists, add a default value
ALTER TABLE projects ALTER COLUMN name SET DEFAULT 'Untitled Project';

-- 6. Update any remaining NULL names
UPDATE projects 
SET name = COALESCE(name, title, 'Untitled Project')
WHERE name IS NULL;

-- 7. Now try the test insert again
INSERT INTO projects (
  id,
  name,
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

-- 8. Clean up test data
DELETE FROM projects WHERE title = 'Test Project';
SELECT 'Test data cleaned up' as status;

-- 9. Final table structure
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

SELECT 'PROJECTS NAME COLUMN FIX COMPLETE!' as result;
SELECT 'The name column constraint issue has been resolved. You can now create projects.' as details;
