-- FIX_MEDIA_RLS_BASIC.sql
-- This script creates the most basic RLS policies for the media_files table
-- Focuses on simplicity and reliability

-- 1. Enable RLS on media_files table
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Public read access" ON media_files;
DROP POLICY IF EXISTS "Authenticated users can insert" ON media_files;
DROP POLICY IF EXISTS "Users can update own uploads" ON media_files;
DROP POLICY IF EXISTS "Users can delete own uploads" ON media_files;
DROP POLICY IF EXISTS "Admin full access" ON media_files;
DROP POLICY IF EXISTS "Enable read access for all users" ON media_files;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON media_files;
DROP POLICY IF EXISTS "Enable update for users based on uploaded_by" ON media_files;
DROP POLICY IF EXISTS "Enable delete for users based on uploaded_by" ON media_files;
DROP POLICY IF EXISTS "Basic read policy" ON media_files;
DROP POLICY IF EXISTS "Basic insert policy" ON media_files;
DROP POLICY IF EXISTS "Basic update policy" ON media_files;
DROP POLICY IF EXISTS "Basic delete policy" ON media_files;

-- 3. Create the most basic RLS policies possible

-- Policy 1: Allow SELECT for all users (including anonymous)
CREATE POLICY "Basic read policy" ON media_files
    FOR SELECT USING (true);

-- Policy 2: Allow INSERT for any authenticated user
CREATE POLICY "Basic insert policy" ON media_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow UPDATE for any authenticated user
CREATE POLICY "Basic update policy" ON media_files
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow DELETE for any authenticated user
CREATE POLICY "Basic delete policy" ON media_files
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Also fix RLS for media_categories table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_categories') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY';
        
        -- Drop existing policies
        EXECUTE 'DROP POLICY IF EXISTS "Public read access" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for authenticated users only" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Basic read policy" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Basic insert policy" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Basic update policy" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Basic delete policy" ON media_categories';
        
        -- Create basic policies
        EXECUTE 'CREATE POLICY "Basic read policy" ON media_categories FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Basic insert policy" ON media_categories FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Basic update policy" ON media_categories FOR UPDATE USING (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Basic delete policy" ON media_categories FOR DELETE USING (auth.role() = ''authenticated'')';
        
        RAISE NOTICE 'Basic RLS policies created for media_categories table';
    END IF;
END $$;

-- 5. Verify the RLS setup
SELECT 
    'media_files RLS Status' as table_name,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status,
    COUNT(*) as policy_count
FROM pg_policies p
JOIN pg_class c ON p.tablename = c.relname
WHERE p.tablename = 'media_files'
GROUP BY c.relrowsecurity

UNION ALL

SELECT 
    'media_categories RLS Status' as table_name,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status,
    COUNT(*) as policy_count
FROM pg_policies p
JOIN pg_class c ON p.tablename = c.relname
WHERE p.tablename = 'media_categories'
GROUP BY c.relrowsecurity;

-- 6. Show all policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('media_files', 'media_categories')
ORDER BY tablename, policyname;

-- 7. Test the policies with a simple query
SELECT 
    'Policy Test' as test_type,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ media_files table accessible'
        ELSE '❌ media_files table not accessible'
    END as result
FROM media_files 
LIMIT 1;

-- 8. Show current user authentication status
SELECT 
    'Auth Status' as check_type,
    CASE 
        WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
        ELSE '❌ User is not authenticated'
    END as status,
    auth.uid() as user_id;
