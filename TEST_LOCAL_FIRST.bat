@echo off
echo ====================================================
echo TESTING AFTEK WEBSITE LOCALLY FIRST
echo ====================================================
echo.

echo Checking current directory...
if not exist "package.json" (
    echo ERROR: Not in aftek-website directory!
    pause
    exit /b 1
)

echo ====================================================
echo STEP 1: KILLING EXISTING NODE PROCESSES
echo ====================================================
taskkill /F /IM node.exe 2>nul
echo.

echo ====================================================
echo STEP 2: STARTING LOCAL DEVELOPMENT SERVER
echo ====================================================
echo Starting Vite development server...
echo Website will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server when testing is complete
echo.

.\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js

pause
