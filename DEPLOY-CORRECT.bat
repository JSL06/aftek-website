@echo off
cls
echo ============================================
echo  DEPLOYING FROM THE CORRECT FOLDER
echo ============================================
echo.
echo Working in: aftek-website
echo.

set NODEPATH=%~dp0node-v22.17.0-win-x64\node-v22.17.0-win-x64
if not exist "%NODEPATH%\node.exe" (
    set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
)

:: Build the project
echo 📦 Building...
"%NODEPATH%\node.exe" node_modules\vite\bin\vite.js build

if not exist dist\index.html (
    echo ❌ Build failed!
    pause
    exit /b 1
)

:: Check git remote
echo.
echo 🔍 Checking git configuration...
git remote -v

:: Commit any pending changes
echo.
echo 📝 Committing changes...
git add .
git commit -m "Update site files" 2>nul

:: Deploy
echo.
echo 🚀 Deploying to GitHub Pages...
git add dist -f
git commit -m "Deploy to GitHub Pages"

:: Delete remote gh-pages branch and push fresh
echo Updating gh-pages branch...
git push origin --delete gh-pages 2>nul
git subtree push --prefix dist origin gh-pages

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your site: https://JSL06.github.io/aftek-website/
echo.
echo 📋 Make sure GitHub Pages is enabled:
echo   1. Go to: https://github.com/JSL06/aftek-website/settings/pages
echo   2. Set Source to "Deploy from a branch"
echo   3. Set Branch to "gh-pages" and folder to "/ (root)"
echo.
pause 