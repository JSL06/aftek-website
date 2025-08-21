-- FIX_MEDIA_RLS.sql
-- This script fixes the Row-Level Security policies for the media_files table

-- 1. Enable RLS on media_files table if not already enabled
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access" ON media_files;
DROP POLICY IF EXISTS "Authenticated users can insert" ON media_files;
DROP POLICY IF EXISTS "Users can update own uploads" ON media_files;
DROP POLICY IF EXISTS "Users can delete own uploads" ON media_files;
DROP POLICY IF EXISTS "Admin full access" ON media_files;

-- 3. Create RLS policies for media_files table

-- Policy 1: Public read access for public files
CREATE POLICY "Public read access" ON media_files
    FOR SELECT USING (is_public = true);

-- Policy 2: Authenticated users can insert new files
CREATE POLICY "Authenticated users can insert" ON media_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Users can update their own uploads
CREATE POLICY "Users can update own uploads" ON media_files
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Policy 4: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON media_files
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Policy 5: Admin full access (for superuser/admin operations)
CREATE POLICY "Admin full access" ON media_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email IN ('admin@aftek.com', 'justin.liao@aftek.com')
        )
    );

-- 4. Also fix RLS for media_categories table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_categories') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY';
        
        -- Drop existing policies
        EXECUTE 'DROP POLICY IF EXISTS "Public read access" ON media_categories';
        EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON media_categories';
        
        -- Create policies
        EXECUTE 'CREATE POLICY "Public read access" ON media_categories FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Admin full access" ON media_categories FOR ALL USING (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND email IN (''admin@aftek.com'', ''justin.liao@aftek.com'')
            )
        )';
        
        RAISE NOTICE 'RLS policies created for media_categories table';
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
