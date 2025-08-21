-- FIX_PAGE_ID_COLUMN.sql
-- This script fixes the page_id saving issue

-- 1. Check current table structure
SELECT
    'Current Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'media_files'
ORDER BY ordinal_position;

-- 2. Ensure page_id column exists and is properly configured
DO $$
BEGIN
    -- Check if page_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'page_id'
    ) THEN
        RAISE NOTICE '✅ page_id column exists';
        
        -- Check the data type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'media_files' 
            AND column_name = 'page_id' 
            AND data_type = 'text'
        ) THEN
            RAISE NOTICE '✅ page_id column is TEXT type (correct)';
        ELSE
            RAISE NOTICE '⚠️ page_id column is not TEXT type - changing it...';
            
            -- Drop dependent views first
            IF EXISTS (
                SELECT 1 FROM pg_class c 
                JOIN pg_namespace n ON c.relnamespace = n.oid 
                WHERE c.relname = 'media_library_view' AND c.relkind = 'v'
            ) THEN
                EXECUTE 'DROP VIEW IF EXISTS media_library_view CASCADE';
                RAISE NOTICE '✅ Dropped media_library_view to allow column type change';
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM pg_class c 
                JOIN pg_namespace n ON c.relnamespace = n.oid 
                WHERE c.relname = 'page_backgrounds_view' AND c.relkind = 'v'
            ) THEN
                EXECUTE 'DROP VIEW IF EXISTS page_backgrounds_view CASCADE';
                RAISE NOTICE '✅ Dropped page_backgrounds_view to allow column type change';
            END IF;
            
            -- Drop foreign key constraints first
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'media_files_category_id_fkey' 
                AND table_name = 'media_files'
            ) THEN
                EXECUTE 'ALTER TABLE media_files DROP CONSTRAINT media_files_category_id_fkey';
                RAISE NOTICE '✅ Dropped foreign key constraint media_files_category_id_fkey';
            END IF;
            
            -- Change the column type from UUID to TEXT
            EXECUTE 'ALTER TABLE media_files ALTER COLUMN page_id TYPE TEXT USING page_id::TEXT';
            RAISE NOTICE '✅ Changed page_id column from UUID to TEXT type';
            
            -- Recreate the views
            EXECUTE 'CREATE OR REPLACE VIEW media_library_view AS SELECT * FROM media_files';
            RAISE NOTICE '✅ Recreated media_library_view';
            
            EXECUTE 'CREATE OR REPLACE VIEW page_backgrounds_view AS SELECT * FROM page_backgrounds';
            RAISE NOTICE '✅ Recreated page_backgrounds_view';
        END IF;
        
        -- Check if it's nullable (should be)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'media_files' 
            AND column_name = 'page_id' 
            AND is_nullable = 'YES'
        ) THEN
            RAISE NOTICE '✅ page_id column is nullable (correct)';
        ELSE
            RAISE NOTICE '⚠️ page_id column is not nullable - making it nullable';
            EXECUTE 'ALTER TABLE media_files ALTER COLUMN page_id DROP NOT NULL';
        END IF;
    ELSE
        RAISE NOTICE '❌ page_id column does not exist - creating it';
        EXECUTE 'ALTER TABLE media_files ADD COLUMN page_id TEXT';
        RAISE NOTICE '✅ Created page_id column as TEXT type';
    END IF;
END $$;

-- 3. Test updating an existing record with page_id
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Get the first media file to test with
    SELECT id INTO test_id FROM media_files LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Update the first record with a page_id
        UPDATE media_files
        SET page_id = 'home', description = 'Test update with page_id'
        WHERE id = test_id;
        
        RAISE NOTICE '✅ Updated record % with page_id = home', test_id;
        
        -- Verify the update
        IF EXISTS (
            SELECT 1 FROM media_files 
            WHERE id = test_id AND page_id = 'home'
        ) THEN
            RAISE NOTICE '✅ page_id update verified successfully';
        ELSE
            RAISE NOTICE '❌ page_id update verification failed';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No media files found to test with';
    END IF;
END $$;

-- 4. Show final table structure
SELECT
    'Final Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'media_files'
ORDER BY ordinal_position;

-- 5. Show current data with page_id
SELECT
    'Current Data' as check_type,
    id,
    filename,
    page_id,
    description,
    created_at
FROM media_files
ORDER BY created_at DESC
LIMIT 10;
