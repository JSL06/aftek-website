import { supabase } from '@/integrations/supabase/client';

export type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: {
      text: string;
      timestamp: number;
    };
  };
}

// Language mapping for different translation services
const LANGUAGE_MAP = {
  'en': { google: 'en', libre: 'en', deepl: 'EN' },
  'ja': { google: 'ja', libre: 'ja', deepl: 'JA' },
  'ko': { google: 'ko', libre: 'ko', deepl: 'KO' },
  'th': { google: 'th', libre: 'th', deepl: 'TH' },
  'vi': { google: 'vi', libre: 'vi', deepl: 'VI' },
  'zh-Hans': { google: 'zh-CN', libre: 'zh', deepl: 'ZH' },
  'zh-Hant': { google: 'zh-TW', libre: 'zh-TW', deepl: 'ZH' },
};

// Cache for translations to avoid repeated API calls
const translationCache: TranslationCache = {};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Free translation service using LibreTranslate
const translateWithLibreTranslate = async (
  text: string, 
  targetLanguage: Language
): Promise<TranslationResult> => {
  try {
    const targetLang = LANGUAGE_MAP[targetLanguage].libre;
    
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text'
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      translatedText: data.translatedText,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
      confidence: 0.8 // LibreTranslate doesn't provide confidence scores
    };
  } catch (error) {
    console.error('LibreTranslate error:', error);
    throw error;
  }
};

// Google Translate API (requires API key)
const translateWithGoogle = async (
  text: string, 
  targetLanguage: Language,
  apiKey?: string
): Promise<TranslationResult> => {
  if (!apiKey) {
    throw new Error('Google Translate API key is required');
  }

  try {
    const targetLang = LANGUAGE_MAP[targetLanguage].google;
    
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    const translation = data.data.translations[0];
    
    return {
      translatedText: translation.translatedText,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
      confidence: translation.confidence || 0.9
    };
  } catch (error) {
    console.error('Google Translate error:', error);
    throw error;
  }
};

// Simple fallback translation using predefined mappings
const translateWithFallback = (text: string, targetLanguage: Language): TranslationResult => {
  // Common translations for basic UI elements
  const commonTranslations: { [key: string]: { [K in Language]: string } } = {
    'Home': {
      'en': 'Home',
      'ja': 'ホーム',
      'ko': '홈',
      'th': 'หน้าแรก',
      'vi': 'Trang chủ',
      'zh-Hans': '首页',
      'zh-Hant': '首頁'
    },
    'About': {
      'en': 'About',
      'ja': '会社概要',
      'ko': '회사소개',
      'th': 'เกี่ยวกับเรา',
      'vi': 'Giới thiệu',
      'zh-Hans': '关于我们',
      'zh-Hant': '關於我們'
    },
    'Products': {
      'en': 'Products',
      'ja': '製品',
      'ko': '제품',
      'th': 'ผลิตภัณฑ์',
      'vi': 'Sản phẩm',
      'zh-Hans': '产品',
      'zh-Hant': '產品'
    },
    'Contact': {
      'en': 'Contact',
      'ja': 'お問い合わせ',
      'ko': '연락처',
      'th': 'ติดต่อ',
      'vi': 'Liên hệ',
      'zh-Hans': '联系',
      'zh-Hant': '聯絡'
    },
    'Loading...': {
      'en': 'Loading...',
      'ja': '読み込み中...',
      'ko': '로딩 중...',
      'th': 'กำลังโหลด...',
      'vi': 'Đang tải...',
      'zh-Hans': '加载中...',
      'zh-Hant': '載入中...'
    },
    'Submit': {
      'en': 'Submit',
      'ja': '送信',
      'ko': '제출',
      'th': 'ส่ง',
      'vi': 'Gửi',
      'zh-Hans': '提交',
      'zh-Hant': '提交'
    },
    'Cancel': {
      'en': 'Cancel',
      'ja': 'キャンセル',
      'ko': '취소',
      'th': 'ยกเลิก',
      'vi': 'Hủy',
      'zh-Hans': '取消',
      'zh-Hant': '取消'
    },
    'Save': {
      'en': 'Save',
      'ja': '保存',
      'ko': '저장',
      'th': 'บันทึก',
      'vi': 'Lưu',
      'zh-Hans': '保存',
      'zh-Hant': '儲存'
    },
    'Edit': {
      'en': 'Edit',
      'ja': '編集',
      'ko': '편집',
      'th': 'แก้ไข',
      'vi': 'Chỉnh sửa',
      'zh-Hans': '编辑',
      'zh-Hant': '編輯'
    },
    'Delete': {
      'en': 'Delete',
      'ja': '削除',
      'ko': '삭제',
      'th': 'ลบ',
      'vi': 'Xóa',
      'zh-Hans': '删除',
      'zh-Hant': '刪除'
    }
  };

  // Check if we have a predefined translation
  if (commonTranslations[text]) {
    return {
      translatedText: commonTranslations[text][targetLanguage],
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
      confidence: 1.0
    };
  }

  // For unknown text, return a placeholder
  return {
    translatedText: `[NEEDS TRANSLATION] ${text}`,
    sourceLanguage: 'en',
    targetLanguage: targetLanguage,
    confidence: 0.0
  };
};

// Main translation function
export const translateText = async (
  text: string, 
  targetLanguage: Language,
  options: {
    useGoogleTranslate?: boolean;
    googleApiKey?: string;
    useCache?: boolean;
    forceRefresh?: boolean;
  } = {}
): Promise<TranslationResult> => {
  const {
    useGoogleTranslate = false,
    googleApiKey,
    useCache = true,
    forceRefresh = false
  } = options;

  // Check cache first
  const cacheKey = `${text}_${targetLanguage}`;
  if (useCache && !forceRefresh && translationCache[cacheKey]) {
    const cached = translationCache[cacheKey][targetLanguage];
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        translatedText: cached.text,
        sourceLanguage: 'en',
        targetLanguage: targetLanguage,
        confidence: 0.9
      };
    }
  }

  let result: TranslationResult;

  try {
    // Try Google Translate first if enabled and API key is provided
    if (useGoogleTranslate && googleApiKey) {
      result = await translateWithGoogle(text, targetLanguage, googleApiKey);
    } else {
      // Try LibreTranslate (free service)
      result = await translateWithLibreTranslate(text, targetLanguage);
    }
  } catch (error) {
    console.warn('Translation service failed, using fallback:', error);
    // Use fallback translation
    result = translateWithFallback(text, targetLanguage);
  }

  // Cache the result
  if (useCache) {
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {};
    }
    translationCache[cacheKey][targetLanguage] = {
      text: result.translatedText,
      timestamp: Date.now()
    };
  }

  return result;
};

// Batch translate multiple texts
export const translateBatch = async (
  texts: string[],
  targetLanguage: Language,
  options: {
    useGoogleTranslate?: boolean;
    googleApiKey?: string;
    useCache?: boolean;
    delay?: number; // Delay between requests to avoid rate limiting
  } = {}
): Promise<TranslationResult[]> => {
  const { delay = 100 } = options;
  const results: TranslationResult[] = [];

  for (let i = 0; i < texts.length; i++) {
    try {
      const result = await translateText(texts[i], targetLanguage, options);
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      if (i < texts.length - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error translating text "${texts[i]}":`, error);
      // Add fallback result
      results.push(translateWithFallback(texts[i], targetLanguage));
    }
  }

  return results;
};

// Save translation to database
export const saveTranslation = async (
  key: string,
  language: Language,
  value: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('website_texts')
      .upsert({
        key,
        language,
        value,
        section: key.split('.')[0],
        updated_at: new Date().toISOString()
      }, { onConflict: 'key,language' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving translation:', error);
    throw error;
  }
};

// Get translation from database
export const getTranslation = async (
  key: string,
  language: Language
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('website_texts')
      .select('value')
      .eq('key', key)
      .eq('language', language)
      .single();

    if (error) {
      throw error;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Error getting translation:', error);
    return null;
  }
};

// Auto-translate missing translations
export const autoTranslateMissing = async (
  keys: string[],
  targetLanguage: Language,
  options: {
    useGoogleTranslate?: boolean;
    googleApiKey?: string;
    saveToDatabase?: boolean;
  } = {}
): Promise<{ [key: string]: string }> => {
  const { saveToDatabase = true } = options;
  const results: { [key: string]: string } = {};

  // Get English translations as source
  const englishTranslations = await Promise.all(
    keys.map(key => getTranslation(key, 'en'))
  );

  // Translate missing keys
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const englishText = englishTranslations[i];

    if (!englishText) {
      console.warn(`No English translation found for key: ${key}`);
      continue;
    }

    try {
      const result = await translateText(englishText, targetLanguage, options);
      results[key] = result.translatedText;

      // Save to database if requested
      if (saveToDatabase) {
        await saveTranslation(key, targetLanguage, result.translatedText);
      }
    } catch (error) {
      console.error(`Error auto-translating key "${key}":`, error);
      results[key] = `[TRANSLATION ERROR] ${englishText}`;
    }
  }

  return results;
};

// Clear translation cache
export const clearTranslationCache = (): void => {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
};

// Get cache statistics
export const getCacheStats = (): {
  totalEntries: number;
  totalKeys: number;
  oldestEntry: number;
  newestEntry: number;
} => {
  const entries = Object.values(translationCache).flatMap(lang => Object.values(lang));
  const timestamps = entries.map(entry => entry.timestamp);

  return {
    totalEntries: entries.length,
    totalKeys: Object.keys(translationCache).length,
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
  };
}; 