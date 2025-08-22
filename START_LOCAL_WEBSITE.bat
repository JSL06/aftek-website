@echo off
echo =====================================================
echo START LOCAL WEBSITE HOSTING
echo =====================================================
echo.
echo This will start your Aftek website locally
echo Website will be available at: http://localhost:5173
echo.
echo =====================================================
echo CHECKING CURRENT DIRECTORY...
echo =====================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this from the aftek-website directory
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json - we're in the right directory
echo.

echo =====================================================
echo CHECKING NODE_MODULES...
echo =====================================================

REM Check if node_modules exists and has Vite
if not exist "node_modules" (
    echo ❌ node_modules directory not found!
    echo.
    echo Please run FIX_NODE_MODULES.bat first to install dependencies
    echo.
    pause
    exit /b 1
)

REM Check for Vite in different possible locations
set VITE_PATH=
if exist "node_modules\vite\bin\vite.js" (
    set VITE_PATH=node_modules\vite\bin\vite.js
    echo ✅ Found Vite at: %VITE_PATH%
) else if exist "node_modules\.bin\vite" (
    set VITE_PATH=node_modules\.bin\vite
    echo ✅ Found Vite at: %VITE_PATH%
) else if exist "node_modules\vite\dist\cli.js" (
    set VITE_PATH=node_modules\vite\dist\cli.js
    echo ✅ Found Vite at: %VITE_PATH%
) else (
    echo ❌ Vite not found in node_modules!
    echo.
    echo The node_modules directory appears to be corrupted.
    echo Please run FIX_NODE_MODULES.bat to fix this issue.
    echo.
    pause
    exit /b 1
)
echo.

echo =====================================================
echo KILLING EXISTING NODE PROCESSES...
echo =====================================================

REM Kill any existing Node processes to avoid conflicts
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Killed existing Node processes
) else (
    echo ℹ️  No existing Node processes found
)
echo.

echo =====================================================
echo CHECKING GIT STATUS...
echo =====================================================

REM Check git status for any uncommitted changes
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ℹ️  Git repository found
    git status --porcelain
    echo.
    echo ⚠️  You have uncommitted changes
    echo Consider committing them before testing
    echo.
) else (
    echo ℹ️  Git repository not found or no changes
)
echo.

echo =====================================================
echo STARTING LOCAL DEVELOPMENT SERVER...
echo =====================================================

REM Use the local Node.js installation
set NODE_PATH=.\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe

echo Using Node.js from: %NODE_PATH%
echo Using Vite from: %VITE_PATH%
echo.

REM Check if Node.js exists
if not exist "%NODE_PATH%" (
    echo ❌ Node.js not found at: %NODE_PATH%
    echo Please ensure the Node.js installation is present
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Start the development server
echo 🚀 Starting Vite development server...
echo 📍 Website will be available at: http://localhost:5173
echo 📍 Admin panel: http://localhost:5173/admin
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Vite based on the path found
if "%VITE_PATH%"=="node_modules\vite\bin\vite.js" (
    "%NODE_PATH%" "%VITE_PATH%"
) else if "%VITE_PATH%"=="node_modules\.bin\vite" (
    "%NODE_PATH%" "%VITE_PATH%"
) else (
    "%NODE_PATH%" "%VITE_PATH%"
)

echo.
echo =====================================================
echo SERVER STOPPED
echo =====================================================
echo.
pause
