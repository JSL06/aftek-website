-- Quick fix to test product updates directly

-- 1. First, let's see what we're working with
SELECT id, name, category, "inStock", "showInFeatured", "isActive", model
FROM products 
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';

-- 2. Test updating just the category field
UPDATE products 
SET category = 'Sealants & Adhesives'
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
RETURNING id, name, category;

-- 3. Test updating the model field
UPDATE products 
SET model = 'TEST-MODEL-123'
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
RETURNING id, name, model;

-- 4. Test updating boolean fields
UPDATE products 
SET "inStock" = true, "showInFeatured" = false, "isActive" = true
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
RETURNING id, name, "inStock", "showInFeatured", "isActive";

-- 5. Check final state
SELECT id, name, category, "inStock", "showInFeatured", "isActive", model
FROM products 
WHERE id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';
