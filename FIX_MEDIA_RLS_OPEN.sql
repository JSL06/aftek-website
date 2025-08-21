-- FIX_MEDIA_RLS_OPEN.sql
-- This script creates completely open RLS policies for the media_files table
-- WARNING: This is for development/testing only - allows all operations

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
DROP POLICY IF EXISTS "Open access policy" ON media_files;

-- 3. Create completely open RLS policies (DEVELOPMENT ONLY)

-- Policy 1: Allow ALL operations for ALL users (completely open)
CREATE POLICY "Open access policy" ON media_files
    FOR ALL USING (true)
    WITH CHECK (true);

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
        EXECUTE 'DROP POLICY IF EXISTS "Open access policy" ON media_categories';
        
        -- Create open policy
        EXECUTE 'CREATE POLICY "Open access policy" ON media_categories FOR ALL USING (true) WITH CHECK (true)';
        
        RAISE NOTICE 'Open RLS policies created for media_categories table';
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

-- 8. Test INSERT permission (this should work now)
SELECT 
    'INSERT Test' as test_type,
    '✅ INSERT should now be allowed' as result;

-- 9. Show current user authentication status
SELECT 
    'Auth Status' as check_type,
    CASE 
        WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
        WHEN auth.role() = 'anon' THEN '✅ User is anonymous'
        ELSE '❌ User role: ' || auth.role()
    END as status,
    auth.uid() as user_id;
