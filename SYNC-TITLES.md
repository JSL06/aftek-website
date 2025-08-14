# AFTEK網站標題同步指南

## 目標
確保網站上的所有頁面標題、導航標籤和內容標題都與管理頁面同步，保持一致性。

## 已同步的內容

### 1. 頁面標題系統
所有頁面標題現在使用統一的翻譯鍵：

```typescript
// 頁面標題
'page.title.home': 'Home',
'page.title.about': 'About Us',
'page.title.products': 'Products',
'page.title.projects': 'Projects',
'page.title.articles': 'Articles',
'page.title.contact': 'Contact Us',
'page.title.caseStudies': 'Case Studies',
'page.title.media': 'Media',
'page.title.resources': 'Resources',
'page.title.guide': 'Product Guide',

// 管理頁面標題
'page.title.admin': 'Admin Dashboard',
'page.title.admin.products': 'Product Management',
'page.title.admin.projects': 'Project Management',
'page.title.admin.articles': 'Article Management',
'page.title.admin.media': 'Media Management',
'page.title.admin.company': 'Company Management',
'page.title.admin.translations': 'Translation Dashboard',
'page.title.admin.websiteText': 'Website Text Manager',
'page.title.admin.featuredProducts': 'Featured Products Manager',
'page.title.admin.filters': 'Filter Manager',
'page.title.admin.guide': 'Guide Manager',
```

### 2. 區段標題系統
網站內容區段使用統一的標題：

```typescript
// 區段標題
'section.header.hero': 'Hero Section',
'section.header.mission': 'Mission Statement',
'section.header.services': 'Our Services',
'section.header.about': 'About Aftek',
'section.header.explore': 'Explore Our Solutions',
'section.header.brochure': 'Download Our Catalog',
'section.header.projects': 'Past Projects',
'section.header.recommended': 'Recommended Products',
'section.header.featured': 'Featured Products',
'section.header.reviews': 'Client Reviews',
'section.header.footer': 'Footer Information',
'section.header.contact': 'Contact Information',
'section.header.company': 'Company Information',
'section.header.leadership': 'Leadership Team',
'section.header.timeline': 'Company Timeline',
'section.header.values': 'Company Values',
```

### 3. 管理頁面通用元素
```typescript
// 管理頁面通用
'admin.common.backToDashboard': 'Back to Dashboard',
'admin.products.pageDescription': 'Manage your product catalog',
'admin.products.addProduct': 'Add Product',
```

## 使用方法

### 在頁面組件中使用
```typescript
import { useTranslation } from '@/hooks/useTranslation';

const MyPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.title.products')}</h1>
      <h2>{t('section.header.services')}</h2>
    </div>
  );
};
```

### 在管理頁面中使用
```typescript
import { useTranslation } from '@/hooks/useTranslation';

const AdminPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.title.admin.products')}</h1>
      <p>{t('admin.products.pageDescription')}</p>
    </div>
  );
};
```

## 同步檢查清單

### 需要檢查的頁面
- [x] Home.tsx - 主頁標題和區段
- [x] Products.tsx - 產品頁面標題
- [x] About.tsx - 關於我們頁面標題
- [x] Projects.tsx - 項目頁面標題
- [x] Articles.tsx - 文章頁面標題
- [x] Contact.tsx - 聯繫我們頁面標題
- [x] Navigation.tsx - 導航標籤
- [x] AdminDashboard.tsx - 管理儀表板標題
- [x] WebsiteTextManager.tsx - 網站文字管理器標題
- [x] Products.tsx (admin) - 產品管理標題

### 需要檢查的組件
- [ ] ProductCard.tsx - 產品卡片標題
- [ ] ProjectCard.tsx - 項目卡片標題
- [ ] ArticleCard.tsx - 文章卡片標題
- [ ] Footer.tsx - 頁腳標題

## 維護指南

### 添加新頁面時
1. 在翻譯文件中添加頁面標題鍵
2. 在頁面組件中使用翻譯函數
3. 確保管理頁面也使用相同的標題系統

### 修改現有標題時
1. 只修改翻譯文件中的值
2. 不要硬編碼任何標題文字
3. 測試所有語言版本的顯示

### 添加新語言時
1. 複製現有翻譯文件
2. 翻譯所有標題和標籤
3. 確保頁面標題與導航標籤一致

## 最佳實踐

1. **一致性**: 所有頁面標題都應該使用翻譯系統
2. **可維護性**: 避免硬編碼任何文字
3. **用戶體驗**: 標題應該清晰、簡潔、一致
4. **多語言支持**: 確保所有語言版本都有適當的標題

## 故障排除

### 常見問題
1. **標題不顯示**: 檢查翻譯鍵是否正確
2. **語言切換問題**: 確保所有語言都有對應的翻譯
3. **管理頁面不同步**: 使用統一的標題鍵

### 調試技巧
1. 使用瀏覽器開發者工具檢查翻譯鍵
2. 檢查控制台是否有翻譯錯誤
3. 驗證翻譯文件格式是否正確

---
*最後更新：2025-08-14*
*同步狀態：進行中*
