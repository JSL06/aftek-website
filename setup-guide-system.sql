-- Setup Guide System Database Tables
-- This script creates the necessary tables for managing interactive building guide hotspots

-- Create guide_facilities table
CREATE TABLE IF NOT EXISTS guide_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    value TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'Building2',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide_hotspots table
CREATE TABLE IF NOT EXISTS guide_hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    category TEXT,
    description TEXT,
    x INTEGER NOT NULL CHECK (x >= 0 AND x <= 100),
    y INTEGER NOT NULL CHECK (y >= 0 AND y <= 100),
    facility_type TEXT NOT NULL,
    product_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (facility_type) REFERENCES guide_facilities(value) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_facility_type ON guide_hotspots(facility_type);
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_category ON guide_hotspots(category);
CREATE INDEX IF NOT EXISTS idx_guide_facilities_value ON guide_facilities(value);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_guide_facilities_updated_at ON guide_facilities;
CREATE TRIGGER update_guide_facilities_updated_at
    BEFORE UPDATE ON guide_facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guide_hotspots_updated_at ON guide_hotspots;
CREATE TRIGGER update_guide_hotspots_updated_at
    BEFORE UPDATE ON guide_hotspots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default facilities
INSERT INTO guide_facilities (name, value, icon, is_active) VALUES
    ('Residential Building', 'residential', 'Home', true),
    ('Commercial Building', 'commercial', 'Building2', true),
    ('Industrial Facility', 'industrial', 'Factory', true),
    ('Infrastructure Project', 'infrastructure', 'Building2', true)
ON CONFLICT (value) DO NOTHING;

-- Insert sample hotspots for residential buildings
INSERT INTO guide_hotspots (label, category, description, x, y, facility_type, product_ids) VALUES
    ('Foundation', 'Waterproofing', 'Waterproofing and structural protection', 50, 80, 'residential', ARRAY[]::text[]),
    ('Walls', 'Sealants & Adhesives', 'Protective coatings and finishes', 30, 40, 'residential', ARRAY[]::text[]),
    ('Roof', 'Waterproofing', 'Waterproofing and insulation systems', 70, 20, 'residential', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Insert sample hotspots for commercial buildings
INSERT INTO guide_hotspots (label, category, description, x, y, facility_type, product_ids) VALUES
    ('Parking Structure', 'Flooring', 'Durable flooring for high-traffic areas', 60, 70, 'commercial', ARRAY[]::text[]),
    ('Building Facade', 'Sealants & Adhesives', 'Weather-resistant facade systems', 20, 30, 'commercial', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Insert sample hotspots for industrial facilities
INSERT INTO guide_hotspots (label, category, description, x, y, facility_type, product_ids) VALUES
    ('Industrial Floor', 'Flooring', 'Heavy-duty industrial flooring systems', 50, 60, 'industrial', ARRAY[]::text[]),
    ('Storage Tanks', 'Waterproofing', 'Corrosion protection for storage tanks', 80, 50, 'industrial', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Insert sample hotspots for infrastructure projects
INSERT INTO guide_hotspots (label, category, description, x, y, facility_type, product_ids) VALUES
    ('Bridge Structure', 'Waterproofing', 'Protective coatings for bridge structures', 40, 40, 'infrastructure', ARRAY[]::text[]),
    ('Tunnel Lining', 'Waterproofing', 'Waterproofing for tunnel structures', 70, 30, 'infrastructure', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE guide_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_hotspots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for guide_facilities
DROP POLICY IF EXISTS "Allow public read access to guide_facilities" ON guide_facilities;
CREATE POLICY "Allow public read access to guide_facilities" ON guide_facilities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guide_facilities" ON guide_facilities;
CREATE POLICY "Allow authenticated users to manage guide_facilities" ON guide_facilities
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for guide_hotspots
DROP POLICY IF EXISTS "Allow public read access to guide_hotspots" ON guide_hotspots;
CREATE POLICY "Allow public read access to guide_hotspots" ON guide_hotspots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage guide_hotspots" ON guide_hotspots;
CREATE POLICY "Allow authenticated users to manage guide_hotspots" ON guide_hotspots
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON guide_facilities TO authenticated;
GRANT ALL ON guide_hotspots TO authenticated;
GRANT SELECT ON guide_facilities TO anon;
GRANT SELECT ON guide_hotspots TO anon;

-- Create a view for easy access to hotspot data with facility information
CREATE OR REPLACE VIEW guide_hotspots_with_facility AS
SELECT 
    h.*,
    f.name as facility_name,
    f.icon as facility_icon
FROM guide_hotspots h
JOIN guide_facilities f ON h.facility_type = f.value
WHERE f.is_active = true;

-- Grant access to the view
GRANT SELECT ON guide_hotspots_with_facility TO anon;
GRANT SELECT ON guide_hotspots_with_facility TO authenticated;

COMMENT ON TABLE guide_facilities IS 'Building facility types for the interactive guide system';
COMMENT ON TABLE guide_hotspots IS 'Interactive hotspots for the building guide system';
COMMENT ON VIEW guide_hotspots_with_facility IS 'View combining hotspots with facility information for easy access';
