@echo off
echo ====================================================
echo SAFE FIX FOR ALL CATEGORIES - AFTEK WEBSITE
echo ====================================================
echo.
echo This will fix ALL the 400 errors by creating missing tables
echo AND adding all the missing product categories safely.
echo.
echo This version handles existing policies and tables without errors.
echo.
echo ====================================================
echo WHAT THIS WILL FIX:
echo ====================================================
echo - Creates ALL missing database tables
echo - Adds ALL missing product categories:
echo   * Redi-Mix G&M
echo   * Flooring  
echo   * Waterproofing
echo   * Sealant & Adhesive
echo   * Grout, Sealants, Repair, Adhesives, Primers
echo - Creates translations in 6 languages
echo - Adds features with translations
echo - Sets up proper security and indexes
echo - SAFELY handles existing policies and tables
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
echo 1. Open the file: FIX_ALL_CATEGORIES_SAFE.sql
echo 2. Copy ALL the content from that file
echo 3. Paste it into the Supabase SQL Editor
echo.
echo ====================================================
echo STEP 3: Run the Script
echo ====================================================
echo 1. Click the "Run" button (or press Ctrl+Enter)
echo 2. Wait for the script to complete (may take a few minutes)
echo 3. You should see "Success" message
echo 4. No more policy errors!
echo.
echo ====================================================
echo STEP 4: Verify Everything Was Created
echo ====================================================
echo 1. Go to "Table Editor" in the left sidebar
echo 2. You should now see these tables:
echo    - product_categories
echo    - category_translations
echo    - master_features
echo    - feature_translations
echo 3. Click on "product_categories" to see all categories
echo.
echo ====================================================
echo STEP 5: Test Your Website
echo ====================================================
echo 1. Refresh your local website at localhost:5173
echo 2. ALL 400 errors should be gone
echo 3. All categories should work properly
echo 4. Product filtering should work correctly
echo 5. Multilingual support should work
echo.
echo ====================================================
echo WHAT THIS SCRIPT DOES:
echo ====================================================
echo - Creates 4 missing database tables (safely)
echo - Adds 11 product categories with descriptions
echo - Creates translations in 6 languages for each category
echo - Adds 33 features with translations
echo - Includes English, Chinese, Japanese, Korean, Thai, Vietnamese
echo - Sets up proper database indexes and security
echo - SAFELY handles existing policies and tables
echo.
echo ====================================================
echo WHY THIS VERSION IS SAFER:
echo ====================================================
echo - Uses "IF NOT EXISTS" for all table creations
echo - Uses "ON CONFLICT DO NOTHING" for all inserts
echo - Checks for existing policies before creating them
echo - Handles RLS errors gracefully
echo - Can be run multiple times without errors
echo.
echo ====================================================
echo TROUBLESHOOTING
echo ====================================================
echo If you get any errors:
echo - Make sure you're in the correct Supabase project
echo - Check that you copied the ENTIRE SQL script
echo - Verify your Supabase connection is working
echo - This script is designed to be safe and error-free
echo.
echo ====================================================
echo NEED HELP?
echo ====================================================
echo If you encounter any issues, check the error message
echo and let me know what it says.
echo.
echo ====================================================
pause
