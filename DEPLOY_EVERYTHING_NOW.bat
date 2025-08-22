@echo off
echo ====================================================
echo DEPLOYING EVERYTHING TO GITHUB PAGES - COMPLETE FIX
echo ====================================================
echo.

echo Checking current directory...
if not exist "package.json" (
    echo ERROR: Not in aftek-website directory!
    echo Please run this script from the aftek-website folder
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

echo ====================================================
echo STEP 1: KILLING EXISTING NODE PROCESSES
echo ====================================================
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Killed existing Node processes
) else (
    echo No existing Node processes found
)
echo.

echo ====================================================
echo STEP 2: CHECKING GIT STATUS
echo ====================================================
git status
echo.

echo ====================================================
echo STEP 3: ADDING ALL CHANGES
echo ====================================================
git add .
echo Added all changes to staging
echo.

echo ====================================================
echo STEP 4: COMMITTING CHANGES
echo ====================================================
git commit -m "Complete fix: ProductDetail translations, debugging, and all language support working"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Successfully committed changes
echo.

echo ====================================================
echo STEP 5: PUSHING TO GITHUB
echo ====================================================
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Successfully pushed to GitHub
echo.

echo ====================================================
echo STEP 6: BUILDING FOR PRODUCTION
echo ====================================================
echo Building with Node.js v22...
.\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Build completed successfully
echo.

echo ====================================================
echo STEP 7: VERIFYING BUILD OUTPUT
echo ====================================================
if exist "dist" (
    echo Build output directory 'dist' created successfully
    dir dist
) else (
    echo ERROR: Build output directory 'dist' not found!
    pause
    exit /b 1
)
echo.

echo ====================================================
echo DEPLOYMENT COMPLETE!
echo ====================================================
echo.
echo Your website has been:
echo 1. Committed to Git
echo 2. Pushed to GitHub
echo 3. Built for production
echo.
echo GitHub Pages will automatically deploy the changes
echo Website will be available at: https://jsl06.github.io/aftek-website/
echo.
echo All translations and fixes are now live!
echo.

echo ====================================================
echo VERIFICATION STEPS:
echo ====================================================
echo 1. Wait 2-3 minutes for GitHub Pages to update
echo 2. Visit: https://jsl06.github.io/aftek-website/
echo 3. Test language switching
echo 4. Test "Back to Products" button in all languages
echo 5. Test product detail page translations
echo.

pause
