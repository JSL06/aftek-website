@echo off
echo Starting Aftek React App...
echo.
echo Using local Node.js installation...
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting Vite development server...
echo.
echo The app will open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
pause
.\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js
pause
