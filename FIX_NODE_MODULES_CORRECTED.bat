@echo off
echo =====================================================
echo FIX CORRUPTED NODE_MODULES - CORRECTED VERSION
echo =====================================================
echo.
echo This will fix the corrupted node_modules directory
echo by cleaning and reinstalling all dependencies.
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
echo KILLING EXISTING NODE PROCESSES...
====================================================

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
====================================================

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
====================================================

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
====================================================

REM Clean npm cache using working npm
echo 🧹 Cleaning npm cache...
call "package\bin\npm" cache clean --force
echo ✅ NPM cache cleaned
echo.

echo =====================================================
echo REINSTALLING DEPENDENCIES...
====================================================

REM Reinstall dependencies using working npm
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
    =====================================================
    
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
    =====================================================
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
    =====================================================
    
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
====================================================
echo.
pause
