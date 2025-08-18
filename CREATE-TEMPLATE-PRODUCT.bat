@echo off
echo ========================================
echo CREATE TEMPLATE PRODUCT FOR TESTING
echo ========================================
echo.
echo This will clear all existing products and create one template product
echo for testing all website functions.
echo.
echo STEPS:
echo 1. Go to your Supabase SQL Editor
echo 2. Copy the contents of 'create-template-product.sql'
echo 3. Paste and run the SQL script
echo 4. Check the output to verify success
echo.
echo After running the script, you will have:
echo - 1 template product with ID
echo - Translations in all 7 languages
echo - Ready for testing admin panel functions
echo.
echo Press any key to open the SQL file...
pause >nul
start create-template-product.sql
echo.
echo SQL file opened. Copy the contents and run in Supabase!
pause
