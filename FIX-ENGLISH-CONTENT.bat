@echo off
echo ========================================
echo AFTEK Website - Fix English Content
echo ========================================
echo.
echo This will fix the English language display issue.
echo.
echo The problem: When English is selected, it shows Chinese content
echo because the main products table contains Chinese text.
echo.
echo The solution: Update the main products table to use English content
echo from the translations table.
echo.
echo STEP 1: Run the SQL script in Supabase
echo ----------------------------------------
echo 1. Go to your Supabase dashboard
echo 2. Open the SQL Editor
echo 3. Copy and paste the contents of 'fix-english-content.sql'
echo 4. Run the script
echo.
echo STEP 2: Test the fix
echo ------------------------
echo 1. Start your dev server: npm run dev
echo 2. Go to /products page
echo 3. Switch to English language
echo 4. Product names and descriptions should now be in English
echo.
echo STEP 3: Verify other languages still work
echo -------------------------------------------
echo 1. Switch to Traditional Chinese
echo 2. Switch to other languages
echo 3. All should display their respective translations
echo.
echo Press any key to continue...
pause > nul
