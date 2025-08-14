# AFTEK 多公司網站架構

這個網站現在支持多公司管理，允許在單一平台上管理多個公司的品牌和內容。

## 架構概述

### 公司配置
- **Aftek**: 主要公司，使用紅色主題 (`/` 和 `/aftek`)
- **RLA Polymers**: 藍色主題 (`/rla`)
- **ITLS**: 綠色主題 (`/itls`)

### 共享功能
- 產品目錄（所有公司共享）
- 管理儀表板
- 用戶認證系統
- 多語言支持

### 公司特定功能
- 品牌標識（標誌、顏色、名稱）
- 聯繫信息
- 路由結構

## 文件結構

```
src/
├── config/
│   └── companies.ts          # 公司配置文件
├── contexts/
│   └── CompanyContext.tsx    # 公司上下文提供者
├── components/
│   └── admin/
│       └── CompanySelector.tsx  # 公司選擇器組件
└── pages/
    └── admin/
        └── AdminDashboard.tsx   # 更新的管理儀表板
```

## 使用方法

### 1. 訪問不同公司
- **Aftek**: `http://localhost:5173/` 或 `http://localhost:5173/aftek`
- **RLA Polymers**: `http://localhost:5173/rla`
- **ITLS**: `http://localhost:5173/itls`

### 2. 管理功能
- 訪問 `/admin` 進入管理儀表板
- 使用"切換公司"按鈕選擇要管理的公司
- 所有管理功能在所有公司間保持一致

### 3. 品牌自定義
每個公司可以自定義：
- 公司名稱和顯示名稱
- 標誌圖片
- 主要顏色主題
- 聯繫信息

## 配置新公司

### 1. 添加公司配置
在 `src/config/companies.ts` 中添加新公司：

```typescript
export const companies = {
  // ... 現有公司
  newCompany: {
    id: 'newCompany',
    name: 'New Company',
    displayName: 'New Company Ltd.',
    logo: '/logos/new-company.png',
    primaryColor: '#your-color',
    secondaryColor: '#your-secondary-color',
    accentColor: '#your-accent-color',
    domain: 'newcompany.example.com',
    route: '/newcompany',
    description: 'Company description',
    contactInfo: {
      phone: '+1234567890',
      email: 'info@newcompany.com',
      address: 'Company address'
    }
  }
};
```

### 2. 添加路由
在 `src/App.tsx` 中添加新公司的路由：

```typescript
<Route path="/newcompany" element={<Layout />}>
  <Route index element={<ProtectedPage pageName="home"><Home /></ProtectedPage>} />
  <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
  // ... 其他路由
</Route>
```

### 3. 添加標誌
將公司標誌放在 `public/logos/` 目錄中。

## 技術實現

### 公司上下文
`CompanyContext` 提供：
- 當前選中的公司
- 公司切換功能
- 路由檢測
- CSS 變量更新

### 路由檢測
系統自動檢測 URL 路徑來確定當前公司：
- `/aftek/*` → Aftek
- `/rla/*` → RLA Polymers  
- `/itls/*` → ITLS
- `/*` → 默認 Aftek

### CSS 變量
每個公司使用 CSS 自定義屬性：
```css
:root {
  --company-primary: #dc2626;    /* Aftek 紅色 */
  --company-secondary: #1f2937;  /* Aftek 深灰 */
  --company-accent: #f59e0b;     /* Aftek 琥珀色 */
}
```

## 最佳實踐

### 1. 組件開發
- 使用 `useCompany()` hook 獲取當前公司信息
- 避免硬編碼公司特定內容
- 使用翻譯鍵而不是硬編碼文本

### 2. 樣式設計
- 使用 CSS 變量而不是硬編碼顏色
- 確保所有公司主題都有一致的視覺層次
- 測試不同顏色主題的可讀性

### 3. 內容管理
- 保持產品目錄的一致性
- 使用公司特定的聯繫信息
- 確保品牌標識的正確使用

## 故障排除

### 常見問題

1. **公司切換不工作**
   - 檢查 `CompanyContext` 是否正確包裝
   - 確認路由配置正確

2. **樣式不更新**
   - 檢查 CSS 變量是否正確設置
   - 確認組件使用了正確的 CSS 類

3. **路由錯誤**
   - 檢查 `App.tsx` 中的路由配置
   - 確認公司配置中的 `route` 屬性正確

### 調試技巧

1. 使用瀏覽器開發者工具檢查 CSS 變量
2. 在控制台查看公司上下文狀態
3. 檢查路由參數和公司檢測邏輯

## 未來擴展

### 計劃功能
- 公司特定的內容管理
- 獨立的用戶權限系統
- 公司特定的分析報告
- 自定義域名支持

### 架構改進
- 微服務架構支持
- 數據庫分離選項
- API 版本控制
- 緩存策略優化

## 聯繫支持

如有問題或建議，請聯繫開發團隊或查看項目文檔。
