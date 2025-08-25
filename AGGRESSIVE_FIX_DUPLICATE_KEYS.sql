-- AGGRESSIVE FIX: Remove ALL foreign key constraints and recreate them cleanly
-- This will completely eliminate the duplicate constraint issue

-- Step 1: Check current state
SELECT 'Current foreign key constraints:' as info;
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

-- Step 2: Remove ALL foreign key constraints from article_tags_junction
SELECT 'Removing all foreign key constraints...' as info;

-- Remove all possible constraint names
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_article_id_fkey;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_tag_id_fkey;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS fk_article_tags_junction_article_id;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS fk_article_tags_junction_tag_id;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_article_id_fkey;
ALTER TABLE article_tags_junction DROP CONSTRAINT IF EXISTS article_tags_junction_tag_id_fkey;

-- Step 3: Verify all constraints are removed
SELECT 'After removal - should be empty:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'article_tags_junction';

-- Step 4: Recreate foreign key constraints cleanly
SELECT 'Recreating foreign key constraints...' as info;

-- Add article_id foreign key
ALTER TABLE article_tags_junction 
ADD CONSTRAINT fk_article_tags_junction_article_id 
FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

-- Add tag_id foreign key
ALTER TABLE article_tags_junction 
ADD CONSTRAINT fk_article_tags_junction_tag_id 
FOREIGN KEY (tag_id) REFERENCES article_tags(id) ON DELETE CASCADE;

-- Step 5: Verify final state
SELECT 'Final state - should show 2 constraints:' as info;
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

-- Step 6: Test if articles can now be loaded
SELECT 'Testing articles table access...' as info;
SELECT COUNT(*) as article_count FROM articles;
SELECT COUNT(*) as tag_count FROM article_tags;
SELECT COUNT(*) as junction_count FROM article_tags_junction;

-- Step 7: Test the specific query that was failing
SELECT 'Testing the problematic query...' as info;
SELECT 
    a.id,
    a.slug,
    a.titles,
    COUNT(atj.tag_id) as tag_count
FROM articles a
LEFT JOIN article_tags_junction atj ON a.id = atj.article_id
GROUP BY a.id, a.slug, a.titles
LIMIT 5;
