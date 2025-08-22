@echo off
echo =====================================================
echo FIX CORRUPTED NODE_MODULES
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

REM Clean npm cache
echo 🧹 Cleaning npm cache...
call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd cache clean --force
echo ✅ NPM cache cleaned
echo.

echo =====================================================
echo REINSTALLING DEPENDENCIES...
echo =====================================================

REM Reinstall dependencies using local npm
echo 📦 Reinstalling dependencies...
echo This may take several minutes...
echo.

call .\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm.cmd install

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
    ) else (
        echo ❌ Vite not found in expected location
        echo Checking alternative locations...
        dir "node_modules\vite" /s /b | findstr "vite.js"
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
