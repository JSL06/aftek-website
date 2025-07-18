const fs = require('fs');
const path = require('path');

// Import all translation files
const en = require('./src/locales/en.ts').default || require('./src/locales/en.ts');
const zhHant = require('./src/locales/zh-Hant.ts').default || require('./src/locales/zh-Hant.ts');
const zhHans = require('./src/locales/zh-Hans.ts').default || require('./src/locales/zh-Hans.ts');
const ja = require('./src/locales/ja.ts').default || require('./src/locales/ja.ts');
const ko = require('./src/locales/ko.ts').default || require('./src/locales/ko.ts');
const th = require('./src/locales/th.ts').default || require('./src/locales/th.ts');
const vi = require('./src/locales/vi.ts').default || require('./src/locales/vi.ts');

const translations = {
  'en': en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
  'ja': ja,
  'ko': ko,
  'th': th,
  'vi': vi
};

const languages = Object.keys(translations);

console.log('🔍 Analyzing translation files...\n');

// Get all unique keys from all translation files
const allKeys = new Set();
languages.forEach(lang => {
  Object.keys(translations[lang]).forEach(key => {
    allKeys.add(key);
  });
});

console.log(`📊 Total unique translation keys: ${allKeys.size}\n`);

// Check for missing translations
console.log('❌ MISSING TRANSLATIONS:');
console.log('========================');

const missingTranslations = {};
languages.forEach(lang => {
  const missing = [];
  allKeys.forEach(key => {
    if (!translations[lang][key]) {
      missing.push(key);
    }
  });
  if (missing.length > 0) {
    missingTranslations[lang] = missing;
    console.log(`\n${lang}: ${missing.length} missing keys`);
    missing.forEach(key => {
      console.log(`  - ${key}`);
    });
  }
});

if (Object.keys(missingTranslations).length === 0) {
  console.log('✅ All languages have complete translations!\n');
}

// Check for inconsistent translations (same key, different values across languages)
console.log('\n⚠️  POTENTIAL INCONSISTENCIES:');
console.log('=============================');

const inconsistencies = [];
allKeys.forEach(key => {
  const values = {};
  languages.forEach(lang => {
    if (translations[lang][key]) {
      values[lang] = translations[lang][key];
    }
  });
  
  // Check if all values are the same (excluding missing translations)
  const uniqueValues = [...new Set(Object.values(values))];
  if (uniqueValues.length > 1) {
    inconsistencies.push({ key, values });
  }
});

if (inconsistencies.length > 0) {
  inconsistencies.forEach(({ key, values }) => {
    console.log(`\nKey: ${key}`);
    Object.entries(values).forEach(([lang, value]) => {
      console.log(`  ${lang}: "${value}"`);
    });
  });
} else {
  console.log('✅ No inconsistencies found!\n');
}

// Check for empty or whitespace-only translations
console.log('\n🚨 EMPTY OR WHITESPACE TRANSLATIONS:');
console.log('===================================');

const emptyTranslations = [];
languages.forEach(lang => {
  Object.entries(translations[lang]).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      emptyTranslations.push({ lang, key, value });
    }
  });
});

if (emptyTranslations.length > 0) {
  emptyTranslations.forEach(({ lang, key, value }) => {
    console.log(`${lang}.${key}: "${value}"`);
  });
} else {
  console.log('✅ No empty translations found!\n');
}

// Check for navigation keys specifically
console.log('\n🧭 NAVIGATION KEYS ANALYSIS:');
console.log('===========================');

const navKeys = Array.from(allKeys).filter(key => key.startsWith('nav.'));
console.log(`Found ${navKeys.length} navigation keys:`);
navKeys.forEach(key => {
  console.log(`\n${key}:`);
  languages.forEach(lang => {
    const value = translations[lang][key];
    if (value) {
      console.log(`  ${lang}: "${value}"`);
    } else {
      console.log(`  ${lang}: MISSING`);
    }
  });
});

// Check for page-specific keys
console.log('\n📄 PAGE-SPECIFIC KEYS ANALYSIS:');
console.log('==============================');

const pageKeys = {
  'home': Array.from(allKeys).filter(key => key.startsWith('home.')),
  'about': Array.from(allKeys).filter(key => key.startsWith('about.')),
  'contact': Array.from(allKeys).filter(key => key.startsWith('contact.')),
  'products': Array.from(allKeys).filter(key => key.startsWith('products.')),
  'projects': Array.from(allKeys).filter(key => key.startsWith('projects.')),
  'articles': Array.from(allKeys).filter(key => key.startsWith('articles.')),
  'footer': Array.from(allKeys).filter(key => key.startsWith('footer.')),
  'ui': Array.from(allKeys).filter(key => key.startsWith('ui.')),
  'chatbot': Array.from(allKeys).filter(key => key.startsWith('chatbot.'))
};

Object.entries(pageKeys).forEach(([page, keys]) => {
  console.log(`\n${page.toUpperCase()} (${keys.length} keys):`);
  keys.forEach(key => {
    const missing = languages.filter(lang => !translations[lang][key]);
    if (missing.length > 0) {
      console.log(`  ${key}: Missing in ${missing.join(', ')}`);
    }
  });
});

// Summary
console.log('\n📋 SUMMARY:');
console.log('===========');
console.log(`Total languages: ${languages.length}`);
console.log(`Total translation keys: ${allKeys.size}`);
console.log(`Languages with missing translations: ${Object.keys(missingTranslations).length}`);
console.log(`Inconsistent translations: ${inconsistencies.length}`);
console.log(`Empty translations: ${emptyTranslations.length}`);

// Export results for further analysis
const analysis = {
  totalKeys: allKeys.size,
  languages,
  missingTranslations,
  inconsistencies,
  emptyTranslations,
  navKeys,
  pageKeys
};

fs.writeFileSync('translation-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n💾 Analysis saved to translation-analysis.json'); 