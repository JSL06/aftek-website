-- Add Missing Columns for Projects Table
-- This script adds the missing completion_dates_multilingual column and updates gallery_captions

-- Add the missing completion_dates_multilingual column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS completion_dates_multilingual JSONB DEFAULT '{}';

-- Update gallery_captions from TEXT[] to JSONB if it exists as TEXT[]
DO $$
BEGIN
    -- Check if gallery_captions column exists and is TEXT[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'gallery_captions' 
        AND data_type = 'ARRAY'
    ) THEN
        -- Create a backup column
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_captions_backup TEXT[];
        
        -- Copy data to backup
        UPDATE projects SET gallery_captions_backup = gallery_captions::TEXT[];
        
        -- Drop the old column
        ALTER TABLE projects DROP COLUMN gallery_captions;
        
        -- Add the new JSONB column
        ALTER TABLE projects ADD COLUMN gallery_captions JSONB DEFAULT '{}';
        
        -- Migrate existing data to new format (assuming English captions)
        UPDATE projects 
        SET gallery_captions = jsonb_build_object('en', gallery_captions_backup)
        WHERE gallery_captions_backup IS NOT NULL AND array_length(gallery_captions_backup, 1) > 0;
        
        -- Drop the backup column
        ALTER TABLE projects DROP COLUMN gallery_captions_backup;
    END IF;
END $$;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_projects_completion_dates_multilingual ON projects USING GIN (completion_dates_multilingual);

-- Update existing projects to have default multilingual structure for completion dates
UPDATE projects 
SET completion_dates_multilingual = COALESCE(completion_dates_multilingual, '{}')
WHERE completion_dates_multilingual IS NULL;

-- Migrate existing completion_date data to multilingual format (English)
UPDATE projects 
SET completion_dates_multilingual = jsonb_build_object('en', COALESCE(completion_date, ''))
WHERE (completion_dates_multilingual = '{}' OR completion_dates_multilingual IS NULL)
AND completion_date IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN projects.completion_dates_multilingual IS 'Multilingual project completion dates stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.gallery_captions IS 'Multilingual gallery captions stored as JSONB with language codes as keys';

-- Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN (
  'completion_dates_multilingual', 'gallery_captions'
)
ORDER BY column_name;
