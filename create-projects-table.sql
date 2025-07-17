-- Create projects table for Aftek website
-- This table stores all project information for both admin management and public display

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- Display title for the project
  slug TEXT UNIQUE, -- SEO-friendly URL slug
  description TEXT,
  location TEXT,
  category TEXT NOT NULL,
  client TEXT,
  completion_date TEXT, -- Year or date when project was completed
  project_type TEXT, -- Type of construction/project
  image TEXT, -- Main project image URL
  gallery JSONB, -- Array of image URLs for project gallery
  case_study_pdf TEXT, -- URL to case study PDF
  features TEXT[], -- Array of features/technologies used
  specifications JSONB, -- Technical specifications as key-value pairs
  products_used TEXT[], -- Array of product names/IDs used in project
  project_value TEXT, -- Project value/budget (optional)
  duration TEXT, -- Project duration
  challenges TEXT, -- Project challenges faced
  solutions TEXT, -- Solutions implemented
  results TEXT, -- Project results/outcomes
  testimonial TEXT, -- Client testimonial
  isActive BOOLEAN DEFAULT true, -- Whether to show on website
  showInFeatured BOOLEAN DEFAULT false, -- Whether to show in featured projects
  displayOrder INTEGER DEFAULT 99, -- Display order (lower = higher priority)
  tags TEXT[], -- Searchable tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(isActive);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(showInFeatured);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(displayOrder);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to active projects" ON projects
  FOR SELECT USING (isActive = true);

-- Create policies for authenticated admin access
CREATE POLICY "Allow authenticated full access to projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample projects
INSERT INTO projects (
  name,
  title,
  description,
  location,
  category,
  client,
  completion_date,
  project_type,
  image,
  features,
  specifications,
  products_used,
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
  'taipei-metro-extension',
  'Taipei Metro Extension',
  'Major metro extension project featuring advanced waterproofing and sealing solutions for subway tunnel construction. This project showcased our expertise in underground construction materials.',
  'Taipei, Taiwan',
  'Infrastructure',
  'Taipei Metro Corporation',
  '2023',
  'Transportation Infrastructure',
  '/placeholder.svg',
  ARRAY['Waterproofing', 'Underground Construction', 'Public Transportation', 'Tunnel Sealing'],
  '{"tunnel_length": "15 km", "stations": "8", "depth": "25-35 meters", "waterproofing_area": "50000 sqm"}',
  ARRAY['FlexPro PU Sealant', 'AquaShield Membrane', 'StructuralBond Adhesive'],
  '$850 Million USD',
  '36 months',
  'Complex underground waterproofing in high water table areas, extreme precision requirements for public transportation safety.',
  'Implemented advanced polyurethane injection systems and high-performance membranes designed for 50-year service life.',
  'Zero water infiltration after 2 years of operation, passed all safety certifications, 15% under budget completion.',
  true,
  true,
  1
),
(
  'industrial-complex-renovation',
  'Industrial Complex Renovation',
  'Large-scale industrial facility renovation featuring structural repair and protective coating applications for heavy manufacturing environment.',
  'Kaohsiung, Taiwan',
  'Industrial',
  'Taiwan Steel Corporation',
  '2023',
  'Industrial Renovation',
  '/placeholder.svg',
  ARRAY['Structural Repair', 'Chemical Resistance', 'Heavy Duty Coatings', 'Industrial Flooring'],
  '{"area": "125000 sqm", "buildings": "12", "crane_capacity": "500 tons", "chemical_exposure": "High"}',
  ARRAY['EpoxyPro Industrial Coating', 'ChemResist Floor System', 'StructuralFix Repair Mortar'],
  '$45 Million USD',
  '18 months',
  'Working in active production environment, chemical resistance requirements, heavy machinery operations.',
  'Phased renovation approach with specialized chemical-resistant materials and rapid-cure systems for minimal downtime.',
  'Achieved 99.2% uptime during renovation, exceeded chemical resistance specifications, extended facility life by 25 years.',
  true,
  true,
  2
),
(
  'shopping-mall-construction',
  'Shopping Mall Construction',
  'Modern shopping mall construction featuring advanced flooring systems and architectural sealants installation for high-traffic commercial space.',
  'Taichung, Taiwan',
  'Commercial',
  'Pacific Mall Development',
  '2022',
  'Commercial Construction',
  '/placeholder.svg',
  ARRAY['Commercial Flooring', 'Architectural Sealants', 'High Traffic Areas', 'Aesthetic Finishes'],
  '{"total_area": "85000 sqm", "floors": "6", "stores": "280", "parking_spaces": "2500"}',
  ARRAY['CommercialFloor Pro', 'AestheticSeal Clear', 'TrafficGuard Coating'],
  '$180 Million USD',
  '24 months',
  'High aesthetic standards, durability for heavy foot traffic, complex architectural details.',
  'Premium flooring systems with integrated slip resistance and stain protection, precision sealant application.',
  'LEED Gold certification, zero maintenance issues in first year, 20% higher foot traffic than projected.',
  true,
  false,
  3
),
(
  'semiconductor-facility',
  'Semiconductor Facility',
  'State-of-the-art semiconductor manufacturing facility featuring cleanroom flooring and specialized sealant solutions for ultra-clean environment.',
  'Hsinchu, Taiwan',
  'High-Tech',
  'Taiwan Semiconductor Manufacturing',
  '2022',
  'High-Tech Manufacturing',
  '/placeholder.svg',
  ARRAY['Cleanroom Technology', 'ESD Protection', 'Chemical Purity', 'Precision Installation'],
  '{"cleanroom_class": "ISO 5", "area": "25000 sqm", "production_lines": "4", "contamination_target": "<0.1 ppb"}',
  ARRAY['CleanRoom Floor System', 'PuritySeal ESD', 'UltraClean Adhesive'],
  '$320 Million USD',
  '30 months',
  'Extreme cleanliness requirements, ESD protection, zero outgassing materials, nanometer precision.',
  'Specialized cleanroom installation protocols, certified materials with full traceability, continuous monitoring.',
  'Achieved ISO 5 cleanroom certification, zero contamination incidents, 15% yield improvement over industry standard.',
  true,
  true,
  4
);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to automatically generate slug from title
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_projects_slug 
    BEFORE INSERT OR UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_project_slug(); 