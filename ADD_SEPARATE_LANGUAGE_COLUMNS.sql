-- ADD_SEPARATE_LANGUAGE_COLUMNS.sql
-- This script adds separate columns for each language instead of using JSONB fields

-- 1. Add separate language columns for titles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_zh_hant TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_ja TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_ko TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_th TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_vi TEXT;

-- 2. Add separate language columns for excerpts
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_en TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_zh_hant TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_ja TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_ko TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_th TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt_vi TEXT;

-- 3. Add separate language columns for authors
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_en TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_zh_hant TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_ja TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_ko TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_th TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_vi TEXT;

-- 4. Add separate language columns for categories
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_en TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_zh_hant TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_ja TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_ko TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_th TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_vi TEXT;

-- 5. Add separate language columns for content blocks
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_en JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_zh_hant JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_ja JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_ko JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_th JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_blocks_vi JSONB;

-- 6. Set default values for existing records
UPDATE articles SET 
    title_en = COALESCE(titles->>'en', ''),
    title_zh_hant = COALESCE(titles->>'zh-Hant', ''),
    title_ja = COALESCE(titles->>'ja', ''),
    title_ko = COALESCE(titles->>'ko', ''),
    title_th = COALESCE(titles->>'th', ''),
    title_vi = COALESCE(titles->>'vi', '')
WHERE titles IS NOT NULL;

UPDATE articles SET 
    excerpt_en = COALESCE(excerpts->>'en', ''),
    excerpt_zh_hant = COALESCE(excerpts->>'zh-Hant', ''),
    excerpt_ja = COALESCE(excerpts->>'ja', ''),
    excerpt_ko = COALESCE(excerpts->>'ko', ''),
    excerpt_th = COALESCE(excerpts->>'th', ''),
    excerpt_vi = COALESCE(excerpts->>'vi', '')
WHERE excerpts IS NOT NULL;

UPDATE articles SET 
    author_en = COALESCE(authors_multilingual->>'en', ''),
    author_zh_hant = COALESCE(authors_multilingual->>'zh-Hant', ''),
    author_ja = COALESCE(authors_multilingual->>'ja', ''),
    author_ko = COALESCE(authors_multilingual->>'ko', ''),
    author_th = COALESCE(authors_multilingual->>'th', ''),
    author_vi = COALESCE(authors_multilingual->>'vi', '')
WHERE authors_multilingual IS NOT NULL;

UPDATE articles SET 
    category_en = COALESCE(categories_multilingual->>'en', ''),
    category_zh_hant = COALESCE(categories_multilingual->>'zh-Hant', ''),
    category_ja = COALESCE(categories_multilingual->>'ja', ''),
    category_ko = COALESCE(categories_multilingual->>'ko', ''),
    category_th = COALESCE(categories_multilingual->>'th', ''),
    category_vi = COALESCE(categories_multilingual->>'vi', '')
WHERE categories_multilingual IS NOT NULL;

UPDATE articles SET 
    content_blocks_en = COALESCE(content_blocks, '[]'::jsonb),
    content_blocks_zh_hant = COALESCE(content_blocks, '[]'::jsonb),
    content_blocks_ja = COALESCE(content_blocks, '[]'::jsonb),
    content_blocks_ko = COALESCE(content_blocks, '[]'::jsonb),
    content_blocks_th = COALESCE(content_blocks, '[]'::jsonb),
    content_blocks_vi = COALESCE(content_blocks, '[]'::jsonb)
WHERE content_blocks IS NOT NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_title_en ON articles(title_en);
CREATE INDEX IF NOT EXISTS idx_articles_title_zh_hant ON articles(title_zh_hant);
CREATE INDEX IF NOT EXISTS idx_articles_title_ja ON articles(title_ja);
CREATE INDEX IF NOT EXISTS idx_articles_title_ko ON articles(title_ko);
CREATE INDEX IF NOT EXISTS idx_articles_title_th ON articles(title_th);
CREATE INDEX IF NOT EXISTS idx_articles_title_vi ON articles(title_vi);

CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_en ON articles USING GIN(content_blocks_en);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_zh_hant ON articles USING GIN(content_blocks_zh_hant);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_ja ON articles USING GIN(content_blocks_ja);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_ko ON articles USING GIN(content_blocks_ko);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_th ON articles USING GIN(content_blocks_th);
CREATE INDEX IF NOT EXISTS idx_articles_content_blocks_vi ON articles USING GIN(content_blocks_vi);

-- 8. Verify the new structure
SELECT 
    id,
    slug,
    title_en,
    title_zh_hant,
    title_ja,
    title_ko,
    title_th,
    title_vi,
    excerpt_en,
    excerpt_zh_hant,
    excerpt_ja,
    excerpt_ko,
    excerpt_th,
    excerpt_vi,
    author_en,
    author_zh_hant,
    author_ja,
    author_ko,
    author_th,
    author_vi,
    category_en,
    category_zh_hant,
    category_ja,
    category_ko,
    category_th,
    category_vi,
    jsonb_typeof(content_blocks_en) as content_blocks_en_type,
    jsonb_typeof(content_blocks_zh_hant) as content_blocks_zh_hant_type,
    jsonb_typeof(content_blocks_ja) as content_blocks_ja_type,
    jsonb_typeof(content_blocks_ko) as content_blocks_ko_type,
    jsonb_typeof(content_blocks_th) as content_blocks_th_type,
    jsonb_typeof(content_blocks_vi) as content_blocks_vi_type
FROM articles
LIMIT 3;

-- 9. Show column information
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'articles' 
AND column_name LIKE '%_en' 
   OR column_name LIKE '%_zh_hant'
   OR column_name LIKE '%_ja'
   OR column_name LIKE '%_ko'
   OR column_name LIKE '%_th'
   OR column_name LIKE '%_vi'
ORDER BY column_name;
