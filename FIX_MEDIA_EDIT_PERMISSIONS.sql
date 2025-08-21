-- FIX_MEDIA_EDIT_PERMISSIONS.sql
-- This script fixes the permissions for editing media file metadata

-- 1. Check current RLS status on media_files table
SELECT 
    'Current RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'media_files';

-- 2. Check existing policies on media_files table
SELECT 
    'Existing Policies' as check_type,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'media_files'
ORDER BY policyname;

-- 3. Enable RLS on media_files table (if not already enabled)
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies to start fresh
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

-- 5. Create comprehensive policies that allow editing

-- Policy 1: Allow SELECT for all users (public read access)
CREATE POLICY "Enable read access for all users" ON media_files
    FOR SELECT USING (true);

-- Policy 2: Allow INSERT for any authenticated user
CREATE POLICY "Enable insert for authenticated users only" ON media_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow UPDATE for any authenticated user (this is the key for editing!)
CREATE POLICY "Enable update for authenticated users only" ON media_files
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow DELETE for any authenticated user
CREATE POLICY "Enable delete for authenticated users only" ON media_files
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Also fix RLS for media_categories table if it exists
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
        
        -- Create policies
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON media_categories FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Enable insert for authenticated users only" ON media_categories FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Enable update for authenticated users only" ON media_categories FOR UPDATE USING (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Enable delete for authenticated users only" ON media_categories FOR DELETE USING (auth.role() = ''authenticated'')';
        
        RAISE NOTICE 'RLS policies created for media_categories table';
    END IF;
END $$;

-- 7. Verify the RLS setup
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

-- 8. Show all policies for verification
SELECT 
    'Policy Verification' as check_type,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('media_files', 'media_categories')
ORDER BY tablename, policyname;

-- 9. Test UPDATE permission (this should work now)
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- First, insert a test record
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
        'test-edit-file.jpg',
        'test-edit-file.jpg',
        'media/test-edit-file.jpg',
        1024,
        'image/jpeg',
        'Test file for editing',
        'Test description for editing',
        ARRAY['test', 'edit'],
        true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Test record created with ID: %', test_id;
    
    -- Now test UPDATE
    UPDATE media_files 
    SET 
        alt_text = 'Updated alt text',
        description = 'Updated description',
        tags = ARRAY['test', 'edit', 'updated']
    WHERE id = test_id;
    
    RAISE NOTICE '✅ UPDATE test successful';
    
    -- Clean up test record
    DELETE FROM media_files WHERE id = test_id;
    RAISE NOTICE '✅ Test record cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;
