-- Create filter_options table for customizable filter options
CREATE TABLE IF NOT EXISTS filter_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_filter_options_type ON filter_options(type);
CREATE INDEX IF NOT EXISTS idx_filter_options_active ON filter_options(is_active);
CREATE INDEX IF NOT EXISTS idx_filter_options_order ON filter_options(type, display_order);

-- Create unique constraint to prevent duplicate values within the same type
CREATE UNIQUE INDEX IF NOT EXISTS idx_filter_options_unique ON filter_options(type, LOWER(value));

-- Enable Row Level Security
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active filter options" ON filter_options
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage filter options" ON filter_options
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_filter_options_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_filter_options_updated_at
  BEFORE UPDATE ON filter_options
  FOR EACH ROW
  EXECUTE FUNCTION update_filter_options_updated_at();

-- Insert some sample data
INSERT INTO filter_options (type, value, display_order, is_active) VALUES
-- Project Categories
('category', 'Infrastructure', 1, true),
('category', 'Industrial', 2, true),
('category', 'Commercial', 3, true),
('category', 'Residential', 4, true),
('category', 'High-Tech', 5, true),
('category', 'Healthcare', 6, true),
('category', 'Transportation', 7, true),
('category', 'Energy', 8, true),
('category', 'Manufacturing', 9, true),

-- Project Features
('feature', 'Waterproofing', 1, true),
('feature', 'Structural Repair', 2, true),
('feature', 'Flooring Systems', 3, true),
('feature', 'Protective Coatings', 4, true),
('feature', 'Sealants & Adhesives', 5, true),
('feature', 'Insulation', 6, true),
('feature', 'Underground Construction', 7, true),
('feature', 'Cleanroom Technology', 8, true),
('feature', 'Chemical Resistance', 9, true),
('feature', 'High Temperature', 10, true),
('feature', 'ESD Protection', 11, true),
('feature', 'Fire Resistant', 12, true),
('feature', 'Heavy Duty', 13, true),
('feature', 'High Traffic Areas', 14, true),
('feature', 'Public Transportation', 15, true),
('feature', 'Industrial Equipment', 16, true),
('feature', 'Architectural Finishes', 17, true),
('feature', 'Environmental Protection', 18, true),

-- Project Locations
('location', 'Taipei', 1, true),
('location', 'New Taipei', 2, true),
('location', 'Taoyuan', 3, true),
('location', 'Taichung', 4, true),
('location', 'Tainan', 5, true),
('location', 'Kaohsiung', 6, true),
('location', 'Hsinchu', 7, true),
('location', 'Miaoli', 8, true),
('location', 'Changhua', 9, true),
('location', 'Nantou', 10, true),
('location', 'Yunlin', 11, true),
('location', 'Chiayi', 12, true),
('location', 'Pingtung', 13, true),
('location', 'Yilan', 14, true),
('location', 'Hualien', 15, true),
('location', 'Taitung', 16, true),
('location', 'Penghu', 17, true),
('location', 'Kinmen', 18, true),
('location', 'Lienchiang', 19, true),

-- Project Types
('project_type', 'New Construction', 1, true),
('project_type', 'Renovation', 2, true),
('project_type', 'Retrofit', 3, true),
('project_type', 'Maintenance', 4, true),
('project_type', 'Repair', 5, true),
('project_type', 'Upgrade', 6, true),
('project_type', 'Expansion', 7, true),
('project_type', 'Modernization', 8, true),
('project_type', 'Restoration', 9, true),
('project_type', 'Rehabilitation', 10, true)
ON CONFLICT (type, LOWER(value)) DO NOTHING;

-- Verify the table was created
SELECT 'filter_options table created successfully' as status; 