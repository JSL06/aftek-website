-- Check if table exists and RLS policies
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'product_categories'
) as table_exists;

-- If table exists, check RLS
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_categories'
    ) THEN
        -- Check RLS status
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'product_categories';
        
        -- Check RLS policies
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'product_categories';
    ELSE
        RAISE NOTICE 'Table product_categories does not exist';
    END IF;
END $$;
