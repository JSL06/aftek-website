@echo off
echo =====================================================
echo START LOCAL WEBSITE - FIXED VERSION
echo =====================================================
echo.
echo This uses the exact same approach that worked before
echo to start your Aftek website locally.
echo.
echo =====================================================
echo CHECKING CURRENT DIRECTORY...
echo =====================================================

REM Navigate to the correct directory
cd /d "%~dp0"

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
echo SETTING UP ENVIRONMENT...
echo =====================================================

REM Set PATH to include our Node.js installation (same as working script)
set PATH=%CD%\node-v22.17.0-win-x64\node-v22.17.0-win-x64;%CD%\node-v22.17.0-win-x64\package\bin;%PATH%

echo ✅ Set PATH to include Node.js and npm
echo.

echo =====================================================
echo CHECKING INSTALLATIONS...
echo =====================================================

REM Check if Node.js is available
if not exist "node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe" (
    echo ❌ Node.js executable not found
    echo Please ensure node-v22.17.0-win-x64 is in the current directory
    echo.
    pause
    exit /b 1
)

echo ✅ Found Node.js at: node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe

REM Check if npm-cli.js is available
if not exist "node-v22.17.0-win-x64\package\bin\npm-cli.js" (
    echo ❌ npm-cli.js not found
    echo Please ensure the package directory contains npm
    echo.
    pause
    exit /b 1
)

echo ✅ Found npm-cli.js at: node-v22.17.0-win-x64\package\bin\npm-cli.js
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
echo CHECKING DEPENDENCIES...
echo =====================================================

REM Check if node_modules exists and has Vite
if not exist "node_modules" (
    echo ❌ node_modules not found - installing dependencies...
    echo.
    goto :install_dependencies
) else (
    REM Check if Vite is properly installed
    if exist "node_modules\vite\bin\vite.js" (
        echo ✅ Vite found at: node_modules\vite\bin\vite.js
        echo ✅ Dependencies are ready
        echo.
        goto :start_server
    ) else if exist "node_modules\.bin\vite" (
        echo ✅ Vite found at: node_modules\.bin\vite
        echo ✅ Dependencies are ready
        echo.
        goto :start_server
    ) else (
        echo ❌ Vite not found in node_modules - reinstalling dependencies...
        echo.
        goto :install_dependencies
    )
)

:install_dependencies
echo =====================================================
echo INSTALLING DEPENDENCIES...
echo =====================================================

REM Clean up any corrupted installations
echo 🗑️  Cleaning up previous installations...
if exist "node_modules" (
    rmdir /s /q node_modules 2>nul
    echo ✅ Removed old node_modules
)

REM Clear npm cache
echo 🧹 Clearing npm cache...
node .\node-v22.17.0-win-x64\package\bin\npm-cli.js cache clean --force
echo ✅ NPM cache cleared
echo.

REM Install dependencies using the working approach
echo 📦 Installing dependencies...
echo This may take several minutes...
echo.

node .\node-v22.17.0-win-x64\package\bin\npm-cli.js install --no-audit --no-fund

if errorlevel 1 (
    echo.
    echo ❌ Failed to install dependencies
    echo Error code: %errorlevel%
    echo.
    echo Please try running this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Verify Vite installation
if exist "node_modules\vite\bin\vite.js" (
    echo ✅ Vite found at: node_modules\vite\bin\vite.js
) else if exist "node_modules\.bin\vite" (
    echo ✅ Vite found at: node_modules\.bin\vite
) else (
    echo ❌ Vite still not found after installation
    echo Checking what was installed...
    dir "node_modules" /b
    echo.
    pause
    exit /b 1
)

echo.

:start_server
echo =====================================================
echo STARTING DEVELOPMENT SERVER...
echo =====================================================

echo 🚀 Starting Vite development server...
echo 📍 Website will be available at: http://localhost:5173
echo 📍 Admin panel: http://localhost:5173/admin
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server using the same approach as before
if exist "node_modules\vite\bin\vite.js" (
    node .\node_modules\vite\bin\vite.js
) else if exist "node_modules\.bin\vite" (
    node .\node_modules\.bin\vite
) else (
    echo ❌ Cannot find Vite to start the server
    pause
    exit /b 1
)

echo.
echo =====================================================
echo SERVER STOPPED
echo =====================================================
echo.
pause
