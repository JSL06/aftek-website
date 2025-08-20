@echo off
echo Installing Aftek Website Dependencies...

REM Navigate to the correct directory
cd /d "%~dp0"

REM Set PATH to include our Node.js installation
set PATH=%CD%\node-v22.17.0-win-x64\node-v22.17.0-win-x64;%CD%\node-v22.17.0-win-x64\package\bin;%PATH%

REM Clean up any corrupted installations
echo Cleaning up previous installations...
if exist "node_modules" (
    rmdir /s /q node_modules 2>nul
)

REM Clear npm cache
echo Clearing npm cache...
node .\node-v22.17.0-win-x64\package\bin\npm-cli.js cache clean --force 2>nul

REM Install dependencies
echo Installing dependencies...
node .\node-v22.17.0-win-x64\package\bin\npm-cli.js install --no-audit --no-fund

if errorlevel 1 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo Dependencies installed successfully!
pause
