# AFTEK網站部署腳本

## 快速部署命令

當需要同步本地更改到GitHub並修復構建問題時，運行以下腳本：

### 1. 同步本地更改到GitHub
```bash
# 檢查狀態
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "同步本地更改到GitHub"

# 推送到GitHub
git push origin master
```

### 2. 修復依賴問題（如果GitHub Actions構建失敗）
```bash
# 安裝缺失的依賴包
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install @vitejs/plugin-react-swc next-themes @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-collapsible @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-radio-group @radix-ui/react-toggle @radix-ui/react-toggle-group"

# 測試本地構建
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build"

# 提交依賴修復
git add package.json package-lock.json
git commit -m "修復依賴問題"
git push origin master
```

### 3. 完整的一鍵修復腳本
```bash
# 安裝所有依賴並構建
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install"
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\node.exe .\node_modules\vite\bin\vite.js build"

# 同步到GitHub
git add .
git commit -m "自動修復和同步"
git push origin master
```

## 常見問題解決

### 問題：GitHub Actions構建失敗 - @vitejs/plugin-react-swc缺失
**解決方案：**
```bash
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install --save-dev @vitejs/plugin-react-swc"
```

### 問題：構建時缺少radix-ui組件
**解決方案：**
```bash
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-collapsible @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-radio-group @radix-ui/react-toggle @radix-ui/react-toggle-group"
```

### 問題：PowerShell執行策略阻止npm運行
**解決方案：**
```bash
cmd /c ".\node-v22.17.0-win-x64\node-v22.17.0-win-x64\npm install"
```

## 重要路徑
- **Node.js路徑：** `.\node-v22.17.0-win-x64\node-v22.17.0-win-x64\`
- **本地開發服務器：** `localhost:5173`
- **GitHub Pages：** `jsl06.github.io/aftek-website/`
- **管理員登錄：** `admin/aftek2024`

## 使用說明
1. 複製需要的命令到終端
2. 確保在`aftek-website`目錄中
3. 如果遇到權限問題，使用`cmd /c`前綴
4. 構建成功後記得提交並推送到GitHub

---
*最後更新：2025-08-14*
*腳本狀態：✅ 測試通過*
