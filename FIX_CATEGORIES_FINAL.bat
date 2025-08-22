@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo FIX CATEGORIES FINAL - AFTEK WEBSITE
echo =====================================================
echo This will fix your categories and add all translations
echo.
echo =====================================================
echo STEP 1: RUN THE SQL SCRIPT
echo =====================================================
echo 1. Open your Supabase dashboard
echo 2. Go to SQL Editor
echo 3. Copy and paste the contents of FIX_CATEGORIES_FINAL.sql
echo 4. Click "Run" to execute the script
echo.
echo =====================================================
echo STEP 2: VERIFY THE RESULTS
echo =====================================================
echo The script will show you:
echo - All 5 categories created
echo - Translation counts for each language
echo - Sample translations
echo - RLS policies status
echo.
echo =====================================================
echo STEP 3: TEST YOUR WEBSITE
echo =====================================================
echo After running the script:
echo 1. Refresh your local website
echo 2. Change languages - categories should now translate!
echo 3. Check that all UI elements are translated
echo.
echo =====================================================
echo EXPECTED RESULTS
echo =====================================================
echo ✅ 5 categories: Waterproofing, Sealant/Adhesive, Flooring, Redi-Mix G&M, Industrial Flooring
echo ✅ 7 languages: en, zh-Hant, zh-Hans, ja, ko, th, vi
echo ✅ All UI elements translated (buttons, labels, titles)
echo ✅ No more 400 errors
echo.
echo =====================================================
echo IMPORTANT NOTES
echo =====================================================
echo - This script will DELETE existing categories and recreate them
echo - All translations will be fresh and correct
echo - RLS policies will be updated for proper access
echo.
echo Press any key to continue...
pause >nul
