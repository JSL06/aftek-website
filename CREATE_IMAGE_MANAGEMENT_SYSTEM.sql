-- CREATE_IMAGE_MANAGEMENT_SYSTEM.sql
-- This script creates a comprehensive image management system for the AFTEK website
-- Includes media library, page background variables, and storage monitoring

-- 1. Create media_files table for the media library
CREATE TABLE IF NOT EXISTS media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    description TEXT,
    tags TEXT[],
    uploaded_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.1 Add missing columns if they don't exist (for existing databases)
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'width'
    ) THEN
        ALTER TABLE media_files ADD COLUMN width INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'height'
    ) THEN
        ALTER TABLE media_files ADD COLUMN height INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'alt_text'
    ) THEN
        ALTER TABLE media_files ADD COLUMN alt_text TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE media_files ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE media_files ADD COLUMN tags TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE media_files ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE media_files ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create page_backgrounds table for managing background images per page
CREATE TABLE IF NOT EXISTS page_backgrounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_identifier VARCHAR(100) UNIQUE NOT NULL,
    page_name VARCHAR(255) NOT NULL,
    background_image_id UUID REFERENCES media_files(id),
    background_image_url VARCHAR(500),
    background_position VARCHAR(50) DEFAULT 'center center',
    background_size VARCHAR(50) DEFAULT 'cover',
    background_repeat VARCHAR(20) DEFAULT 'no-repeat',
    background_attachment VARCHAR(20) DEFAULT 'scroll',
    overlay_color VARCHAR(20),
    overlay_opacity DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1 Add missing columns if they don't exist (for existing databases)
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'background_image_id'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN background_image_id UUID REFERENCES media_files(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'overlay_color'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN overlay_color VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'overlay_opacity'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN overlay_opacity DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Create storage_usage table for monitoring Supabase storage
CREATE TABLE IF NOT EXISTS storage_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_name VARCHAR(100) UNIQUE NOT NULL,
    total_size BIGINT NOT NULL,
    file_count INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create storage_quotas table for managing storage limits
CREATE TABLE IF NOT EXISTS storage_quotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_name VARCHAR(100) UNIQUE NOT NULL,
    max_size BIGINT NOT NULL,
    quota_type VARCHAR(50) DEFAULT 'free',
    warning_threshold DECIMAL(3,2) DEFAULT 0.8,
    critical_threshold DECIMAL(3,2) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.1 Add missing quota_type column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_quotas' 
        AND column_name = 'quota_type'
    ) THEN
        ALTER TABLE storage_quotas ADD COLUMN quota_type VARCHAR(50) DEFAULT 'free';
    END IF;
END $$;

-- 5. Create media_categories table for organizing media files
CREATE TABLE IF NOT EXISTS media_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES media_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add category_id to media_files table
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES media_categories(id);

-- 6.1 Add missing category_id column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE media_files ADD COLUMN category_id UUID REFERENCES media_categories(id);
    END IF;
END $$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_category_id ON media_files(category_id);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_page_backgrounds_page_identifier ON page_backgrounds(page_identifier);
CREATE INDEX IF NOT EXISTS idx_storage_usage_bucket_name ON storage_usage(bucket_name);

-- 8. Insert default storage quotas (Supabase free tier: 1GB)
-- First, ensure the quota_type column exists and has default values
UPDATE storage_quotas SET quota_type = 'free' WHERE quota_type IS NULL;

INSERT INTO storage_quotas (bucket_name, max_size, quota_type, warning_threshold, critical_threshold) 
VALUES 
    ('media', 1073741824, 'free', 0.8, 0.95), -- 1GB with 80% warning and 95% critical
    ('avatars', 52428800, 'free', 0.8, 0.95)  -- 50MB for avatars
ON CONFLICT (bucket_name) DO UPDATE SET
    max_size = EXCLUDED.max_size,
    quota_type = EXCLUDED.quota_type,
    warning_threshold = EXCLUDED.warning_threshold,
    critical_threshold = EXCLUDED.critical_threshold,
    updated_at = NOW();

-- 9. Insert default page backgrounds for main pages
-- First, ensure all required columns exist
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'overlay_color'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN overlay_color VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_backgrounds' 
        AND column_name = 'overlay_opacity'
    ) THEN
        ALTER TABLE page_backgrounds ADD COLUMN overlay_opacity DECIMAL(3,2) DEFAULT 0.0;
    END IF;
END $$;

INSERT INTO page_backgrounds (page_identifier, page_name, background_position, background_size, background_repeat, background_attachment, background_image_url) 
VALUES 
    ('home', 'Home Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/hero-aftek-construction.jpg'),
    ('about', 'About Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('products', 'Products Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('projects', 'Projects Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('articles', 'Articles Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('contact', 'Contact Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('media', 'Media Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('guide', 'Guide Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('resources', 'Resources Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('case-studies', 'Case Studies Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('article-detail', 'Article Detail Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('not-found', '404 Not Found Page', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580.jpg'),
    ('admin-dashboard', 'Admin Dashboard', 'center center', 'cover', 'no-repeat', 'scroll', NULL),
    ('global-body', 'Global Body Background', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/17580-CpV1zFPk.jpg'),
    ('page-title', 'Page Title Section Background', 'center center', 'cover', 'no-repeat', 'fixed', '/aftek-website/assets/pexels-pixabay-159306.png')
ON CONFLICT (page_identifier) DO UPDATE SET
    page_name = EXCLUDED.page_name,
    background_position = EXCLUDED.background_position,
    background_size = EXCLUDED.background_size,
    background_repeat = EXCLUDED.background_repeat,
    background_attachment = EXCLUDED.background_attachment,
    background_image_url = EXCLUDED.background_image_url,
    updated_at = NOW();

-- 10. Insert default media categories
INSERT INTO media_categories (name, description) 
VALUES 
    ('Backgrounds', 'Background images for pages'),
    ('Product Images', 'Product photos and graphics'),
    ('Company Photos', 'Company events, team, and facilities'),
    ('Documents', 'PDFs and other documents'),
    ('Logos', 'Company and partner logos'),
    ('Icons', 'UI icons and graphics');

-- 11. Create RLS policies for media_files table
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public media files are viewable by everyone" ON media_files;
DROP POLICY IF EXISTS "Users can upload media files" ON media_files;
DROP POLICY IF EXISTS "Users can update own media files" ON media_files;
DROP POLICY IF EXISTS "Users can delete own media files" ON media_files;

-- Allow public read access to public media files
CREATE POLICY "Public media files are viewable by everyone" ON media_files
    FOR SELECT USING (is_public = true);

-- Allow authenticated users to upload media files
CREATE POLICY "Users can upload media files" ON media_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own media files
CREATE POLICY "Users can update own media files" ON media_files
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Allow users to delete their own media files
CREATE POLICY "Users can delete own media files" ON media_files
    FOR DELETE USING (auth.uid() = uploaded_by);

-- 12. Create RLS policies for page_backgrounds table
ALTER TABLE page_backgrounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Page backgrounds are viewable by everyone" ON page_backgrounds;
DROP POLICY IF EXISTS "Authenticated users can manage page backgrounds" ON page_backgrounds;

-- Allow public read access to page backgrounds
CREATE POLICY "Page backgrounds are viewable by everyone" ON page_backgrounds
    FOR SELECT USING (true);

-- Allow authenticated users to manage page backgrounds
CREATE POLICY "Authenticated users can manage page backgrounds" ON page_backgrounds
    FOR ALL USING (auth.role() = 'authenticated');

-- 13. Create function to update storage usage
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS trigger_update_storage_usage ON media_files;

-- Then drop the existing function if it exists (to handle signature changes)
DROP FUNCTION IF EXISTS update_storage_usage();

CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update storage_usage table when media files are added/removed
    IF TG_OP = 'INSERT' THEN
        INSERT INTO storage_usage (bucket_name, total_size, file_count)
        VALUES ('media', NEW.file_size, 1)
        ON CONFLICT (bucket_name) 
        DO UPDATE SET 
            total_size = storage_usage.total_size + NEW.file_size,
            file_count = storage_usage.file_count + 1,
            last_updated = NOW();
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE storage_usage 
        SET 
            total_size = total_size - OLD.file_size,
            file_count = file_count - 1,
            last_updated = NOW()
        WHERE bucket_name = 'media';
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE storage_usage 
        SET 
            total_size = total_size - OLD.file_size + NEW.file_size,
            last_updated = NOW()
        WHERE bucket_name = 'media';
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 14. Create trigger for storage usage updates
CREATE TRIGGER trigger_update_storage_usage
    AFTER INSERT OR UPDATE OR DELETE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_storage_usage();

-- 15. Create function to check storage quota
-- Drop existing function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS check_storage_quota(TEXT);
DROP FUNCTION IF EXISTS check_storage_quota();

CREATE OR REPLACE FUNCTION check_storage_quota(bucket_name_param TEXT)
RETURNS TABLE(
    bucket_name TEXT,
    total_size BIGINT,
    file_count INTEGER,
    max_size BIGINT,
    quota_type TEXT,
    usage_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        su.bucket_name::TEXT,
        su.total_size,
        su.file_count,
        sq.max_size,
        sq.quota_type::TEXT,
        CASE 
            WHEN sq.max_size > 0 THEN 
                ROUND((su.total_size::NUMERIC / sq.max_size::NUMERIC) * 100, 2)
            ELSE 0 
        END as usage_percentage
    FROM storage_usage su
    LEFT JOIN storage_quotas sq ON su.bucket_name = sq.bucket_name
    WHERE su.bucket_name = bucket_name_param;
END;
$$ LANGUAGE plpgsql;

-- 16. Create view for media library with category information
DROP VIEW IF EXISTS media_library_view;
CREATE OR REPLACE VIEW media_library_view AS
SELECT 
    mf.id,
    mf.filename,
    mf.original_filename,
    mf.file_path,
    mf.file_size,
    mf.mime_type,
    mf.width,
    mf.height,
    mf.alt_text,
    mf.description,
    mf.tags,
    mf.is_public,
    mf.created_at,
    mf.updated_at,
    mc.name as category_name,
    mc.description as category_description,
    au.email as uploaded_by_email,
    pg_size_pretty(mf.file_size) as file_size_pretty
FROM media_files mf
LEFT JOIN media_categories mc ON mf.category_id = mc.id
LEFT JOIN auth.users au ON mf.uploaded_by = au.id;

-- 17. Create view for page backgrounds with media information
DROP VIEW IF EXISTS page_backgrounds_view;
CREATE OR REPLACE VIEW page_backgrounds_view AS
SELECT 
    pb.id,
    pb.page_identifier,
    pb.page_name,
    pb.background_image_id,
    pb.background_image_url,
    pb.background_position,
    pb.background_size,
    pb.background_repeat,
    pb.background_attachment,
    pb.overlay_color,
    pb.overlay_opacity,
    pb.created_at,
    pb.updated_at,
    mf.filename as image_filename,
    mf.file_path as image_file_path,
    mf.alt_text as image_alt_text
FROM page_backgrounds pb
LEFT JOIN media_files mf ON pb.background_image_id = mf.id;

-- 18. Grant necessary permissions
GRANT SELECT ON media_library_view TO anon, authenticated;
GRANT SELECT ON page_backgrounds_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_storage_quota(TEXT) TO anon, authenticated;

-- 19. Insert initial storage usage record
INSERT INTO storage_usage (bucket_name, total_size, file_count)
VALUES ('media', 0, 0)
ON CONFLICT (bucket_name) DO NOTHING;

-- Script completed successfully!
-- The image management system is now set up with:
-- - Media library with file upload and management
-- - Page background variables for each page
-- - Storage monitoring and quota management
-- - RLS policies for security
-- - Views for easy data access
