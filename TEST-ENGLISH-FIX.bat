@echo off
echo ========================================
echo AFTEK Website - Test English Fix
echo ========================================
echo.
echo This will test if the English language fix is working.
echo.
echo STEP 1: Verify Database Has English Translations
echo ------------------------------------------------
echo 1. Go to Supabase SQL Editor
echo 2. Run: SELECT COUNT(*) FROM product_translations WHERE language_code = 'en';
echo 3. Should show multiple rows (one per product)
echo.
echo STEP 2: Test Admin Panel English Editing
echo -----------------------------------------
echo 1. Start your dev server: npm run dev
echo 2. Go to /admin/products
echo 3. Edit any product
echo 4. Go to English tab
echo 5. Change the name and description
echo 6. Save the product
echo.
echo STEP 3: Test Website English Display
echo -------------------------------------
echo 1. Go to /products page
echo 2. Switch to English language
echo 3. Check if your changes from admin panel appear
echo 4. Product names/descriptions should be in English
echo.
echo STEP 4: Test Other Languages Still Work
echo ----------------------------------------
echo 1. Switch to Traditional Chinese
echo 2. Switch to other languages
echo 3. All should display their respective translations
echo.
echo If English still doesn't work:
echo 1. Check browser console for errors
echo 2. Verify product_translations table has English data
echo 3. Check if getAllProducts is now using the new translation system
echo.
echo Press any key to continue...
pause > nul
