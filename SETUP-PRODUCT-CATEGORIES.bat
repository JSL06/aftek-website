@echo off
echo =====================================================
echo SETUP PRODUCT CATEGORIES TABLE
echo =====================================================
echo.
echo This will create the product_categories table in Supabase
echo and populate it with the existing categories from your system.
echo.
echo WHAT THIS DOES:
echo.
echo 1. ✅ Creates product_categories table
echo 2. ✅ Adds indexes for performance
echo 3. ✅ Creates update timestamp trigger
echo 4. ✅ Inserts existing categories:
echo     - Waterproofing
echo     - Sealants & Adhesives
echo     - Redi-Mix G&M
echo     - Flooring Systems
echo     - Others (Insulation, Coatings)
echo 5. ✅ Links products to categories
echo 6. ✅ Verifies the setup
echo.
echo INSTRUCTIONS:
echo.
echo 1. Copy the SQL script content from setup-product-categories.sql
echo 2. Go to your Supabase dashboard
echo 3. Open the SQL Editor
echo 4. Paste the SQL script and run it
echo 5. Check the results to verify everything worked
echo.
echo Press any key to open the SQL script file...
pause >nul
start setup-product-categories.sql
echo.
echo SQL script opened. Copy the content and run it in Supabase!
echo.
echo After running the script, your Category Manager should show
echo all the existing categories and allow you to edit them.
echo.
pause
