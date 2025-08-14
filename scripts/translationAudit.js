#!/usr/bin/env node

/**
 * Translation Audit and Fix Script
 * 
 * This script performs a comprehensive audit of all translations in the Aftek website
 * and automatically fixes missing translations using translation services.
 * 
 * Usage:
 * node scripts/translationAudit.js [options]
 * 
 * Options:
 * --audit-only     Only perform audit, don't fix translations
 * --fix-missing    Auto-translate missing keys
 * --export         Export complete translations to JSON files
 * --validate       Validate translation consistency
 * --google-api-key <key>  Use Google Translate API with provided key
 */

const fs = require('fs');
const path = require('path');

// Import translation files
const enTranslations = require('../src/locales/en.ts').default || require('../src/locales/en.ts');
const jaTranslations = require('../src/locales/ja.ts').default || require('../src/locales/ja.ts');
const koTranslations = require('../src/locales/ko.ts').default || require('../src/locales/ko.ts');
const thTranslations = require('../src/locales/th.ts').default || require('../src/locales/th.ts');
const viTranslations = require('../src/locales/vi.ts').default || require('../src/locales/vi.ts');
const zhHansTranslations = require('../src/locales/zh-Hans.ts').default || require('../src/locales/zh-Hans.ts');
const zhHantTranslations = require('../src/locales/zh-Hant.ts').default || require('../src/locales/zh-Hant.ts');

const LANGUAGES = {
  'en': { name: 'English', translations: enTranslations },
  'ja': { name: '日本語', translations: jaTranslations },
  'ko': { name: '한국어', translations: koTranslations },
  'th': { name: 'ไทย', translations: thTranslations },
  'vi': { name: 'Tiếng Việt', translations: viTranslations },
  'zh-Hans': { name: '简体中文', translations: zhHansTranslations },
  'zh-Hant': { name: '繁體中文', translations: zhHantTranslations }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  auditOnly: args.includes('--audit-only'),
  fixMissing: args.includes('--fix-missing'),
  export: args.includes('--export'),
  validate: args.includes('--validate'),
  googleApiKey: args[args.indexOf('--google-api-key') + 1] || null
};

// Translation service using LibreTranslate (free)
async function translateText(text, targetLanguage) {
  const languageMap = {
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'th': 'th',
    'vi': 'vi',
    'zh-Hans': 'zh',
    'zh-Hant': 'zh-TW'
  };

  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: languageMap[targetLanguage],
        format: 'text'
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.warn(`Translation failed for "${text}" to ${targetLanguage}:`, error.message);
    return `[AUTO-TRANSLATED] ${text}`;
  }
}

// Get all translation keys from all files
function getAllTranslationKeys() {
  const keys = new Set();
  
  Object.values(LANGUAGES).forEach(lang => {
    Object.keys(lang.translations).forEach(key => keys.add(key));
  });
  
  return Array.from(keys).sort();
}

// Check translation coverage for a specific language
function checkLanguageCoverage(language) {
  const translationObj = LANGUAGES[language].translations;
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
}

// Find missing translation keys
function findMissingKeys() {
  const allKeys = getAllTranslationKeys();
  const missingKeys = [];
  
  allKeys.forEach(key => {
    const missingLanguages = Object.keys(LANGUAGES).filter(lang => {
      const translationObj = LANGUAGES[lang].translations;
      return !translationObj[key];
    });
    
    if (missingLanguages.length > 0) {
      missingKeys.push({
        key,
        missingLanguages
      });
    }
  });
  
  return missingKeys;
}

// Find duplicate keys within the same language
function findDuplicateKeys() {
  const duplicates = [];
  
  Object.entries(LANGUAGES).forEach(([language, langData]) => {
    const keys = Object.keys(langData.translations);
    const seen = new Set();
    
    keys.forEach(key => {
      if (seen.has(key)) {
        duplicates.push(`${language}:${key}`);
      } else {
        seen.add(key);
      }
    });
  });
  
  return duplicates;
}

// Find inconsistent translations
function findInconsistentTranslations() {
  const allKeys = getAllTranslationKeys();
  const inconsistencies = [];
  
  allKeys.forEach(key => {
    const values = Object.entries(LANGUAGES).map(([lang, langData]) => ({
      language: lang,
      value: langData.translations[key]
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
}

// Auto-translate missing keys
async function autoTranslateMissingKeys(missingKeys) {
  console.log('\n🔄 Starting auto-translation of missing keys...');
  
  const results = {};
  
  for (const { key, missingLanguages } of missingKeys) {
    // Get English value as source
    const englishValue = LANGUAGES['en'].translations[key];
    if (!englishValue) {
      console.warn(`⚠️  No English translation found for key: ${key}`);
      continue;
    }
    
    results[key] = { en: englishValue };
    
    // Translate to missing languages
    for (const language of missingLanguages) {
      if (language === 'en') continue;
      
      try {
        console.log(`  Translating "${key}" to ${LANGUAGES[language].name}...`);
        const translated = await translateText(englishValue, language);
        results[key][language] = translated;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Failed to translate "${key}" to ${language}:`, error.message);
        results[key][language] = `[TRANSLATION ERROR] ${englishValue}`;
      }
    }
  }
  
  return results;
}

// Update translation files
async function updateTranslationFiles(autoTranslations) {
  console.log('\n💾 Updating translation files...');
  
  for (const [language, langData] of Object.entries(LANGUAGES)) {
    const updatedTranslations = { ...langData.translations };
    let updated = false;
    
    Object.entries(autoTranslations).forEach(([key, translations]) => {
      if (translations[language] && !updatedTranslations[key]) {
        updatedTranslations[key] = translations[language];
        updated = true;
      }
    });
    
    if (updated) {
      const filePath = path.join(__dirname, '..', 'src', 'locales', `${language}.ts`);
      const content = `const ${language.replace('-', '')} = ${JSON.stringify(updatedTranslations, null, 2)};\n\nexport default ${language.replace('-', '')};`;
      
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Updated ${language}.ts`);
      } catch (error) {
        console.error(`  ❌ Failed to update ${language}.ts:`, error.message);
      }
    }
  }
}

// Export complete translations to JSON
function exportTranslations() {
  console.log('\n📤 Exporting complete translations...');
  
  const exportDir = path.join(__dirname, '..', 'translations');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  Object.entries(LANGUAGES).forEach(([language, langData]) => {
    const filePath = path.join(exportDir, `${language}.json`);
    const content = JSON.stringify(langData.translations, null, 2);
    
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Exported ${language}.json`);
    } catch (error) {
      console.error(`  ❌ Failed to export ${language}.json:`, error.message);
    }
  });
  
  // Export master translation map
  const masterMap = {};
  const allKeys = getAllTranslationKeys();
  
  allKeys.forEach(key => {
    masterMap[key] = {};
    Object.keys(LANGUAGES).forEach(language => {
      masterMap[key][language] = LANGUAGES[language].translations[key] || '';
    });
  });
  
  const masterPath = path.join(exportDir, 'master-translations.json');
  try {
    fs.writeFileSync(masterPath, JSON.stringify(masterMap, null, 2), 'utf8');
    console.log(`  ✅ Exported master-translations.json`);
  } catch (error) {
    console.error(`  ❌ Failed to export master-translations.json:`, error.message);
  }
}

// Generate translation status report
function generateStatusReport() {
  console.log('\n📊 Translation Status Report');
  console.log('=' .repeat(50));
  
  const allKeys = getAllTranslationKeys();
  console.log(`Total translation keys: ${allKeys.length}`);
  console.log(`Languages: ${Object.keys(LANGUAGES).length}`);
  console.log('');
  
  Object.entries(LANGUAGES).forEach(([language, langData]) => {
    const status = checkLanguageCoverage(language);
    const coverageBar = '█'.repeat(Math.floor(status.coverage / 10)) + '░'.repeat(10 - Math.floor(status.coverage / 10));
    
    console.log(`${langData.name} (${language}):`);
    console.log(`  Coverage: ${coverageBar} ${status.coverage}%`);
    console.log(`  Complete: ${status.complete}, Missing: ${status.missing}, Auto-translated: ${status.autoTranslated}`);
    console.log('');
  });
}

// Main audit function
async function performAudit() {
  console.log('🔍 Starting Translation Audit...');
  console.log('=' .repeat(50));
  
  // Get all keys and missing keys
  const allKeys = getAllTranslationKeys();
  const missingKeys = findMissingKeys();
  const duplicateKeys = findDuplicateKeys();
  const inconsistentTranslations = findInconsistentTranslations();
  
  // Generate status report
  generateStatusReport();
  
  // Show missing keys
  if (missingKeys.length > 0) {
    console.log('❌ Missing Translation Keys:');
    console.log('-'.repeat(30));
    missingKeys.forEach(({ key, missingLanguages }) => {
      console.log(`  ${key}: missing in ${missingLanguages.join(', ')}`);
    });
    console.log('');
  }
  
  // Show duplicate keys
  if (duplicateKeys.length > 0) {
    console.log('⚠️  Duplicate Keys:');
    console.log('-'.repeat(30));
    duplicateKeys.forEach(key => {
      console.log(`  ${key}`);
    });
    console.log('');
  }
  
  // Show inconsistent translations
  if (inconsistentTranslations.length > 0) {
    console.log('⚠️  Inconsistent Translations:');
    console.log('-'.repeat(30));
    inconsistentTranslations.forEach(item => {
      console.log(`  ${item.key}: ${item.languages.length} languages have different values`);
    });
    console.log('');
  }
  
  // Auto-translate missing keys if requested
  if (options.fixMissing && missingKeys.length > 0) {
    const autoTranslations = await autoTranslateMissingKeys(missingKeys);
    await updateTranslationFiles(autoTranslations);
  }
  
  // Export translations if requested
  if (options.export) {
    exportTranslations();
  }
  
  // Summary
  console.log('📋 Summary:');
  console.log('-'.repeat(30));
  console.log(`Total keys: ${allKeys.length}`);
  console.log(`Missing keys: ${missingKeys.length}`);
  console.log(`Duplicate keys: ${duplicateKeys.length}`);
  console.log(`Inconsistent translations: ${inconsistentTranslations.length}`);
  
  if (missingKeys.length === 0 && duplicateKeys.length === 0 && inconsistentTranslations.length === 0) {
    console.log('\n🎉 All translations are complete and consistent!');
  } else {
    console.log('\n⚠️  Some issues were found. Consider running with --fix-missing to auto-translate missing keys.');
  }
}

// Run the audit
if (require.main === module) {
  performAudit().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
}

module.exports = {
  performAudit,
  getAllTranslationKeys,
  findMissingKeys,
  checkLanguageCoverage,
  autoTranslateMissingKeys,
  updateTranslationFiles,
  exportTranslations
}; 