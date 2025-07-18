import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Import local translation files
import enTranslations from '@/locales/en';
import jaTranslations from '@/locales/ja';
import koTranslations from '@/locales/ko';
import thTranslations from '@/locales/th';
import viTranslations from '@/locales/vi';
import zhHansTranslations from '@/locales/zh-Hans';
import zhHantTranslations from '@/locales/zh-Hant';

export type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface Translation {
  key: string;
  section: string;
  language: Language;
  value: string;
}

interface Translations {
  [key: string]: string | string[];
}

// Local translations object
const localTranslations: { [K in Language]: Translations } = {
  'en': enTranslations,
  'ja': jaTranslations,
  'ko': koTranslations,
  'th': thTranslations,
  'vi': viTranslations,
  'zh-Hans': zhHansTranslations,
  'zh-Hant': zhHantTranslations,
};

// Debug: Check if translations are loaded
console.log('Local translations loaded:', {
  en: Object.keys(enTranslations).length,
  ja: Object.keys(jaTranslations).length,
  ko: Object.keys(koTranslations).length,
  th: Object.keys(thTranslations).length,
  vi: Object.keys(viTranslations).length,
  zhHans: Object.keys(zhHansTranslations).length,
  zhHant: Object.keys(zhHantTranslations).length,
});

// Debug: Check admin keys in Traditional Chinese
console.log('Admin keys in Traditional Chinese:', Object.keys(zhHantTranslations).filter(k => k.startsWith('admin.')));

// Basic fallback translations for critical navigation items
const fallbackTranslations: { [key: string]: { [K in Language]: string } } = {
  // Navigation
  'nav.home': {
    'en': 'Home',
    'ja': 'ホーム',
    'ko': '홈',
    'th': 'หน้าแรก',
    'vi': 'Trang chủ',
    'zh-Hans': '首页',
    'zh-Hant': '首頁'
  },
  'nav.about': {
    'en': 'About',
    'ja': '会社概要',
    'ko': '회사소개',
    'th': 'เกี่ยวกับเรา',
    'vi': 'Về chúng tôi',
    'zh-Hans': '关于我们',
    'zh-Hant': '關於我們'
  },
  'nav.products': {
    'en': 'Products',
    'ja': '製品',
    'ko': '제품',
    'th': 'ผลิตภัณฑ์',
    'vi': 'Sản phẩm',
    'zh-Hans': '产品',
    'zh-Hant': '產品'
  },
  'nav.projects': {
    'en': 'Projects',
    'ja': 'プロジェクト',
    'ko': '프로젝트',
    'th': 'โครงการ',
    'vi': 'Dự án',
    'zh-Hans': '项目',
    'zh-Hant': '專案'
  },
  'nav.articles': {
    'en': 'Articles',
    'ja': '記事',
    'ko': '기사',
    'th': 'บทความ',
    'vi': 'Bài viết',
    'zh-Hans': '文章',
    'zh-Hant': '文章'
  },
  'nav.contact': {
    'en': 'Contact',
    'ja': 'お問い合わせ',
    'ko': '연락처',
    'th': 'ติดต่อ',
    'vi': 'Liên hệ',
    'zh-Hans': '联系',
    'zh-Hant': '聯絡'
  },
  'nav.guide': {
    'en': 'Guide',
    'ja': 'ガイド',
    'ko': '가이드',
    'th': 'คู่มือ',
    'vi': 'Hướng dẫn',
    'zh-Hans': '指南',
    'zh-Hant': '指南'
  },
};

export const useTranslation = () => {
  // Initialize language from localStorage or default to 'zh-Hant' (Traditional Chinese)
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aftek-language');
      if (saved && Object.keys(localTranslations).includes(saved)) {
        return saved as Language;
      }
    }
    return 'zh-Hant';
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Test translation function immediately
  console.log('Current language:', currentLanguage);
  console.log('Local translations for current language:', Object.keys(localTranslations[currentLanguage] || {}).length);
  console.log('Test admin key:', localTranslations[currentLanguage]?.['admin.dashboard.title']);

  // Fetch translations from Supabase with local fallback
  const fetchTranslations = async (language: Language) => {
    console.log('Fetching translations for language:', language);
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('key, value')
        .eq('language', language);

      if (error) {
        console.error('Error fetching translations:', error);
        // Use local translations as primary fallback
        console.log('Using local translations as fallback for:', language);
        setTranslations(localTranslations[language] || localTranslations['zh-Hant']);
      } else {
        // Start with local translations as base
        const mergedTranslations: Translations = {};
        
        // Add local translations as base (fallback)
        const localTrans = localTranslations[language] || localTranslations['zh-Hant'];
        console.log('Local translations for', language, ':', Object.keys(localTrans).filter(k => k.startsWith('admin.')));
        Object.keys(localTrans).forEach(key => {
          mergedTranslations[key] = localTrans[key];
        });
        
        // Add database translations with higher priority (overwrite local translations)
        data?.forEach(item => {
          mergedTranslations[item.key] = item.value;
        });
        
        console.log('Final merged translations for', language, ':', Object.keys(mergedTranslations).filter(k => k.startsWith('admin.')));
        setTranslations(mergedTranslations);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
      // Use local translations as fallback
      console.log('Using local translations as fallback due to error for:', language);
      setTranslations(localTranslations[language] || localTranslations['zh-Hant']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(currentLanguage);
    // Set the lang attribute on initial load
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail as Language;
      if (newLanguage && newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
      }
    };

    // Handle page visibility changes to ensure language sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const savedLanguage = localStorage.getItem('aftek-language');
        if (savedLanguage && savedLanguage !== currentLanguage && Object.keys(localTranslations).includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage as Language);
        }
      }
    };

    // Handle storage changes (when language is changed in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'aftek-language' && event.newValue) {
        const newLanguage = event.newValue as Language;
        if (Object.keys(localTranslations).includes(newLanguage) && newLanguage !== currentLanguage) {
          setCurrentLanguage(newLanguage);
        }
      }
    };

    // Handle translation updates from admin panel
    const handleTranslationUpdate = () => {
      fetchTranslations(currentLanguage);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('translationUpdate', handleTranslationUpdate);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('translationUpdate', handleTranslationUpdate);
    };
  }, [currentLanguage]);

  const t = (key: string): string => {
    const getValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value || key;
    };

    // Debug logging for admin keys
    if (key.startsWith('admin.')) {
      console.log('Translation request for:', key, 'Current language:', currentLanguage);
      console.log('Local translations available:', Object.keys(localTranslations[currentLanguage] || {}).filter(k => k.startsWith('admin.')));
      console.log('Database translations available:', Object.keys(translations).filter(k => k.startsWith('admin.')));
    }

    // First check database translations (highest priority)
    if (!loading) {
      const translation = translations[key];
      if (translation) {
        return getValue(translation);
      }
    }

    // Then check local translations as fallback
    const localTrans = localTranslations[currentLanguage] || localTranslations['zh-Hant'];
    const localValue = localTrans[key];
    if (localValue) {
      return getValue(localValue);
    }

    // Force check Traditional Chinese for admin keys
    if (key.startsWith('admin.') && currentLanguage !== 'zh-Hant') {
      const zhHantValue = localTranslations['zh-Hant']?.[key];
      if (zhHantValue) {
        console.log('Using Traditional Chinese fallback for:', key, zhHantValue);
        return getValue(zhHantValue);
      }
    }

    // Then check fallback translations - prioritize Traditional Chinese
    const fallbackValue = fallbackTranslations[key]?.[currentLanguage] || 
                         fallbackTranslations[key]?.['zh-Hant'] || 
                         fallbackTranslations[key]?.['en'];
    if (fallbackValue) {
      return getValue(fallbackValue);
    }
    
    // Last resort: return the key itself
    return key;
  };

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Persist language choice to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aftek-language', language);
    }
    // Set the lang attribute on the HTML element for CSS language selectors
    document.documentElement.lang = language;
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
  };

  // Force refresh translations for current language
  const refreshTranslations = async () => {
    setRefreshing(true);
    try {
      await fetchTranslations(currentLanguage);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    loading,
    refreshing,
    fetchTranslations,
    refreshTranslations
  };
};