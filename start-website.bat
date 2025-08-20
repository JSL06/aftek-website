@echo off
echo Starting Aftek Website...

REM Kill any existing Node processes
echo Killing existing Node processes...
taskkill /F /IM node.exe 2>nul

REM Navigate to the correct directory
cd /d "%~dp0"

REM Set PATH to include our Node.js installation
set PATH=%CD%\node-v22.17.0-win-x64\node-v22.17.0-win-x64;%CD%\node-v22.17.0-win-x64\package\bin;%PATH%

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the aftek-website directory.
    pause
    exit /b 1
)

REM Check if Node.js is available
if not exist "node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe" (
    echo Error: Node.js executable not found. Please ensure node-v22.17.0-win-x64 is in the current directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call install-deps.bat
    if errorlevel 1 (
        echo Error: Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
node .\node_modules\vite\bin\vite.js

pause 