# Database Setup Instructions

## Quick Fix: Create the Missing Table

The error you're seeing means the `product_translations` table doesn't exist in your Supabase database.

### Option 1: Use Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Copy and paste this SQL code:**

```sql
-- Create the product_translations table
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language_code ON product_translations(language_code);

-- Enable RLS
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to product translations" ON product_translations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage product translations" ON product_translations
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON product_translations TO authenticated;
GRANT SELECT ON product_translations TO anon;
```

4. **Click "Run" to execute the SQL**
5. **You should see "product_translations table created successfully"**

### Option 2: Use the Admin Panel

1. **Go to your admin panel**
2. **Click the "🔍 Check Database" button**
3. **If the table doesn't exist, it will attempt to create it**

### After Setup

1. **Refresh your admin panel**
2. **Try editing a product name**
3. **Click Save**
4. **The name should now persist after refresh!**

## What This Table Does

The `product_translations` table stores:
- **Product names** in different languages
- **Product descriptions** in different languages
- **Links to the main products table**

This allows you to:
- ✅ **Save product names** in multiple languages
- ✅ **Persist changes** across page refreshes
- ✅ **Display correct names** on the frontend website

## Troubleshooting

If you still get errors:
1. **Check the Supabase dashboard** for any error messages
2. **Verify the table was created** in the "Table Editor"
3. **Check RLS policies** are set correctly
4. **Use the debug buttons** in the admin panel to test functionality
