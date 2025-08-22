-- =====================================================
-- SIMPLE FIX FOR AFTEK WEBSITE CATEGORIES
-- =====================================================
-- This script does the MINIMUM needed to fix the 400 errors
-- Run this in your Supabase SQL editor step by step

-- =====================================================
-- STEP 1: CREATE BASIC TABLES (MINIMAL)
-- =====================================================

-- 1. Create product_categories table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create category_translations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS category_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

-- =====================================================
-- STEP 2: ADD ONLY THE MISSING CATEGORIES
-- =====================================================

-- Add the specific categories that are causing 400 errors
INSERT INTO product_categories (name, description, display_order) VALUES
  ('Redi-Mix G&M', 'Ready-mix concrete and grout materials', 1),
  ('Flooring', 'Flooring solutions and materials', 2),
  ('Waterproofing', 'Waterproofing membranes and coatings', 3),
  ('Sealant & Adhesive', 'Combined sealant and adhesive solutions', 4)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 3: ADD BASIC TRANSLATIONS (ENGLISH ONLY FIRST)
-- =====================================================

-- Add English translations for the missing categories
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'en',
  pc.name,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- =====================================================
-- STEP 4: ADD TRADITIONAL CHINESE TRANSLATIONS
-- =====================================================

-- Add Traditional Chinese translations for the missing categories
INSERT INTO category_translations (category_id, language_code, display_name, description)
SELECT 
  pc.id,
  'zh-Hant',
  CASE pc.name
    WHEN 'Redi-Mix G&M' THEN '預拌混凝土與灌漿材料'
    WHEN 'Flooring' THEN '地板材料'
    WHEN 'Waterproofing' THEN '防水材料'
    WHEN 'Sealant & Adhesive' THEN '密封劑與接著劑'
    ELSE pc.name
  END,
  pc.description
FROM product_categories pc
WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- =====================================================
-- STEP 5: ENABLE BASIC SECURITY
-- =====================================================

-- Enable RLS on tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

-- Create basic read policies
DO $$
BEGIN
  -- Policy for product_categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_categories' 
    AND policyname = 'Allow public read access to product_categories'
  ) THEN
    CREATE POLICY "Allow public read access to product_categories" ON product_categories
      FOR SELECT USING (true);
  END IF;

  -- Policy for category_translations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'category_translations' 
    AND policyname = 'Allow public read access to category_translations'
  ) THEN
    CREATE POLICY "Allow public read access to category_translations" ON category_translations
      FOR SELECT USING (true);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these to check if it worked:

-- Check if categories were created:
-- SELECT * FROM product_categories WHERE name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive');

-- Check if translations were created:
-- SELECT ct.*, pc.name as category_name FROM category_translations ct JOIN product_categories pc ON ct.category_id = pc.id WHERE pc.name IN ('Redi-Mix G&M', 'Flooring', 'Waterproofing', 'Sealant & Adhesive');
