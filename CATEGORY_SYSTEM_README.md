# AFTEK 網站 - 類別管理系統說明

## 🎯 系統概述

這個更新為 AFTEK 網站添加了完整的產品類別管理系統和所見即所得（WYSIWYG）富文本編輯器，讓管理員可以：

- 管理產品類別和分類
- 使用真正的富文本編輯器編輯產品描述
- 插入和調整圖片
- 管理過濾器選項

## 🚀 新功能

### 1. 類別管理器 (`/admin/category-manager`)

**功能特點：**
- ✅ 添加、編輯、刪除產品類別
- ✅ 支持層級類別（父子關係）
- ✅ 重新排序類別顯示順序
- ✅ 啟用/停用類別
- ✅ 類別描述管理

**使用方法：**
1. 前往 `/admin/category-manager`
2. 點擊 "Add New Category" 添加新類別
3. 填寫類別名稱、描述和父類別
4. 使用上下箭頭重新排序
5. 點擊編輯按鈕修改現有類別

### 2. WYSIWYG 富文本編輯器

**功能特點：**
- ✅ 真正的所見即所得編輯（不是 HTML 代碼）
- ✅ 支持粗體、斜體、標題、列表、引用、代碼
- ✅ 圖片插入和方向控制
- ✅ 鍵盤快捷鍵支持
- ✅ 撤銷/重做功能

**鍵盤快捷鍵：**
- `Ctrl+B` - 粗體
- `Ctrl+I` - 斜體
- `Ctrl+U` - 下劃線
- `Ctrl+Z` - 撤銷
- `Ctrl+Y` - 重做
- `Ctrl+A` - 全選

**圖片管理：**
- 支持左對齊、居中、右對齊
- 可調整圖片寬度
- 添加圖片說明
- 自動上傳到 Supabase 存儲

### 3. 過濾器管理器 (`/admin/filter-manager`)

**功能特點：**
- ✅ 管理項目類別、特徵、位置、類型
- ✅ 啟用/停用過濾選項
- ✅ 重新排序顯示順序

## 🗄️ 數據庫更新

### 需要執行的 SQL 腳本

運行 `update-database-categories.sql` 腳本來創建必要的數據庫表：

1. **product_categories** - 產品類別表
2. **filter_options** - 過濾器選項表
3. **products.category_id** - 產品類別關聯

### 默認數據

腳本會自動插入以下默認數據：

**產品類別：**
- Construction Chemicals
- Adhesives & Sealants
- Waterproofing
- Flooring Solutions
- Concrete & Mortar
- Protective Coatings
- Repair & Maintenance
- Industrial Solutions

**過濾器選項：**
- 項目類別（基礎設施、工業、商業等）
- 項目特徵（節能、可持續設計等）
- 項目位置（台灣、東南亞、中國等）
- 項目類型（新建、翻新、維護等）

## 🔧 技術實現

### 組件結構

```
src/
├── components/
│   ├── WYSIWYGEditor.tsx          # 富文本編輯器
│   └── MultilingualFormField.tsx  # 多語言表單字段
├── pages/admin/
│   ├── CategoryManager.tsx         # 類別管理器
│   ├── FilterManager.tsx           # 過濾器管理器
│   └── UnifiedProducts.tsx         # 統一產品管理
└── services/
    └── filterService.ts            # 過濾器服務
```

### 存儲配置

- **圖片存儲桶：** `product-images`
- **圖片路徑：** `product-descriptions/`
- **文件命名：** `{timestamp}_{filename}`

## 📋 部署步驟

### 1. 本地開發

```bash
# 啟動開發服務器
npm run dev

# 或使用批處理文件
start-website.bat
```

### 2. 部署到生產環境

```bash
# 使用部署腳本
DEPLOY-CATEGORIES.bat

# 或手動部署
npm run build
git add .
git commit -m "Update message"
git push origin main
```

### 3. 數據庫更新

1. 登錄 Supabase 控制台
2. 前往 SQL Editor
3. 運行 `update-database-categories.sql` 腳本
4. 驗證表創建成功

## 🧪 測試清單

### 類別管理器測試

- [ ] 添加新類別
- [ ] 編輯現有類別
- [ ] 刪除類別
- [ ] 重新排序類別
- [ ] 啟用/停用類別
- [ ] 設置父類別

### WYSIWYG 編輯器測試

- [ ] 文本格式化（粗體、斜體等）
- [ ] 插入圖片
- [ ] 調整圖片方向和大小
- [ ] 鍵盤快捷鍵
- [ ] 撤銷/重做功能
- [ ] 多語言支持

### 過濾器系統測試

- [ ] 類別過濾器工作正常
- [ ] 新類別出現在過濾器中
- [ ] 過濾器選項可以管理
- [ ] 產品正確關聯到類別

## 🐛 常見問題

### Q: 圖片上傳失敗
**A:** 檢查 Supabase 存儲桶 `product-images` 是否存在且有正確的權限

### Q: 類別不顯示在過濾器中
**A:** 確保類別的 `is_active` 為 true，並且已經重新加載過濾器

### Q: 富文本內容不顯示
**A:** 確保產品描述字段使用 `dangerouslySetInnerHTML` 渲染 HTML 內容

### Q: 數據庫表創建失敗
**A:** 檢查 Supabase 權限，確保有創建表的權限

## 📞 技術支持

如果遇到問題：

1. 檢查瀏覽器控制台錯誤
2. 檢查 Supabase 日誌
3. 驗證數據庫表結構
4. 確認所有依賴已安裝

## 🔄 更新日誌

- **v1.0.0** - 初始版本
  - 添加類別管理器
  - 添加 WYSIWYG 編輯器
  - 修復撤銷/重做功能
  - 添加鍵盤快捷鍵
  - 集成過濾器系統

---

**注意：** 首次使用前必須運行數據庫更新腳本！
