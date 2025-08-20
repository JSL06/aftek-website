# AFTEK Features System Troubleshooting Guide

## Common Issues and Solutions

### 1. "No categories or features found" message

**Problem**: The Features Editor shows "Database Setup Required" message.

**Solution**: 
- Run the `COMPLETE_FEATURES_SETUP.sql` script in your Supabase SQL Editor
- Make sure you're connected to the correct Supabase project
- Check that the script completed without errors

### 2. Console errors about missing tables

**Problem**: Browser console shows errors like "relation 'feature_categories' does not exist"

**Solution**:
- Verify the SQL script ran successfully
- Check Supabase SQL Editor for any error messages
- Ensure you're in the correct database schema

### 3. Features not saving when editing products

**Problem**: Features are selected but don't persist after saving

**Solution**:
- Verify the `products` table has a `features TEXT[]` column
- Check that the `FeaturesChecklist` component is properly integrated
- Ensure the `productService.ts` includes features in updates

### 4. Multilingual translations not working

**Problem**: Features only show in one language

**Solution**:
- Verify all translation tables were created (`category_translations`, `feature_translations`)
- Check that sample data includes all supported languages
- Ensure the admin language context is properly set

### 5. Features not appearing in frontend

**Problem**: Features are saved in admin but don't show on website

**Solution**:
- Check that the `FeaturesChecklist` component is used in both Products and Projects pages
- Verify the `FeaturesService` is properly fetching data
- Ensure the frontend language selection is working

## Debugging Steps

### 1. Check Browser Console
- Open Developer Tools (F12)
- Look for any error messages
- Check the console logs we added for debugging

### 2. Verify Database Tables
Run this query in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%feature%';
```

### 3. Check Sample Data
Run this query to see if data exists:
```sql
SELECT * FROM feature_categories;
SELECT * FROM master_features;
SELECT * FROM category_translations LIMIT 5;
SELECT * FROM feature_translations LIMIT 5;
```

### 4. Test Database Connection
The Features Editor now includes a "Database Connection Status" section that shows:
- Number of categories loaded
- Number of features loaded
- Refresh button to retry loading

## Getting Help

If you're still experiencing issues:

1. **Check the console logs** - We've added detailed logging to help identify problems
2. **Verify SQL execution** - Make sure the setup script ran completely
3. **Check table structure** - Ensure all tables were created with correct columns
4. **Test with sample data** - The setup script should create 5 categories and sample features

## Expected Results After Setup

After running `COMPLETE_FEATURES_SETUP.sql`, you should see:

- **5 Feature Categories**: Environment, Performance, Safety, Application, Durability
- **Sample Features**: Fireproof, Waterproof, High-strength, Durable, etc.
- **Multilingual Support**: All features available in 7 languages
- **Admin Interface**: Full CRUD operations for categories and features
- **Product Integration**: Features can be selected when editing products

If you don't see these results, the setup script may not have completed successfully.
