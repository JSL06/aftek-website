@echo off
echo ========================================
echo  AFTEK WEBSITE - PREVIEW PRODUCTION
echo ========================================

echo.
echo ? Building production version...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd run build

if %ERRORLEVEL% neq 0 (
    echo ? Build failed!
    pause
    exit /b 1
)

echo.
echo ? Build successful! Starting preview server...
echo ? This will show exactly what will be deployed to GitHub Pages
echo.
echo ? Preview URLs:
echo   - Main site: http://localhost:4173/aftek-website/
echo   - Admin login: http://localhost:4173/aftek-website/admin/login
echo.
echo ? Admin credentials:
echo   - Username: admin
echo   - Password: aftek2024
echo.
echo ? Press Ctrl+C to stop the preview server when done.
echo.
pause

echo.
echo ? Starting preview server...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd run preview 