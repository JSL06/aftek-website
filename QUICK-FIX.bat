@echo off
echo ========================================
echo AFTEK網站快速修復腳本
echo ========================================
echo.

echo 正在檢查git狀態...
git status
echo.

echo 正在安裝所有依賴包...
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install"
echo.

echo 正在測試構建...
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build"
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✅ 構建成功！正在同步到GitHub...
    echo.
    
    git add .
    git commit -m "自動修復和同步 - %date% %time%"
    git push origin master
    
    echo.
    echo 🎉 所有問題已修復並同步到GitHub！
    echo GitHub Actions將自動重新運行構建。
) else (
    echo ❌ 構建失敗，請檢查錯誤信息。
)

echo.
echo 按任意鍵退出...
pause >nul
