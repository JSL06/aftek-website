@echo off
echo Simple GitHub Pages Deployment
echo ==============================
echo.

:: Set node path
set NODEPATH=%~dp0node-v22.17.0-win-x64\node-v22.17.0-win-x64
if not exist "%NODEPATH%\node.exe" (
    set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
)

:: Step 1: Build
echo Building...
"%NODEPATH%\npm.cmd" run build

:: Step 2: Check if dist exists
if not exist dist (
    echo Build failed - no dist folder!
    pause
    exit /b 1
)

:: Step 3: Simple deployment steps
echo.
echo Build successful! Now run these commands one by one:
echo.
echo 1. git add dist -f
echo 2. git commit -m "Deploy"
echo 3. git push origin main
echo 4. git subtree push --prefix dist origin gh-pages
echo.
echo Or copy the dist folder contents to a gh-pages branch manually.
echo.
pause 