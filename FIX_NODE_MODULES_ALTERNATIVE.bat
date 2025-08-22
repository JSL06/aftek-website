@echo off
echo =====================================================
echo FIX NODE_MODULES - ALTERNATIVE APPROACHES
echo =====================================================
echo.
echo This script tries multiple approaches to fix dependencies
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
echo APPROACH 1: TRYING GLOBAL NPM...
echo =====================================================

REM Try to use global npm if available
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Global npm found, trying to use it...
    echo.
    
    REM Clean npm cache
    echo 🧹 Cleaning npm cache...
    npm cache clean --force
    echo ✅ NPM cache cleaned
    echo.
    
    REM Remove corrupted node_modules
    if exist "node_modules" (
        echo 🗑️  Removing corrupted node_modules...
        rmdir /s /q "node_modules" 2>nul
        echo ✅ Removed corrupted node_modules
    )
    echo.
    
    REM Install dependencies
    echo 📦 Installing dependencies with global npm...
    npm install
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ SUCCESS! Dependencies installed with global npm
        goto :verify_installation
    ) else (
        echo.
        echo ❌ Global npm failed, trying next approach...
        echo.
    )
) else (
    echo ℹ️  Global npm not found, trying next approach...
    echo.
)

echo =====================================================
echo APPROACH 2: TRYING LOCAL PACKAGE NPM...
echo =====================================================

REM Try to use the local package npm
if exist "package\bin\npm" (
    echo ✅ Local package npm found, trying to use it...
    echo.
    
    REM Clean npm cache
    echo 🧹 Cleaning npm cache...
    call "package\bin\npm" cache clean --force
    echo ✅ NPM cache cleaned
    echo.
    
    REM Remove corrupted node_modules
    if exist "node_modules" (
        echo 🗑️  Removing corrupted node_modules...
        rmdir /s /q "node_modules" 2>nul
        echo ✅ Removed corrupted node_modules
    )
    echo.
    
    REM Install dependencies
    echo 📦 Installing dependencies with local package npm...
    call "package\bin\npm" install
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ SUCCESS! Dependencies installed with local package npm
        goto :verify_installation
    ) else (
        echo.
        echo ❌ Local package npm failed, trying next approach...
        echo.
    )
) else (
    echo ❌ Local package npm not found
    echo.
)

echo =====================================================
echo APPROACH 3: TRYING NODE DIRECTLY...
echo =====================================================

REM Try to use Node.js directly to run npm
if exist "node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe" (
    echo ✅ Local Node.js found, trying to use it directly...
    echo.
    
    REM Try to run npm through Node.js
    echo 📦 Trying to install dependencies directly with Node.js...
    "node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe" -e "
      const { execSync } = require('child_process');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('SUCCESS: Dependencies installed');
      } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
      }
    "
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ SUCCESS! Dependencies installed with Node.js
        goto :verify_installation
    ) else (
        echo.
        echo ❌ Node.js direct approach failed
        echo.
    )
) else (
    echo ❌ Local Node.js not found
    echo.
)

echo =====================================================
echo ALL APPROACHES FAILED
echo =====================================================
echo.
echo ❌ None of the approaches worked
echo.
echo SUGGESTIONS:
echo 1. Check your internet connection
echo 2. Try running as Administrator
echo 3. Download a fresh Node.js installation
echo 4. Use the GitHub Pages deployment instead
echo.
echo For now, you can still use GitHub Pages at:
echo https://jsl06.github.io/aftek-website/
echo.
pause
exit /b 1

:verify_installation
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
pause
