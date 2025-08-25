# Debug Articles Not Showing Up

## 🚨 **Issue: Articles not appearing in admin management**

## **Step 1: Check Browser Console**
1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Navigate to `/admin/articles`**
4. **Look for any error messages**

## **Step 2: Check Database Tables**
1. **Go to Supabase Dashboard**
2. **Navigate to Table Editor**
3. **Verify these tables exist:**
   - ✅ `articles`
   - ✅ `article_tags`
   - ✅ `article_images`
   - ✅ `article_tags_junction`

## **Step 3: Check if Articles Exist in Database**
1. **In Supabase Table Editor**
2. **Click on `articles` table**
3. **Check if there are any rows**
4. **If empty, the SQL script wasn't run or failed**

## **Step 4: Run SQL Script Again**
1. **Go to SQL Editor in Supabase**
2. **Run the updated `SETUP_ARTICLES_MULTILINGUAL.sql`**
3. **Check for any errors**
4. **Verify tables have data**

## **Step 5: Test Database Connection**
1. **Check if Supabase client is configured**
2. **Verify environment variables**
3. **Test a simple query**

## **Step 6: Check Network Requests**
1. **Open browser dev tools**
2. **Go to Network tab**
3. **Navigate to `/admin/articles`**
4. **Look for failed API calls**

## **Common Issues:**

### **1. SQL Script Not Run**
- **Symptoms:** Empty tables, no articles
- **Solution:** Run the SQL script

### **2. Database Connection Failed**
- **Symptoms:** Console errors about Supabase
- **Solution:** Check environment variables

### **3. RLS Policies Blocking Access**
- **Symptoms:** Permission denied errors
- **Solution:** Check RLS policies in Supabase

### **4. Articles Not Being Saved**
- **Symptoms:** Create works but articles don't appear
- **Solution:** Check save logic and database writes

## **Quick Test:**
1. **Create a new article**
2. **Check if it appears in Supabase table**
3. **If yes, it's a loading issue**
4. **If no, it's a save issue**

## **Debug Commands:**
```sql
-- Check if articles exist
SELECT COUNT(*) FROM articles;

-- Check if tags exist
SELECT COUNT(*) FROM article_tags;

-- Check recent articles
SELECT * FROM articles ORDER BY created_at DESC LIMIT 5;
```

## **Next Steps:**
1. **Run the debug steps above**
2. **Report any errors found**
3. **Check if articles exist in database**
4. **Verify SQL script execution**
