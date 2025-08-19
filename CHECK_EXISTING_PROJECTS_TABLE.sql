-- Check existing projects table structure
-- Run this first to see what already exists

-- 1. Check if projects table exists and show its current structure
SELECT 'Current projects table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 2. Check if project_translations table exists
SELECT 'Project translations table exists:' as info;
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_translations'
  ) THEN 'EXISTS' ELSE 'MISSING' END as project_translations_status;

-- 3. Show sample data from existing projects table
SELECT 'Sample existing project data:' as info;
SELECT * FROM projects LIMIT 1;

-- 4. Check RLS policies
SELECT 'Current RLS policies:' as info;
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects';

-- 5. Check table constraints
SELECT 'Table constraints:' as info;
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'projects'::regclass;
