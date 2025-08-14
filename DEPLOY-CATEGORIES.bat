@echo off
echo ========================================
echo AFTEK Website - Deploy Categories System
echo ========================================
echo.

echo [1/5] Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
echo.

echo [2/5] Installing dependencies...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd install
echo.

echo [3/5] Building the website...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build
echo.

echo [4/5] Git operations...
git add .
git commit -m "Add Category Management System and WYSIWYG Editor

- Added CategoryManager for product categories
- Added WYSIWYG rich text editor for product descriptions
- Fixed undo/redo functionality in editor
- Added keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- Added category management to admin dashboard
- Created database schema for product_categories
- Updated filter system integration
- Added proper image upload to product-images bucket"
echo.

echo [5/5] Pushing to GitHub...
git push origin master
echo.

echo ========================================
echo Deployment completed!
echo ========================================
echo.
echo Next steps:
echo 1. Run the SQL script 'update-database-categories.sql' in Supabase
echo 2. Test the CategoryManager at /admin/category-manager
echo 3. Test the WYSIWYG editor in product descriptions
echo 4. Verify categories appear in product filters
echo.
echo Website will be available at: https://jsl06.github.io/aftek-website/
echo.
pause
