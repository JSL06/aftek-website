@echo off
cls
echo ============================================
echo  FIX DEPLOYMENT - REBUILD AND REDEPLOY
echo ============================================
echo.

set NODEPATH=%~dp0node-v22.17.0-win-x64\node-v22.17.0-win-x64
if not exist "%NODEPATH%\node.exe" (
    set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
)

:: Step 1: Clean everything
echo 🧹 Cleaning old builds...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

:: Step 2: Fresh build
echo 📦 Building fresh...
"%NODEPATH%\node.exe" node_modules\vite\bin\vite.js build

:: Step 3: Verify build
if not exist dist\index.html (
    echo ❌ Build failed - no index.html!
    pause
    exit /b 1
)

:: Check if JavaScript file exists
dir dist\assets\*.js >nul 2>&1
if errorlevel 1 (
    echo ❌ Build failed - no JavaScript files!
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 📁 Built files:
dir dist\*.* /b
echo.
echo 📁 Assets:
dir dist\assets\*.* /b
echo.

:: Step 4: Commit and redeploy
echo 🚀 Redeploying...
git add .
git commit -m "Fix: Rebuild with all assets"
git push origin main

:: Force fresh deployment
git push origin --delete gh-pages
git subtree push --prefix dist origin gh-pages

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your site: https://JSL06.github.io/aftek-website/
echo Wait 2-5 minutes then check your site!
echo.
pause 