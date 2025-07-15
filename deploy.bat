@echo off
echo ========================================
echo  AFTEK WEBSITE - GITHUB PAGES DEPLOY
echo ========================================

echo.
echo ? Building website...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd run build

if %ERRORLEVEL% neq 0 (
    echo ? Build failed!
    pause
    exit /b 1
)

echo.
echo ? Build successful! Deploying to GitHub Pages...

git add .
git commit -m "Deploy: Updated website build"
git push origin main

echo.
echo ? Deploying to gh-pages branch...
git subtree push --prefix dist origin gh-pages

echo.
echo ? Deployment complete!
echo.
echo ? Your website: https://JSL06.github.io/aftek-website/
echo.
echo Wait 2-3 minutes for GitHub Pages to update, then visit your site.
pause 