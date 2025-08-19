-- FIX FEATURES DATA TYPE ISSUE
-- This script fixes features that are stored as JSON strings instead of proper arrays

-- 1. Check current features data type
SELECT 'Current features data type issue:' as info;
SELECT 
  id,
  name,
  features,
  pg_typeof(features) as features_type,
  CASE 
    WHEN features IS NULL THEN 'NULL'
    WHEN features = '{}' THEN 'Empty array'
    WHEN pg_typeof(features) = 'text'::regtype THEN 'STRING (needs fixing)'
    WHEN pg_typeof(features) = 'text[]'::regtype THEN 'ARRAY (correct)'
    ELSE 'OTHER TYPE: ' || pg_typeof(features)
  END as status
FROM products 
WHERE features IS NOT NULL
LIMIT 5;

-- 2. Fix features that are stored as JSON strings
-- First, let's see what we're working with
SELECT 'Features that need fixing (currently text):' as info;
SELECT 
  id,
  name,
  features,
  pg_typeof(features) as current_type
FROM products 
WHERE pg_typeof(features) = 'text'::regtype 
AND features LIKE '[%]';

-- 3. Convert the features column to text[] type
-- First remove the default constraint
ALTER TABLE products ALTER COLUMN features DROP DEFAULT;

-- Then convert the column type
ALTER TABLE products ALTER COLUMN features TYPE text[] USING 
  CASE 
    WHEN features LIKE '[%]' THEN
      string_to_array(
        trim(both '[]' from features), 
        ','
      )
    ELSE ARRAY[]::text[]
  END;

-- Add back the default constraint
ALTER TABLE products ALTER COLUMN features SET DEFAULT ARRAY[]::text[];

-- 3. Verify the fix
SELECT 'After fixing - features data type:' as info;
SELECT 
  id,
  name,
  features,
  pg_typeof(features) as features_type,
  CASE 
    WHEN features IS NULL THEN 'NULL'
    WHEN features = '{}' THEN 'Empty array'
    WHEN pg_typeof(features) = 'text'::regtype THEN 'STRING (still needs fixing)'
    WHEN pg_typeof(features) = 'text[]'::regtype THEN 'ARRAY (fixed!)'
    ELSE 'OTHER TYPE: ' || pg_typeof(features)
  END as status
FROM products 
WHERE features IS NOT NULL
LIMIT 5;

-- 4. Test that features are now proper arrays
SELECT 'Testing array functionality:' as info;
SELECT 
  id,
  name,
  features,
  CASE 
    WHEN pg_typeof(features) = 'text[]'::regtype THEN 'Is Array Type: ' || array_length(features, 1) || ' items'
    ELSE 'Not Array: ' || pg_typeof(features)
  END as test_result
FROM products 
WHERE features IS NOT NULL AND features != '{}'
LIMIT 3;

SELECT 'FEATURES DATA TYPE FIX COMPLETE!' as result;
SELECT 'Features should now be proper arrays instead of JSON strings.' as details;
SELECT 'Refresh your ProductEdit page to see the features display properly.' as next_step;
