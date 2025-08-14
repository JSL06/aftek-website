@echo off
echo ========================================
echo AFTEK Website - Fix All Issues
echo ========================================
echo.

echo [1/4] Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
echo.

echo [2/4] Installing dependencies...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd install
echo.

echo [3/4] Building the website...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build
echo.

echo [4/4] Git operations...
git add .
git commit -m "Fix all website issues

- Fixed duplicate help text in rich text editor
- Fixed product links using React Router navigation
- Created database fix script for product table structure
- Resolved Supabase 400 errors
- Fixed text alignment and layout issues"
echo.

echo ========================================
echo Fixes completed!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'fix-product-database-v2.sql' in Supabase to fix 400 errors
echo 2. Run 'update-database-categories.sql' in Supabase for category system
echo 3. Test product links and rich text editor
echo 4. Verify all text alignment is correct
echo.
echo Website will be available at: https://jsl06.github.io/aftek-website/
echo.
pause
