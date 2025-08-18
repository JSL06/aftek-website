@echo off
echo ========================================
echo    TESTING CATEGORY FIXES
echo ========================================
echo.
echo This will test if your category manager is working now.
echo.
echo Step 1: Testing direct Supabase access
echo Step 2: Testing React app category loading
echo.
pause
echo.
echo Opening category test page...
start test-category-loading.html
echo.
echo ========================================
echo    NEXT STEPS:
echo ========================================
echo.
echo 1. In the test page, click "Test Category Loading"
echo    - Should show "Category loading successful! Found 5 categories"
echo    - Should display your 5 categories below
echo.
echo 2. Click "Test Category CRUD" to test create/update/delete
echo    - Should show success for all operations
echo.
echo 3. If both tests pass, restart your React app:
echo    - Stop dev server (Ctrl+C)
echo    - Run: npm run dev
echo.
echo 4. Go to /admin/category-manager
echo    - Should now load and display your 5 categories
echo.
echo 5. Go to /projects
echo    - Should no longer show filter errors
echo.
echo ========================================
echo.
echo Let me know what you see in the test page!
pause
