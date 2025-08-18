@echo off
echo ========================================
echo AFTEK Website - Test Language Switching
echo ========================================
echo.
echo This will help you test if language switching is working properly.
echo.
echo STEP 1: Verify Database Has Translations
echo ----------------------------------------
echo 1. Go to Supabase SQL Editor
echo 2. Run: SELECT COUNT(*) FROM product_translations;
echo 3. Should show multiple rows (7 per product)
echo.
echo STEP 2: Test Language Switching
echo --------------------------------
echo 1. Start your dev server: npm run dev
echo 2. Go to /products page
echo 3. Change language using the language selector
echo 4. Check if product names/descriptions change
echo.
echo STEP 3: Check Console Logs
echo ---------------------------
echo 1. Open browser console (F12)
echo 2. Look for these log messages:
echo    - "🌐 Current language: [language]"
echo    - "📦 Loaded X products with database translations"
echo    - "Product service: Processing product: [product]"
echo.
echo STEP 4: Verify Admin Editor
echo ----------------------------
echo 1. Go to /admin/products
echo 2. Edit any product
echo 3. Change content in different language tabs
echo 4. Save and check if changes appear on public site
echo.
echo If language switching still doesn't work:
echo 1. Check browser console for errors
echo 2. Verify product_translations table has data
echo 3. Check if currentLanguage is changing in useTranslation hook
echo.
echo Press any key to continue...
pause > nul
