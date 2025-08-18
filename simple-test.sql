-- Simple test to create product_categories table
-- Run this in Supabase SQL Editor

-- Create the table
CREATE TABLE product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO product_categories (name, description, display_order) VALUES
    ('Waterproofing', 'Test category 1', 1),
    ('Sealants & Adhesives', 'Test category 2', 2);

-- Verify it worked
SELECT * FROM product_categories;
