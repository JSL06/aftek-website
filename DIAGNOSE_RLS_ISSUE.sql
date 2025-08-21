-- DIAGNOSE_RLS_ISSUE.sql
-- This script diagnoses the exact RLS issue causing the policy violation

-- 1. Check if RLS is enabled on media_files table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'media_files';

-- 2. Check all existing RLS policies on media_files table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'media_files'
ORDER BY policyname;

-- 3. Check if there are any policies on other tables that might be interfering
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename LIKE '%media%' OR tablename LIKE '%file%'
ORDER BY tablename, policyname;

-- 4. Check the exact structure of media_files table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'media_files'
ORDER BY ordinal_position;

-- 5. Check if there are any triggers or constraints that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'media_files';

-- 6. Check if there are any foreign key constraints that might have RLS
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'media_files' OR ccu.table_name = 'media_files');

-- 7. Check if the user has proper permissions
SELECT 
    'Current User' as check_type,
    current_user as username,
    session_user as session_username;

-- 8. Check if auth.uid() and auth.role() are working
SELECT 
    'Auth Functions' as check_type,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ auth.uid() works: ' || auth.uid()
        ELSE '❌ auth.uid() returns NULL'
    END as uid_status,
    CASE 
        WHEN auth.role() IS NOT NULL THEN '✅ auth.role() works: ' || auth.role()
        ELSE '❌ auth.role() returns NULL'
    END as role_status;

-- 9. Test a simple INSERT to see the exact error
DO $$
BEGIN
    BEGIN
        INSERT INTO media_files (
            filename, 
            original_filename, 
            file_path, 
            file_size, 
            mime_type, 
            alt_text, 
            description, 
            tags, 
            is_public
        ) VALUES (
            'test-file.jpg',
            'test-file.jpg',
            'media/test-file.jpg',
            1024,
            'image/jpeg',
            'Test file',
            'Test description',
            ARRAY['test'],
            true
        );
        RAISE NOTICE '✅ INSERT test successful';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT test failed: %', SQLERRM;
    END;
END $$;
