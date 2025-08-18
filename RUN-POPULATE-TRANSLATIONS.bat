@echo off
echo ========================================
echo AFTEK Website - Populate Translations
echo ========================================
echo.
echo This will populate your database with proper translations
echo so the product editor shows real, editable content.
echo.
echo STEP 1: Run the SQL script in Supabase
echo ----------------------------------------
echo 1. Go to your Supabase dashboard
echo 2. Open the SQL Editor
echo 3. Copy and paste the contents of 'populate-all-products-translations.sql'
echo 4. Run the script
echo.
echo STEP 2: Test the editor
echo ------------------------
echo 1. Start your dev server: npm run dev
echo 2. Go to /admin/products
echo 3. Click Edit on any product
echo 4. You should now see real content in each language tab
echo.
echo STEP 3: Verify changes appear on website
echo -----------------------------------------
echo 1. Make changes in the editor
echo 2. Save changes
echo 3. Check the public website to see if changes appear
echo.
echo Press any key to continue...
pause > nul
