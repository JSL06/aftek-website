@echo off
cls
echo ============================================
echo  DEPLOY WITH ROUTER FIX FOR GITHUB PAGES
echo ============================================
echo.

set NODEPATH=%~dp0node-v22.17.0-win-x64\node-v22.17.0-win-x64
if not exist "%NODEPATH%\node.exe" (
    set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
)

echo 🔧 Fixed React Router for GitHub Pages!
echo   - Added basename='/aftek-website' for production
echo   - This will fix the "notFound" error
echo.

:: Clean and rebuild
echo 🧹 Cleaning old build...
if exist dist rmdir /s /q dist

echo 📦 Building with router fix...
"%NODEPATH%\node.exe" node_modules\vite\bin\vite.js build

if not exist dist\index.html (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful with router fix!
echo.

:: Deploy
echo 🚀 Deploying fixed version...
git add .
git commit -m "Fix: Add router basename for GitHub Pages"
git push origin main

git add dist -f
git commit -m "Deploy: Router fix for GitHub Pages"
git push origin --delete gh-pages
git subtree push --prefix dist origin gh-pages

echo.
echo ✅ Deployment complete with router fix!
echo.
echo 🌐 Your fixed site: https://JSL06.github.io/aftek-website/
echo.
echo 🎉 The "notFound" error should be gone now!
echo Wait 2-5 minutes, then refresh your browser.
echo.
pause 