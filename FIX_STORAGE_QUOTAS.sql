-- FIX_STORAGE_QUOTAS.sql
-- Fix script for existing databases that don't have the quota_type column

-- Add missing quota_type column if it doesn't exist
ALTER TABLE storage_quotas ADD COLUMN IF NOT EXISTS quota_type VARCHAR(50) DEFAULT 'free';

-- Update existing records to have the default quota_type
UPDATE storage_quotas SET quota_type = 'free' WHERE quota_type IS NULL;

-- Verify the fix
SELECT 
    bucket_name,
    max_size,
    quota_type,
    warning_threshold,
    critical_threshold
FROM storage_quotas;
