-- Complete Projects Table Setup for Aftek Website
-- This script creates the projects table and related functionality similar to the products system

-- Drop existing projects table if it exists (be careful with this in production)
-- DROP TABLE IF EXISTS projects CASCADE;

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'General,
  client TEXT,
  completion_date TEXT,
  project_type TEXT,
  image TEXT DEFAULT/placeholder.svg,
  gallery JSONB DEFAULT '::jsonb,
  case_study_pdf TEXT,
  features TEXT[],
  specifications JSONB DEFAULT '{}'::jsonb,
  products_used TEXT[],
  project_value TEXT,
  duration TEXT,
  challenges TEXT,
  solutions TEXT,
  results TEXT,
  testimonial TEXT,
  isActive BOOLEAN DEFAULT true,
  showInFeatured BOOLEAN DEFAULT false,
  displayOrder INTEGER DEFAULT99,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_isActive ON projects(isActive);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_showInFeatured ON projects(showInFeatured);
CREATE INDEX IF NOT EXISTS idx_projects_displayOrder ON projects(displayOrder);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate slugs automatically
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = 'THEN
        NEW.slug = lower(regexp_replace(NEW.title, [^a-zA-Z0-9\s-]', g));
        NEW.slug = regexp_replace(NEW.slug, s+-g');
        NEW.slug = regexp_replace(NEW.slug,-+-g');
        NEW.slug = trim(both- from NEW.slug);
        
        -- Ensure uniqueness by adding a number if needed
        DECLARE
            counter INTEGER := 1;
            original_slug TEXT := NEW.slug;
        BEGIN
            WHILE EXISTS (SELECT 1 FROM projects WHERE slug = NEW.slug AND id != NEW.id) LOOP
                NEW.slug = original_slug || '-' || counter;
                counter := counter + 1            END LOOP;
        END;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically generate slugs
DROP TRIGGER IF EXISTS generate_project_slug_trigger ON projects;
CREATE TRIGGER generate_project_slug_trigger
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_slug();

-- Insert sample projects (similar to the products placeholder system)
INSERT INTO projects (
  title,
  name,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  features,
  project_value,
  duration,
  challenges,
  solutions,
  results,
  isActive,
  showInFeatured,
  displayOrder
) VALUES 
(
  'Commercial Building Waterproofing',
  'commercial-building-waterproofing',
  'Complete waterproofing solution for a 20ommercial building in Bangkok. Applied advanced membrane systems and sealants to ensure long-term protection against water damage.',
  Bangkok, Thailand',
  Commercial',
  'Bangkok Commercial Properties Ltd.',
2023,
  Waterproofing',
  ARRAY[Waterproofing',Membrane Systems',Commercial Grade', 'High Traffic Areas],
  '$20.5,
18 months',
 Complex building geometry and high traffic areas requiring durable solutions',
  Implemented multi-layer waterproofing system with advanced membrane technology and specialized sealants,
  essfully completed with 100% water protection and extended building lifespan by 25years'
),
(
  'Residential Complex Foundation Repair',
residential-complex-foundation-repair',
  Structural repair and waterproofing for a 150esidential complex with foundation issues. Used advanced repair compounds and waterproofing membranes.',
  'Chiang Mai, Thailand',
  Residential',
  'Chiang Mai Housing Development',
  '2022Structural Repair',
  ARRAY[Foundation Repair', 'Structural Bonding', Waterproofing',Residential],
  '$850,
12 months',
  'Multiple foundation cracks and water infiltration issues affecting building stability',
  'Applied structural repair compounds and installed comprehensive waterproofing system',
  Restoredbuilding stability and eliminated all water infiltration issues'
),
(
  'Industrial Facility Flooring System,industrial-facility-flooring-system',
  Complete flooring system installation for a large industrial facility requiring chemical resistance and heavy load capacity.',
 Rayong, Thailand',
 Industrial',
  Rayong Industrial Park',
2023Flooring Systems',
  ARRAY['Chemical Resistant', 'Heavy Load Capacity',Industrial Grade', Epoxy Systems],
  '$1.2M,8,
  'High chemical exposure and heavy machinery loads requiring specialized flooring',
Installed multi-layer epoxy flooring system with chemical-resistant topcoat',
  Achieved chemical resistance and load capacity requirements with 15year warranty'
),
(Hotel Swimming Pool Waterproofing',
 hotel-swimming-pool-waterproofing',
  Waterproofing and sealing system for a luxury hotel swimming pool complex with multiple pools and water features.',
 Phuket, Thailand',
  Hospitality',
  'Phuket Luxury Hotels',
2022,
  Waterproofing',
  ARRAY['Pool Waterproofing', 'Sealants', Luxury Finish, lt Water Resistant],
  '$680K,6 months,
  plex pool geometry and salt water environment requiring specialized materials',
  'Applied specialized pool waterproofing membranes and salt-resistant sealants',
  'Perfect water retention with luxury finish maintained for over2
),(
  'Shopping Mall Parking Structure',
shopping-mall-parking-structure',
  Waterproofing and protective coating system for a multi-level parking structure at a major shopping mall.',
  Bangkok, Thailand',
 Commercial',
  Central Group',
  2023Parking Structures',
  ARRAY['Parking Structures', 'Protective Coatings,HighTraffic', Weather Resistant],
  '$10.8,
14,
  igh traffic volume and weather exposure requiring durable protective systems',
Installed multi-layer protective coating system with traffic-resistant topcoat',
  'Protected structure from weather damage and maintained appearance for5 years'
)
ON CONFLICT (slug) DO NOTHING;

-- Create RLS (Row Level Security) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active projects
CREATE POLICY "Public can view active projects" ON projects
  FOR SELECT USING (isActive = true);

-- Policy for authenticated users to manage all projects (admin access)
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Create a view for public projects (website display)
CREATE OR REPLACE VIEW public_projects AS
SELECT 
  id,
  title,
  slug,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  image,
  gallery,
  features,
  specifications,
  products_used,
  project_value,
  duration,
  challenges,
  solutions,
  results,
  testimonial,
  showInFeatured,
  displayOrder,
  tags,
  created_at
FROM projects 
WHERE isActive = true
ORDER BY displayOrder ASC, created_at DESC;

-- Create a view for featured projects
CREATE OR REPLACE VIEW featured_projects AS
SELECT 
  id,
  title,
  slug,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  image,
  gallery,
  features,
  specifications,
  products_used,
  project_value,
  duration,
  challenges,
  solutions,
  results,
  testimonial,
  displayOrder,
  tags,
  created_at
FROM projects 
WHERE isActive = true AND showInFeatured = true
ORDER BY displayOrder ASC, created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON public_projects TO anon;
GRANT SELECT ON featured_projects TO anon;
GRANT ALL ON projects TO authenticated;

-- Create function to get project categories
CREATE OR REPLACE FUNCTION get_project_categories()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT category 
    FROM projects 
    WHERE isActive = true 
    ORDER BY category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get project features
CREATE OR REPLACE FUNCTION get_project_features()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT unnest(features) 
    FROM projects 
    WHERE isActive = true AND features IS NOT NULL
    ORDER BY unnest(features)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search projects
CREATE OR REPLACE FUNCTION search_projects(search_term TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  location TEXT,
  category TEXT,
  client TEXT,
  completion_date TEXT,
  project_type TEXT,
  image TEXT,
  features TEXT[],
  project_value TEXT,
  duration TEXT,
  isActive BOOLEAN,
  showInFeatured BOOLEAN,
  displayOrder INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.description,
    p.location,
    p.category,
    p.client,
    p.completion_date,
    p.project_type,
    p.image,
    p.features,
    p.project_value,
    p.duration,
    p.isActive,
    p.showInFeatured,
    p.displayOrder,
    p.created_at
  FROM projects p
  WHERE p.isActive = true
    AND (
      p.title ILIKE % || search_term || '%'
      OR p.description ILIKE % || search_term || '%'
      OR p.location ILIKE % || search_term || '%'
      OR p.category ILIKE % || search_term || '%'
      OR p.client ILIKE % || search_term || '%'
      OR EXISTS (
        SELECT 1 unnest(p.features) feature 
        WHERE feature ILIKE % || search_term || %'
      )
    )
  ORDER BY p.displayOrder ASC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_project_categories() TO anon;
GRANT EXECUTE ON FUNCTION get_project_features() TO anon;
GRANT EXECUTE ON FUNCTION search_projects(TEXT) TO anon;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Projects table setup completed successfully!';
  RAISE NOTICE 'Sample projects have been inserted.';
  RAISE NOTICERLS policies and functions have been created.';
  RAISE NOTICE 'You can now use the projects system in your admin panel and website.';
END $$; 