@echo off
echo ====================================================
echo ADD MISSING CATEGORIES - AFTEK WEBSITE
echo ====================================================
echo.
echo This will guide you through adding the missing product categories
echo that are causing the 400 errors on your website.
echo.
echo The missing categories are:
echo - Redi-Mix G&M
echo - Flooring  
echo - Waterproofing
echo - Grout
echo - Sealants
echo - Repair
echo - Adhesives
echo - Primers
echo.
echo ====================================================
echo STEP 1: Open Supabase Dashboard
echo ====================================================
echo 1. Go to your Supabase project dashboard
echo 2. Click on "SQL Editor" in the left sidebar
echo 3. Click "New Query"
echo.
echo ====================================================
echo STEP 2: Copy and Paste the SQL Script
echo ====================================================
echo 1. Open the file: ADD_MISSING_CATEGORIES.sql
echo 2. Copy ALL the content from that file
echo 3. Paste it into the Supabase SQL Editor
echo.
echo ====================================================
echo STEP 3: Run the Script
echo ====================================================
echo 1. Click the "Run" button (or press Ctrl+Enter)
echo 2. Wait for the script to complete
echo 3. You should see "Success" message
echo.
echo ====================================================
echo STEP 4: Verify the Categories
echo ====================================================
echo 1. Go to "Table Editor" in the left sidebar
echo 2. Click on "product_categories" table
echo 3. You should now see all the missing categories
echo 4. Check "category_translations" for translations
echo.
echo ====================================================
echo STEP 5: Test Your Website
echo ====================================================
echo 1. Refresh your local website at localhost:5173
echo 2. The 400 errors should be gone
echo 3. All categories should now work properly
echo 4. Product filtering should work correctly
echo.
echo ====================================================
echo WHAT THIS SCRIPT DOES:
echo ====================================================
echo - Adds 8 missing product categories
echo - Creates translations in 6 languages for each category
echo - Adds 24 new features with translations
echo - Includes Traditional Chinese, Japanese, Korean, Thai, Vietnamese
echo.
echo ====================================================
echo TROUBLESHOOTING
echo ====================================================
echo If you get any errors:
echo - Make sure you're in the correct Supabase project
echo - Check that you copied the ENTIRE SQL script
echo - Verify your Supabase connection is working
echo - Check that the basic tables exist first
echo.
echo ====================================================
echo NEED HELP?
echo ====================================================
echo If you encounter any issues, check the error message
echo and let me know what it says.
echo.
echo ====================================================
pause
