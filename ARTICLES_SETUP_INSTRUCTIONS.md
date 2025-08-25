# Articles System Setup Instructions

## 🚨 **IMPORTANT: You must run the SQL script first!**

The articles system won't work until you set up the database. Follow these steps in order:

## Step 1: Run the SQL Script

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this script:** `SETUP_ARTICLES_MULTILINGUAL.sql`
4. **Wait for it to complete successfully**

This script will:
- ✅ Create all necessary tables (`articles`, `article_tags`, `article_images`, `article_tags_junction`)
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create the slug generation function
- ✅ Insert sample articles and tags
- ✅ Enable realtime subscriptions

## Step 2: Test the System

### Test Articles List Page
1. **Navigate to `/articles`** in your browser
2. **Should show:** Sample articles with titles, excerpts, and tags
3. **If blank:** Check browser console for errors

### Test Admin Articles Page
1. **Navigate to `/admin/articles`** (login required)
2. **Should show:** List of articles with edit/delete options
3. **Click "Create Test Article"** to generate sample content

### Test Adding New Articles
1. **Click "Add New Article"** button
2. **Fill in:** Title, excerpt, author, category
3. **Use the editor** to add content blocks
4. **Click "Save Article"**
5. **Should:** Save to database and redirect to articles list

## Step 3: Verify Database Tables

In Supabase, you should now have these tables:
- `articles` - Main article data
- `article_tags` - Available tags
- `article_images` - Article images
- `article_tags_junction` - Article-tag relationships

## Step 4: Check for Errors

### Common Issues:
1. **"No articles found"** → SQL script not run yet
2. **"Table doesn't exist"** → SQL script failed
3. **"Permission denied"** → RLS policies not set up
4. **"Function not found"** → Slug function not created

### Debug Steps:
1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Verify tables exist** in Supabase Table Editor
4. **Test sample data** exists in tables

## Step 5: Create Your First Article

1. **Go to `/admin/articles`**
2. **Click "Add New Article"**
3. **Fill in basic info:**
   - Title (English): "My First Article"
   - Excerpt: "This is a test article"
   - Author: "Your Name"
   - Category: "Technical"
4. **Add content blocks** using the editor
5. **Set tags** using the tag selector
6. **Upload featured image** (optional)
7. **Click "Save Article"**

## Expected Results

After setup, you should see:
- ✅ Articles list page shows sample articles
- ✅ Article detail pages load without errors
- ✅ Admin can create/edit/delete articles
- ✅ Tags system works with checkboxes
- ✅ Multilingual support works
- ✅ Content blocks editor functions
- ✅ Images upload to Supabase storage

## If Still Not Working

1. **Check browser console** for errors
2. **Verify SQL script ran successfully**
3. **Check Supabase storage buckets** exist
4. **Ensure RLS policies** are enabled
5. **Test database connection** in Supabase

## Support

If you encounter issues:
1. **Check the error messages** in browser console
2. **Verify database tables** exist in Supabase
3. **Ensure all SQL commands** executed successfully
4. **Check network requests** in browser dev tools

---

**Remember:** The articles system requires the database to be set up first. Without running the SQL script, you'll see empty pages and errors.
