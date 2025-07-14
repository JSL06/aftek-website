import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface Translation {
  key: string;
  section: string;
  language: Language;
  value: string;
}

interface Translations {
  [key: string]: string;
}

// Fallback translations in case database is not available
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
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  // Fetch translations from Supabase
  const fetchTranslations = async (language: Language) => {
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('key, value')
        .eq('language', language);

      if (error) {
        console.error('Error fetching translations:', error);
        // Use fallback translations if database fails
        const fallback = fallbackTranslations;
        const fallbackTrans: Translations = {};
        Object.keys(fallback).forEach(key => {
          fallbackTrans[key] = fallback[key][language] || fallback[key]['en'] || key;
        });
        setTranslations(fallbackTrans);
      } else {
        const trans: Translations = {};
        data?.forEach(item => {
          trans[item.key] = item.value;
        });
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
      // Use fallback translations
      const fallback = fallbackTranslations;
      const fallbackTrans: Translations = {};
      Object.keys(fallback).forEach(key => {
        fallbackTrans[key] = fallback[key][language] || fallback[key]['en'] || key;
      });
      setTranslations(fallbackTrans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(currentLanguage);
  }, [currentLanguage]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail as Language;
      if (newLanguage && newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, [currentLanguage]);

  const t = (key: string): string => {
    if (loading) {
      // Return fallback while loading
      const fallback = fallbackTranslations[key];
      return fallback?.[currentLanguage] || fallback?.['en'] || key;
    }
    return translations[key] || key;
  };

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    loading,
    fetchTranslations
  };
};