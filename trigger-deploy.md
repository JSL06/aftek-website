# 觸發GitHub Pages部署

## 方法1：手動觸發GitHub Actions

1. 前往 https://github.com/JSL06/aftek-website/actions
2. 點擊 "Deploy to GitHub Pages" 工作流程
3. 點擊 "Run workflow" 按鈕
4. 選擇 "master" 分支
5. 點擊 "Run workflow"

## 方法2：強制推送觸發

```bash
# 創建一個空提交來觸發部署
git commit --allow-empty -m "Trigger deployment"

# 推送到GitHub
git push origin master
```

## 方法3：檢查GitHub Pages設置

1. 前往 https://github.com/JSL06/aftek-website/settings/pages
2. 確保 Source 設置為 "GitHub Actions"
3. 如果設置不正確，請選擇 "GitHub Actions" 作為源

## 方法4：手動構建和部署

如果自動部署不工作，可以手動構建：

```bash
# 構建項目
npm run build

# 檢查dist文件夾是否創建
dir dist

# 推送到GitHub
git add .
git commit -m "Manual build and deploy"
git push origin master
```

## 檢查部署狀態

部署完成後，網站應該在以下地址可用：
https://jsl06.github.io/aftek-website/

注意：可能需要等待5-10分鐘才能看到更改。
