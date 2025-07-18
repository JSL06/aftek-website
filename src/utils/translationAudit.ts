import { supabase } from '@/integrations/supabase/client';

// Import all translation files
import enTranslations from '@/locales/en';
import jaTranslations from '@/locales/ja';
import koTranslations from '@/locales/ko';
import thTranslations from '@/locales/th';
import viTranslations from '@/locales/vi';
import zhHansTranslations from '@/locales/zh-Hans';
import zhHantTranslations from '@/locales/zh-Hant';

export type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface TranslationStatus {
  complete: number;
  missing: number;
  autoTranslated: number;
  total: number;
  coverage: number;
}

interface TranslationAuditResult {
  translationStatus: { [K in Language]: TranslationStatus };
  missingKeys: string[];
  hardcodedText: Array<{
    file: string;
    line: number;
    text: string;
    suggestedKey: string;
  }>;
  duplicateKeys: string[];
  inconsistentTranslations: Array<{
    key: string;
    languages: Language[];
    values: string[];
  }>;
  recommendations: string[];
}

// All translation objects
const allTranslations = {
  'en': enTranslations,
  'ja': jaTranslations,
  'ko': koTranslations,
  'th': thTranslations,
  'vi': viTranslations,
  'zh-Hans': zhHansTranslations,
  'zh-Hant': zhHantTranslations,
};

// Common translation keys that should exist in all languages
const requiredKeys = [
  // Navigation
  'nav.home', 'nav.about', 'nav.products', 'nav.projects', 'nav.articles', 'nav.contact', 'nav.guide',
  
  // Home page
  'home.hero.title', 'home.hero.subtitle', 'home.hero.aboutBtn', 'home.hero.companyProfileBtn',
  'home.mission.title', 'home.mission.paragraph1', 'home.mission.paragraph2',
  'home.services.title', 'home.services.subtitle',
  
  // Common UI
  'ui.learnMore', 'ui.viewAll', 'ui.download', 'ui.readMore', 'ui.contactUs', 'ui.getQuote',
  
  // Footer
  'footer.contact.title', 'footer.contact.phone', 'footer.contact.email', 'footer.contact.hours',
  'footer.links.title', 'footer.company.title', 'footer.copyright', 'footer.privacy', 'footer.terms',
  
  // Pages
  'about.title', 'products.title', 'projects.title', 'articles.title', 'contact.title',
  
  // Loading states
  'loading.general', 'loading.products', 'loading.articles', 'loading.projects',
  
  // Error pages
  'error.notFound.title', 'error.notFound.message', 'error.notFound.homeBtn',
];

// Auto-translation service (using Google Translate API simulation)
const autoTranslate = async (text: string, targetLanguage: Language): Promise<string> => {
  // In a real implementation, this would call Google Translate API
  // For now, we'll return a placeholder indicating auto-translation
  // If translating to Traditional Chinese, use Traditional Chinese as source if available
  if (targetLanguage === 'zh-Hant') {
    const zhHantText = allTranslations['zh-Hant'][text];
    if (zhHantText) {
      return zhHantText;
    }
  }
  return `[AUTO-TRANSLATED] ${text}`;
};

// Get all translation keys from all files
const getAllTranslationKeys = (): string[] => {
  const keys = new Set<string>();
  
  Object.values(allTranslations).forEach(translationObj => {
    Object.keys(translationObj).forEach(key => keys.add(key));
  });
  
  return Array.from(keys).sort();
};

// Check translation coverage for a specific language
const checkLanguageCoverage = (language: Language): TranslationStatus => {
  const translationObj = allTranslations[language];
  const allKeys = getAllTranslationKeys();
  
  let complete = 0;
  let missing = 0;
  let autoTranslated = 0;
  
  allKeys.forEach(key => {
    const value = translationObj[key];
    if (value) {
      if (typeof value === 'string' && value.startsWith('[AUTO-TRANSLATED]')) {
        autoTranslated++;
      } else {
        complete++;
      }
    } else {
      missing++;
    }
  });
  
  const total = allKeys.length;
  const coverage = total > 0 ? Math.round((complete / total) * 100) : 0;
  
  return {
    complete,
    missing,
    autoTranslated,
    total,
    coverage
  };
};

// Find missing translation keys
const findMissingKeys = (): string[] => {
  const allKeys = getAllTranslationKeys();
  const missingKeys: string[] = [];
  
  allKeys.forEach(key => {
    const missingLanguages = Object.keys(allTranslations).filter(lang => {
      const translationObj = allTranslations[lang as Language];
      return !translationObj[key];
    });
    
    if (missingLanguages.length > 0) {
      missingKeys.push(key);
    }
  });
  
  return missingKeys;
};

// Find duplicate keys within the same language
const findDuplicateKeys = (): string[] => {
  const duplicates: string[] = [];
  
  Object.entries(allTranslations).forEach(([language, translationObj]) => {
    const keys = Object.keys(translationObj);
    const seen = new Set<string>();
    
    keys.forEach(key => {
      if (seen.has(key)) {
        duplicates.push(`${language}:${key}`);
      } else {
        seen.add(key);
      }
    });
  });
  
  return duplicates;
};

// Find inconsistent translations (same key, different values across languages)
const findInconsistentTranslations = (): Array<{
  key: string;
  languages: Language[];
  values: string[];
}> => {
  const allKeys = getAllTranslationKeys();
  const inconsistencies: Array<{
    key: string;
    languages: Language[];
    values: string[];
  }> = [];
  
  allKeys.forEach(key => {
    const values = Object.entries(allTranslations).map(([lang, translationObj]) => ({
      language: lang as Language,
      value: translationObj[key]
    })).filter(item => item.value);
    
    const uniqueValues = new Set(values.map(v => v.value));
    
    if (uniqueValues.size > 1) {
      inconsistencies.push({
        key,
        languages: values.map(v => v.language),
        values: Array.from(uniqueValues)
      });
    }
  });
  
  return inconsistencies;
};

// Generate auto-translations for missing keys
const generateAutoTranslations = async (): Promise<{ [key: string]: Partial<{ [K in Language]: string }> }> => {
  const missingKeys = findMissingKeys();
  const autoTranslations: { [key: string]: Partial<{ [K in Language]: string }> } = {};
  
  for (const key of missingKeys) {
    // Get English value as source
    const englishValue = allTranslations['en'][key];
    if (!englishValue) continue;
    
    autoTranslations[key] = { en: englishValue };
    
    // Auto-translate to other languages
    const languages: Language[] = ['ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];
    
    for (const language of languages) {
      if (!allTranslations[language][key]) {
        const translated = await autoTranslate(englishValue, language);
        autoTranslations[key][language] = translated;
      }
    }
  }
  
  return autoTranslations;
};

// Main audit function
export const performTranslationAudit = async (): Promise<TranslationAuditResult> => {
  const translationStatus: { [K in Language]: TranslationStatus } = {
    'en': checkLanguageCoverage('en'),
    'ja': checkLanguageCoverage('ja'),
    'ko': checkLanguageCoverage('ko'),
    'th': checkLanguageCoverage('th'),
    'vi': checkLanguageCoverage('vi'),
    'zh-Hans': checkLanguageCoverage('zh-Hans'),
    'zh-Hant': checkLanguageCoverage('zh-Hant'),
  };
  
  const missingKeys = findMissingKeys();
  const duplicateKeys = findDuplicateKeys();
  const inconsistentTranslations = findInconsistentTranslations();
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // Check overall coverage
  const avgCoverage = Object.values(translationStatus).reduce((sum, status) => sum + status.coverage, 0) / 7;
  if (avgCoverage < 80) {
    recommendations.push(`Overall translation coverage is ${avgCoverage}%. Aim for at least 80% coverage.`);
  }
  
  // Check specific language coverage
  Object.entries(translationStatus).forEach(([language, status]) => {
    if (status.coverage < 70) {
      recommendations.push(`${language} has low coverage (${status.coverage}%). Priority should be given to completing ${language} translations.`);
    }
  });
  
  // Check for missing required keys
  const missingRequiredKeys = requiredKeys.filter(key => missingKeys.includes(key));
  if (missingRequiredKeys.length > 0) {
    recommendations.push(`Missing required translation keys: ${missingRequiredKeys.join(', ')}`);
  }
  
  if (duplicateKeys.length > 0) {
    recommendations.push(`Found ${duplicateKeys.length} duplicate translation keys that should be cleaned up.`);
  }
  
  if (inconsistentTranslations.length > 0) {
    recommendations.push(`Found ${inconsistentTranslations.length} keys with inconsistent translations across languages.`);
  }
  
  return {
    translationStatus,
    missingKeys,
    hardcodedText: [], // This would be populated by scanning the codebase
    duplicateKeys,
    inconsistentTranslations,
    recommendations
  };
};

// Export translation files with auto-translations
export const exportCompleteTranslations = async (): Promise<{ [K in Language]: any }> => {
  const autoTranslations = await generateAutoTranslations();
  const completeTranslations: { [K in Language]: any } = {} as any;
  
  Object.keys(allTranslations).forEach(language => {
    const lang = language as Language;
    completeTranslations[lang] = { ...allTranslations[lang] };
    
    // Add auto-translations for missing keys
    Object.entries(autoTranslations).forEach(([key, translations]) => {
      if (translations[lang] && !completeTranslations[lang][key]) {
        completeTranslations[lang][key] = translations[lang];
      }
    });
  });
  
  return completeTranslations;
};

// Update translation files with auto-translations
export const updateTranslationFiles = async (): Promise<void> => {
  const autoTranslations = await generateAutoTranslations();
  
  // This would update the actual translation files
  // For now, we'll just log what would be updated
  console.log('Auto-translations generated:', autoTranslations);
};

// Validate translation consistency
export const validateTranslations = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing required keys
  const missingRequiredKeys = requiredKeys.filter(key => {
    return Object.values(allTranslations).some(translationObj => !translationObj[key]);
  });
  
  if (missingRequiredKeys.length > 0) {
    errors.push(`Missing required translation keys: ${missingRequiredKeys.join(', ')}`);
  }
  
  // Check for empty values
  Object.entries(allTranslations).forEach(([language, translationObj]) => {
    Object.entries(translationObj).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        warnings.push(`Empty translation value for ${language}:${key}`);
      }
    });
  });
  
  // Check for very long translations (potential issues)
  Object.entries(allTranslations).forEach(([language, translationObj]) => {
    Object.entries(translationObj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 500) {
        warnings.push(`Very long translation for ${language}:${key} (${value.length} characters)`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Get translation statistics
export const getTranslationStats = () => {
  const allKeys = getAllTranslationKeys();
  const stats = {
    totalKeys: allKeys.length,
    languages: Object.keys(allTranslations).length,
    coverage: {} as { [K in Language]: number }
  };
  
  Object.keys(allTranslations).forEach(language => {
    const lang = language as Language;
    const translationObj = allTranslations[lang];
    const translatedKeys = allKeys.filter(key => translationObj[key]).length;
    stats.coverage[lang] = Math.round((translatedKeys / allKeys.length) * 100);
  });
  
  return stats;
}; 