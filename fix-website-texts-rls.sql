-- Fix RLS policies for website_texts table
-- This script removes the authenticated-only policy and ensures public access

-- Drop the existing authenticated policy
DROP POLICY IF EXISTS "Authenticated users can manage website_texts" ON website_texts;

-- Ensure public access policy exists
DROP POLICY IF EXISTS "Public access for website_texts" ON website_texts;
CREATE POLICY "Public access for website_texts" ON website_texts
    FOR ALL USING (true);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'website_texts'; 