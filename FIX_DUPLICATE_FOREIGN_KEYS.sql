-- Fix Duplicate Foreign Key Constraints
-- This script removes duplicate foreign keys that are causing the articles loading error

-- Check existing foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'article_tags_junction'
ORDER BY tc.constraint_name;

-- Remove duplicate foreign key constraints
-- Keep only the one with the standard naming convention

-- Drop the duplicate constraint (keep the one with 'fk_' prefix)
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_article_id_fkey;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_tag_id_fkey;

-- Verify the remaining constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'article_tags_junction'
ORDER BY tc.constraint_name;

-- Test if articles can now be loaded
-- This should work after removing the duplicate constraints
SELECT COUNT(*) FROM articles;
