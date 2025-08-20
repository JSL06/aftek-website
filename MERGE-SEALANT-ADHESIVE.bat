@echo off
echo =====================================================
echo MERGE SEALANT AND ADHESIVE CATEGORIES
echo =====================================================
echo.
echo This batch file will help you merge the separate
echo "Sealant" and "Adhesive" categories into a single
echo "Sealant & Adhesive" category.
echo.
echo STEPS TO COMPLETE:
echo 1. Copy the contents of MERGE_SEALANT_ADHESIVE.sql
echo 2. Go to Supabase Dashboard → SQL Editor
echo 3. Paste the SQL script
echo 4. Click "Run"
echo 5. Verify the results
echo.
echo The script will:
echo - Create a new "Sealant & Adhesive" category
echo - Update all products to use the new category
echo - Add multilingual translations for the new category
echo - Remove the old separate categories
echo - Maintain proper display order
echo.
echo After running the script, you should have 5 categories:
echo 1. Waterproofing
echo 2. Sealant & Adhesive
echo 3. Redi-Mix G&M
echo 4. Flooring
echo 5. Other Specialties
echo.
echo Press any key to open the SQL file...
pause >nul
start MERGE_SEALANT_ADHESIVE.sql
echo.
echo SQL file opened. Copy the contents and run in Supabase.
echo.
pause
