@echo off
echo =====================================================
echo FIX NODE_MODULES - PATH FIXED VERSION
echo =====================================================
echo.
echo This will fix the corrupted node_modules directory
echo by setting the correct PATH and reinstalling dependencies.
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
echo CHECKING NPM INSTALLATION...
echo =====================================================

REM Check if the working npm exists
if not exist "package\bin\npm" (
    echo ❌ Working npm not found at: package\bin\npm
    echo Please ensure the package directory contains npm
    echo.
    pause
    exit /b 1
)

echo ✅ Found working npm at: package\bin\npm
echo.

echo =====================================================
echo CHECKING NODE.JS INSTALLATION...
echo =====================================================

REM Check if Node.js exists
if not exist "node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe" (
    echo ❌ Node.js not found at: node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe
    echo Please ensure the Node.js installation is present
    echo.
    pause
    exit /b 1
)

echo ✅ Found Node.js at: node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe
echo.

echo =====================================================
echo SETTING UP ENVIRONMENT...
echo =====================================================

REM Set the PATH to include the local Node.js installation
set "NODE_PATH=%~dp0node-v22.17.0-win-x64\node-v22.17.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

echo ✅ Set NODE_PATH to: %NODE_PATH%
echo ✅ Added Node.js to PATH
echo.

REM Test if node is now accessible
echo 🔍 Testing Node.js accessibility...
"%NODE_PATH%\node.exe" --version
if %errorlevel% equ 0 (
    echo ✅ Node.js is now accessible
) else (
    echo ❌ Node.js is still not accessible
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
echo BACKING UP PACKAGE FILES...
echo =====================================================

REM Backup package files
if exist "package.json" (
    copy "package.json" "package.json.backup" >nul
    echo ✅ Backed up package.json
)
if exist "package-lock.json" (
    copy "package-lock.json" "package-lock.json.backup" >nul
    echo ✅ Backed up package-lock.json
)
echo.

echo =====================================================
echo CLEANING CORRUPTED NODE_MODULES...
echo =====================================================

REM Remove corrupted node_modules
if exist "node_modules" (
    echo 🗑️  Removing corrupted node_modules directory...
    rmdir /s /q "node_modules" 2>nul
    if exist "node_modules" (
        echo ❌ Failed to remove node_modules
        echo Trying alternative method...
        rmdir /s /q "node_modules" /q 2>nul
    )
    echo ✅ Removed corrupted node_modules
) else (
    echo ℹ️  node_modules directory not found
)
echo.

echo =====================================================
echo CLEANING NPM CACHE...
echo =====================================================

REM Clean npm cache using working npm with correct PATH
echo 🧹 Cleaning npm cache...
call "package\bin\npm" cache clean --force
echo ✅ NPM cache cleaned
echo.

echo =====================================================
echo REINSTALLING DEPENDENCIES...
echo =====================================================

REM Reinstall dependencies using working npm with correct PATH
echo 📦 Reinstalling dependencies...
echo This may take several minutes...
echo.

call "package\bin\npm" install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Dependencies reinstalled successfully!
    echo.
    echo =====================================================
    echo VERIFYING INSTALLATION...
    echo =====================================================
    
    REM Verify Vite installation
    if exist "node_modules\vite\bin\vite.js" (
        echo ✅ Vite found at: node_modules\vite\bin\vite.js
    ) else if exist "node_modules\.bin\vite" (
        echo ✅ Vite found at: node_modules\.bin\vite
    ) else if exist "node_modules\vite\dist\cli.js" (
        echo ✅ Vite found at: node_modules\vite\dist\cli.js
    ) else (
        echo ❌ Vite not found in expected locations
        echo Checking what was installed...
        dir "node_modules" /b
        echo.
        if exist "node_modules\vite" (
            echo Vite directory contents:
            dir "node_modules\vite" /s /b
        )
    )
    
    echo.
    echo =====================================================
    echo INSTALLATION COMPLETE!
    echo =====================================================
    echo.
    echo You can now run START_LOCAL_WEBSITE.bat
    echo.
) else (
    echo.
    echo ❌ Failed to reinstall dependencies
    echo Error code: %errorlevel%
    echo.
    echo =====================================================
    echo RESTORING BACKUP FILES...
    echo =====================================================
    
    REM Restore backup files
    if exist "package.json.backup" (
        copy "package.json.backup" "package.json" >nul
        echo ✅ Restored package.json
    )
    if exist "package-lock.json.backup" (
        copy "package-lock.json.backup" "package-lock.json" >nul
        echo ✅ Restored package-lock.json
    )
    echo.
    echo Please try running this script again
)

echo.
echo =====================================================
echo PROCESS COMPLETE
echo =====================================================
echo.
pause
