-- Update Projects Table for Multilingual Support
-- This script adds multilingual columns for all basic project information fields

-- Add multilingual columns for basic project information
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS titles JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS descriptions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS locations_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS clients_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS categories_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completion_dates_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_types_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_values_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS durations_multilingual JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gallery_captions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gallery_hotspots JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_titles ON projects USING GIN (titles);
CREATE INDEX IF NOT EXISTS idx_projects_descriptions ON projects USING GIN (descriptions);
CREATE INDEX IF NOT EXISTS idx_projects_locations_multilingual ON projects USING GIN (locations_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_clients_multilingual ON projects USING GIN (clients_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_categories_multilingual ON projects USING GIN (categories_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_completion_dates_multilingual ON projects USING GIN (completion_dates_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_project_types_multilingual ON projects USING GIN (project_types_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_project_values_multilingual ON projects USING GIN (project_values_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_durations_multilingual ON projects USING GIN (durations_multilingual);
CREATE INDEX IF NOT EXISTS idx_projects_gallery_captions ON projects USING GIN (gallery_captions);

-- Update existing projects to have default multilingual structure
UPDATE projects 
SET 
  titles = COALESCE(titles, '{}'),
  descriptions = COALESCE(descriptions, '{}'),
  locations_multilingual = COALESCE(locations_multilingual, '{}'),
  clients_multilingual = COALESCE(clients_multilingual, '{}'),
  categories_multilingual = COALESCE(categories_multilingual, '{}'),
  completion_dates_multilingual = COALESCE(completion_dates_multilingual, '{}'),
  project_types_multilingual = COALESCE(project_types_multilingual, '{}'),
  project_values_multilingual = COALESCE(project_values_multilingual, '{}'),
  durations_multilingual = COALESCE(durations_multilingual, '{}'),
  gallery_captions = COALESCE(gallery_captions, '{}'),
  gallery_hotspots = COALESCE(gallery_hotspots, '{}')
WHERE 
  titles IS NULL OR 
  descriptions IS NULL OR 
  locations_multilingual IS NULL OR 
  clients_multilingual IS NULL OR 
  categories_multilingual IS NULL OR 
  completion_dates_multilingual IS NULL OR 
  project_types_multilingual IS NULL OR 
  project_values_multilingual IS NULL OR 
  durations_multilingual IS NULL OR 
  gallery_captions IS NULL OR 
  gallery_hotspots IS NULL;

-- Migrate existing single-language data to multilingual format (English)
UPDATE projects 
SET 
  titles = jsonb_build_object('en', COALESCE(title, '')),
  descriptions = jsonb_build_object('en', COALESCE(description, '')),
  locations_multilingual = jsonb_build_object('en', COALESCE(location, '')),
  clients_multilingual = jsonb_build_object('en', COALESCE(client, '')),
  categories_multilingual = jsonb_build_object('en', COALESCE(category, '')),
  completion_dates_multilingual = jsonb_build_object('en', COALESCE(completion_date, '')),
  project_types_multilingual = jsonb_build_object('en', COALESCE(project_type, '')),
  project_values_multilingual = jsonb_build_object('en', COALESCE(project_value, '')),
  durations_multilingual = jsonb_build_object('en', COALESCE(duration, ''))
WHERE 
  (titles = '{}' OR titles IS NULL) OR
  (descriptions = '{}' OR descriptions IS NULL) OR
  (locations_multilingual = '{}' OR locations_multilingual IS NULL) OR
  (clients_multilingual = '{}' OR clients_multilingual IS NULL) OR
  (categories_multilingual = '{}' OR categories_multilingual IS NULL) OR
  (completion_dates_multilingual = '{}' OR completion_dates_multilingual IS NULL) OR
  (project_types_multilingual = '{}' OR project_types_multilingual IS NULL) OR
  (project_values_multilingual = '{}' OR project_values_multilingual IS NULL) OR
  (durations_multilingual = '{}' OR durations_multilingual IS NULL);

-- Add comments for documentation
COMMENT ON COLUMN projects.titles IS 'Multilingual project titles stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.descriptions IS 'Multilingual project descriptions stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.locations_multilingual IS 'Multilingual project locations stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.clients_multilingual IS 'Multilingual project clients stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.categories_multilingual IS 'Multilingual project categories stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.completion_dates_multilingual IS 'Multilingual project completion dates stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.project_types_multilingual IS 'Multilingual project types stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.project_values_multilingual IS 'Multilingual project values stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.durations_multilingual IS 'Multilingual project durations stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.gallery_captions IS 'Multilingual gallery captions stored as JSONB with language codes as keys';
COMMENT ON COLUMN projects.gallery_hotspots IS 'JSONB array of product hotspots for each image with coordinates and product names';

-- Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN (
  'titles', 'descriptions', 'locations_multilingual', 'clients_multilingual',
  'categories_multilingual', 'completion_dates_multilingual', 'project_types_multilingual', 
  'project_values_multilingual', 'durations_multilingual', 'gallery_captions', 'gallery_hotspots'
)
ORDER BY column_name;
