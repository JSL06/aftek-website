@echo off
echo ========================================
echo  AFTEK WEBSITE - DEPLOYMENT STATUS
echo ========================================

echo.
echo ? Website URL: https://JSL06.github.io/aftek-website/
echo ? Admin Login: https://JSL06.github.io/aftek-website/admin/login
echo.
echo ? Admin Credentials:
echo   Username: admin
echo   Password: aftek2024
echo.
echo ? GitHub Repository: https://github.com/JSL06/aftek-website
echo.
echo ? Recent Commits:
git log --oneline -3
echo.
echo ? GitHub Pages Branch:
git branch -r | findstr gh-pages
echo.
echo Opening main website...
start https://JSL06.github.io/aftek-website/
echo.
echo Opening admin login page...
start https://JSL06.github.io/aftek-website/admin/login
echo.
echo Note: It may take 2-5 minutes for changes to appear on GitHub Pages.
echo SPA routing is now configured - admin pages should work!
pause 