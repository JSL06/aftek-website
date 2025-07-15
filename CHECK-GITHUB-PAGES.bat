@echo off
echo ============================================
echo  GITHUB PAGES STATUS CHECK
echo ============================================
echo.

echo 📋 Checking deployment status...
echo.

:: Check branches
echo Local and remote branches:
git branch -a | findstr "gh-pages"
echo.

:: Check last commit on gh-pages
echo Last deployment:
git log origin/gh-pages --oneline -1
echo.

:: Show deployment URLs
echo ============================================
echo 🌐 GitHub Pages URLs:
echo.
echo Repository Settings:
echo https://github.com/JSL06/aftek-website/settings/pages
echo.
echo Expected Site URL:
echo https://JSL06.github.io/aftek-website/
echo.
echo Direct gh-pages branch:
echo https://github.com/JSL06/aftek-website/tree/gh-pages
echo ============================================
echo.
echo If you see "404 error":
echo 1. Go to the Repository Settings link above
echo 2. Enable GitHub Pages from gh-pages branch
echo 3. Wait 5-10 minutes for activation
echo.
pause 