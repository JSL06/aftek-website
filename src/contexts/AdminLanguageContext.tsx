import React, { createContext, useContext, useState, ReactNode } from 'react';

type AdminLanguage = 'en' | 'zh-Hant';

interface AdminLanguageContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  t: (key: string) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

// Admin panel translations
const translations = {
  en: {
    // Navigation
    'nav.back': 'Back',
    'nav.products': 'Products',
    'nav.articles': 'Articles',
    'nav.projects': 'Projects',
    'nav.categories': 'Categories',
    'nav.featured': 'Featured Products',
    'nav.media': 'Media',
    'nav.company': 'Company',
    'nav.guide': 'Guide Content',
    'nav.filters': 'Filters',
    'nav.website': 'Website Text',
    'nav.translations': 'Translations',
    'nav.dashboard': 'Dashboard',
    
    // Basic Info
    'basic.title': 'Basic Information',
    'basic.category': 'Category',
    'basic.model': 'Model',
    'basic.inStock': 'In Stock',
    'basic.showInFeatured': 'Show in Featured',
    'basic.isActive': 'Product Active',
    
    // Multilingual Content
    'multilingual.title': 'Multilingual Content',
    'multilingual.productName': 'Product Name',
    'multilingual.productDescription': 'Product Description',
    'multilingual.enterName': 'Enter product name',
    'multilingual.enterDescription': 'Enter product description...',
    'multilingual.simpleTextInput': 'Simple text input for product name',
    'multilingual.richTextEditor': 'Rich text editor with basic formatting: bold, italic, alignment, and images',
    
    // Actions
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.create': 'Create',
    'actions.update': 'Update',
    'actions.loading': 'Loading...',
    'actions.saving': 'Saving...',
    
    // Messages
    'messages.loading': 'Loading product...',
    'messages.notFound': 'Product not found',
    'messages.backToProducts': 'Back to Products',
    'messages.saveSuccess': 'Product saved successfully!',
    'messages.saveAndReload': 'Product saved and reloaded! Check the data below.',
    'messages.loadError': 'Failed to load product',
    'messages.saveError': 'Failed to save product',
    
    // Admin Layout
    'admin.search.placeholder': 'Search content, media, settings...',
    'admin.search.shortcut': '⌘K',
    'admin.notifications.title': 'Notifications',
    'admin.notifications.clearAll': 'Clear all',
    'admin.notifications.noNotifications': 'No notifications',
    'admin.user.settings': 'Settings',
    'admin.user.logout': 'Logout',
    'admin.theme.light': 'Light',
    'admin.theme.dark': 'Dark',
    'admin.theme.system': 'System',
    'admin.theme.toggle': 'Toggle theme',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.contentManagement': 'Content Management',
    'sidebar.products': 'Products',
    'sidebar.projects': 'Projects',
    'sidebar.articles': 'Articles',
    'sidebar.media': 'Media Library',
    'sidebar.translations': 'Translations',
    'sidebar.analytics': 'Analytics',
    'sidebar.users': 'User Management',
    'sidebar.settings': 'System Settings',
    'sidebar.categories': 'Categories',
    'sidebar.features': 'Features',
    'sidebar.featuredProducts': 'Featured Products',
    'sidebar.guideContent': 'Guide Content',
    'sidebar.filters': 'Filters',
    'sidebar.websiteText': 'Website Text',
    'sidebar.createContent': 'Create Content',
    'sidebar.uploadMedia': 'Upload Media',
    
    // Media Management
    'media.title': 'Media Management',
    'media.description': 'Manage media files and resources',
    'media.loading': 'Loading media...',
    'media.saveChanges': 'Save Changes',
    'media.saving': 'Saving...',
    'media.totalMedia': 'Total Media',
    'media.activeMedia': 'Active Media',
    'media.pendingChanges': 'Pending Changes',
    'media.mediaStatus': 'Media Status',
    'media.toggleDescription': 'Toggle media to enable/disable',
    'media.uploadMedia': 'Upload Media',
    'media.mediaName': 'Media Name',
    'media.mediaType': 'Media Type',
    'media.mediaCategory': 'Media Category',
    'media.mediaDescription': 'Media Description',
    'media.mediaFile': 'Media File',
    'media.mediaThumbnail': 'Media Thumbnail',
    'media.editMedia': 'Edit Media',
    'media.mediaDetails': 'Media Details',
    'media.imagePreview': 'Image Preview',
    'media.editDetails': 'Edit Details',
    'media.descriptionLabel': 'Description',
    'media.page': 'Page',
    'media.public': 'Public (Show on website)',
    'media.saveMedia': 'Save Media',
    'media.cancel': 'Cancel',
    'media.backToMedia': 'Back to Media',
    'media.uploadNewMedia': 'Upload New Media',
    'media.selectFile': 'Select File',
    'media.fileSelected': 'File Selected',
    'media.noFileSelected': 'No file selected',
    'media.upload': 'Upload',
    'media.close': 'Close',
    'media.delete': 'Delete',
    'media.confirmDelete': 'Are you sure you want to delete this media?',
    'media.deleteSuccess': 'Media deleted successfully',
    'media.deleteError': 'Error deleting media',
    'media.updateSuccess': 'Media updated successfully',
    'media.updateError': 'Error updating media',
    'media.uploadSuccess': 'Media uploaded successfully',
    'media.uploadError': 'Error uploading media',
    'media.fileInfo': 'File Information',
    'media.file': 'File',
    'media.size': 'Size',
    'media.dimensions': 'Dimensions',
    'media.type': 'Type',
    'media.editingAt': 'This image is being edited at',
    'media.noMediaFound': 'No media files found',
    'media.noDescription': 'No description',
    'media.selectPage': 'Select a page...',
    'media.descriptionPlaceholder': 'Enter description...',
    
    // Language Names
    'language.en': 'English',
    'language.zh-Hant': 'Traditional Chinese',
    'language.ja': 'Japanese',
    'language.ko': 'Korean',
    'language.th': 'Thai',
    'language.vi': 'Vietnamese',
    
    // Language Native Names
    'language.native.en': 'English',
    'language.native.zh-Hant': '繁體中文',
    'language.native.ja': '日本語',
    'language.native.ko': '한국어',
    'language.native.th': 'ไทย',
    'language.native.vi': 'Tiếng Việt',
  },
  'zh-Hant': {
    // Navigation
    'nav.back': '返回',
    'nav.products': '產品',
    'nav.articles': '文章',
    'nav.projects': '專案',
    'nav.categories': '分類',
    'nav.featured': '特色產品',
    'nav.media': '媒體',
    'nav.company': '公司',
    'nav.guide': '指南內容',
    'nav.filters': '篩選器',
    'nav.website': '網站文字',
    'nav.translations': '翻譯',
    'nav.dashboard': '儀表板',
    
    // Basic Info
    'basic.title': '基本信息',
    'basic.category': '類別',
    'basic.model': '型號',
    'basic.inStock': '有庫存',
    'basic.showInFeatured': '顯示在特色產品中',
    'basic.isActive': '產品啟用',
    
    // Multilingual Content
    'multilingual.title': '多語言內容',
    'multilingual.productName': '產品名稱',
    'multilingual.productDescription': '產品描述',
    'multilingual.enterName': '輸入產品名稱',
    'multilingual.enterDescription': '輸入產品描述...',
    'multilingual.simpleTextInput': '產品名稱的簡單文字輸入',
    'multilingual.richTextEditor': '具有基本格式的富文字編輯器：粗體、斜體、對齊和圖片',
    
    // Actions
    'actions.save': '保存',
    'actions.cancel': '取消',
    'actions.edit': '編輯',
    'actions.delete': '刪除',
    'actions.create': '創建',
    'actions.update': '更新',
    'actions.loading': '載入中...',
    'actions.saving': '保存中...',
    
    // Messages
    'messages.loading': '載入產品中...',
    'messages.notFound': '找不到產品',
    'messages.backToProducts': '返回產品列表',
    'messages.saveSuccess': '產品保存成功！',
    'messages.saveAndReload': '產品已保存並重新載入！請檢查下面的數據。',
    'messages.loadError': '載入產品失敗',
    'messages.saveError': '保存產品失敗',
    
    // Admin Layout
    'admin.search.placeholder': '搜尋內容、媒體、設定...',
    'admin.search.shortcut': '⌘K',
    'admin.notifications.title': '通知',
    'admin.notifications.clearAll': '全部清除',
    'admin.notifications.noNotifications': '沒有通知',
    'admin.user.settings': '設定',
    'admin.user.logout': '登出',
    'admin.theme.light': '淺色',
    'admin.theme.dark': '深色',
    'admin.theme.system': '系統',
    'admin.theme.toggle': '切換主題',
    
    // Sidebar
    'sidebar.dashboard': '儀表板',
    'sidebar.contentManagement': '內容管理',
    'sidebar.products': '產品',
    'sidebar.projects': '專案',
    'sidebar.articles': '文章',
    'sidebar.media': '媒體庫',
    'sidebar.translations': '翻譯',
    'sidebar.analytics': '分析',
    'sidebar.users': '用戶管理',
    'sidebar.settings': '系統設定',
    'sidebar.categories': '分類',
    'sidebar.features': '特性',
    'sidebar.featuredProducts': '特色產品',
    'sidebar.guideContent': '指南內容',
    'sidebar.filters': '篩選器',
    'sidebar.websiteText': '網站文字',
    'sidebar.createContent': '創建內容',
    'sidebar.uploadMedia': '上傳媒體',
    
    // Media Management
    'media.title': '媒體管理',
    'media.description': '管理媒體文件和資源',
    'media.loading': '載入媒體中...',
    'media.saveChanges': '保存變更',
    'media.saving': '保存中...',
    'media.totalMedia': '總媒體',
    'media.activeMedia': '啟用媒體',
    'media.pendingChanges': '待處理變更',
    'media.mediaStatus': '媒體狀態',
    'media.toggleDescription': '切換媒體以啟用/停用',
    'media.uploadMedia': '上傳媒體',
    'media.mediaName': '媒體名稱',
    'media.mediaType': '媒體類型',
    'media.mediaCategory': '媒體類別',
    'media.mediaDescription': '媒體描述',
    'media.mediaFile': '媒體文件',
    'media.mediaThumbnail': '媒體縮圖',
    'media.editMedia': '編輯媒體',
    'media.mediaDetails': '媒體詳情',
    'media.imagePreview': '圖片預覽',
    'media.editDetails': '編輯詳情',
    'media.descriptionLabel': '描述',
    'media.page': '頁面',
    'media.public': '公開 (網站上顯示)',
    'media.saveMedia': '保存媒體',
    'media.cancel': '取消',
    'media.backToMedia': '返回媒體',
    'media.uploadNewMedia': '上傳新媒體',
    'media.selectFile': '選擇文件',
    'media.fileSelected': '文件已選擇',
    'media.noFileSelected': '未選擇文件',
    'media.upload': '上傳',
    'media.close': '關閉',
    'media.delete': '刪除',
    'media.confirmDelete': '您確定要刪除此媒體嗎？',
    'media.deleteSuccess': '媒體刪除成功',
    'media.deleteError': '刪除媒體失敗',
    'media.updateSuccess': '媒體更新成功',
    'media.updateError': '更新媒體失敗',
    'media.uploadSuccess': '媒體上傳成功',
    'media.uploadError': '上傳媒體失敗',
    'media.fileInfo': '文件資訊',
    'media.file': '文件',
    'media.size': '大小',
    'media.dimensions': '尺寸',
    'media.type': '類型',
    'media.editingAt': '此圖片正在編輯中',
    'media.noMediaFound': '未找到媒體文件',
    'media.noDescription': '無描述',
    'media.selectPage': '選擇頁面...',
    'media.descriptionPlaceholder': '輸入描述...',
    
    // Language Names
    'language.en': 'English',
    'language.zh-Hant': '繁體中文',
    'language.zh-Hans': '简体中文',
    'language.ja': '日本語',
    'language.ko': '한국어',
    'language.th': 'ไทย',
    'language.vi': 'Tiếng Việt',
    
    // Language Native Names
    'language.native.en': 'English',
    'language.native.zh-Hant': '繁體中文',
    'language.native.zh-Hans': '简体中文',
    'language.native.ja': '日本語',
    'language.native.ko': '한국어',
    'language.native.th': 'ไทย',
    'language.native.vi': 'Tiếng Việt',
  }
};

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<AdminLanguage>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = (): AdminLanguageContextType => {
  const context = useContext(AdminLanguageContext);
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return context;
};
