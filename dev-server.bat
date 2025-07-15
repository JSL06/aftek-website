@echo off
echo ========================================
echo  AFTEK WEBSITE - LOCAL DEVELOPMENT
echo ========================================

echo.
echo ? Starting local development server...
echo ? This will open your website at: http://localhost:5173
echo.
echo ? Features available locally:
echo   - Hot reload (changes update automatically)
echo   - Full React Router support
echo   - Admin pages work without SPA routing issues
echo   - All website features functional
echo.
echo ? Admin access (when server starts):
echo   - Login: http://localhost:5173/admin/login
echo   - Username: admin
echo   - Password: aftek2024
echo.
echo ? Press Ctrl+C to stop the server when done.
echo.
pause

echo.
echo ? Launching development server...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd run dev 