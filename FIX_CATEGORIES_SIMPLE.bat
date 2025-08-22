@echo off
echo ====================================================
echo SIMPLE FIX FOR CATEGORIES - AFTEK WEBSITE
echo ====================================================
echo.
echo This will do the MINIMUM needed to fix the 400 errors.
echo No complex features, just the basic categories.
echo.
echo ====================================================
echo WHAT THIS WILL FIX:
echo ====================================================
echo - Creates ONLY the basic tables needed
echo - Adds ONLY the 4 missing categories:
echo   * Redi-Mix G&M
echo   * Flooring  
echo   * Waterproofing
echo   * Sealant & Adhesive
echo - Adds basic English and Chinese translations
echo - Sets up minimal security
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
echo 1. Open the file: FIX_CATEGORIES_SIMPLE.sql
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
echo STEP 4: Verify It Worked
echo ====================================================
echo 1. Go to "Table Editor" in the left sidebar
echo 2. Click on "product_categories" table
echo 3. You should see the 4 missing categories
echo 4. Check "category_translations" for translations
echo.
echo ====================================================
echo STEP 5: Test Your Website
echo ====================================================
echo 1. Refresh your local website at localhost:5173
echo 2. The 400 errors should be gone
echo 3. Categories should now work properly
echo.
echo ====================================================
echo WHY THIS VERSION IS SIMPLER:
echo ====================================================
echo - Only creates 2 tables (not 4)
echo - Only adds 4 categories (not 11)
echo - Only adds 2 languages (not 6)
echo - No complex features or indexes
echo - Minimal security setup
echo - Much less likely to fail
echo.
echo ====================================================
echo TROUBLESHOOTING
echo ====================================================
echo If you still get errors:
echo - Check that you copied the ENTIRE script
echo - Make sure you're in the correct Supabase project
echo - Try running the verification queries at the bottom
echo.
echo ====================================================
pause
