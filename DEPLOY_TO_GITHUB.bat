@echo off
echo ====================================================
echo DEPLOYING AFTEK WEBSITE TO GITHUB PAGES
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
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Update translations and fix product detail page"

git commit -m "%commit_message%"
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
echo Local testing: http://localhost:5173
echo GitHub Pages: https://jsl06.github.io/aftek-website/
echo.

pause
