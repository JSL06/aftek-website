@echo off
echo ====================================================
echo FIX MISSING TABLES - AFTEK WEBSITE
echo ====================================================
echo.
echo This will guide you through fixing the missing database tables
echo that are causing the 404 errors on your website.
echo.
echo The issue is that your Supabase database is missing these tables:
echo - product_categories
echo - category_translations  
echo - master_features
echo - feature_translations
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
echo 1. Open the file: CREATE_MISSING_TABLES.sql
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
echo STEP 4: Verify the Tables
echo ====================================================
echo 1. Go to "Table Editor" in the left sidebar
echo 2. You should now see these new tables:
echo    - product_categories
echo    - category_translations
echo    - master_features
echo    - feature_translations
echo.
echo ====================================================
echo STEP 5: Test Your Website
echo ====================================================
echo 1. Refresh your local website at localhost:5173
echo 2. The 404 errors should be gone
echo 3. Categories and features should now work properly
echo.
echo ====================================================
echo TROUBLESHOOTING
echo ====================================================
echo If you get any errors:
echo - Make sure you're in the correct Supabase project
echo - Check that you copied the ENTIRE SQL script
echo - Verify your Supabase connection is working
echo.
echo ====================================================
echo NEED HELP?
echo ====================================================
echo If you encounter any issues, check the error message
echo and let me know what it says.
echo.
echo ====================================================
pause
