@echo off
echo =====================================================
echo SIMPLE FIX FOR PRODUCT SAVING
echo =====================================================
echo.
echo The product saving issue is caused by missing database columns.
echo This simple script will add all the missing columns without errors.
echo.
echo TO FIX THIS:
echo.
echo 1. Go to your Supabase project: https://supabase.com/dashboard/project/txjhhwootljiqavnnghm
echo 2. Click on "SQL Editor" in the left sidebar
echo 3. Copy the contents of "simple-fix-product-saving.sql" file
echo 4. Paste it into the SQL Editor
echo 5. Click "Run" to execute the script
echo.
echo This will add all the missing columns:
echo - model, image, slug, sku, image_url
echo - inStock, isActive, showInFeatured, in_stock
echo - features, tags, related_products (as arrays)
echo - names, descriptions (as JSON)
echo.
echo After running the SQL script, the product saving should work!
echo.
echo Press any key to open the SQL file...
pause >nul
start notepad simple-fix-product-saving.sql
echo.
echo SQL file opened. Copy the contents and run in Supabase SQL Editor.
echo.
pause
