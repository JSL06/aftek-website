@echo off
echo ========================================
echo FIX PRODUCT SAVING DATABASE ISSUES
echo ========================================
echo.
echo This will fix database issues that prevent product names from saving.
echo.
echo STEPS:
echo 1. Go to your Supabase SQL Editor
echo 2. Copy the contents of 'fix-product-saving-database.sql'
echo 3. Paste and run the SQL script
echo 4. Check the output to verify all columns exist
echo.
echo This script will:
echo - Add missing columns (category, model, inStock, showInFeatured, isActive)
echo - Ensure product_translations table exists
echo - Set up proper RLS policies
echo - Add performance indexes
echo.
echo Press any key to open the SQL file...
pause >nul
start fix-product-saving-database.sql
echo.
echo SQL file opened. Copy the contents and run in Supabase!
pause
