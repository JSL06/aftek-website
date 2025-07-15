@echo off
echo ========================================
echo  AFTEK WEBSITE - DEPLOYMENT STATUS
echo ========================================

echo.
echo ? Website URL: https://JSL06.github.io/aftek-website/
echo.
echo ? GitHub Repository: https://github.com/JSL06/aftek-website
echo.
echo ? Deployment Status:
git log --oneline -3
echo.
echo ? GitHub Pages Branch:
git branch -r | findstr gh-pages
echo.
echo Opening website in browser...
start https://JSL06.github.io/aftek-website/
echo.
echo Note: It may take 2-5 minutes for changes to appear on GitHub Pages.
echo If you see a 404 error, wait a few minutes and refresh.
pause 