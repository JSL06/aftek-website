// Test script to check Traditional Chinese translations
const zhHantTranslations = require('./src/locales/zh-Hant.ts').default;

console.log('🔍 Testing Traditional Chinese translations...');
console.log('📊 Total translations:', Object.keys(zhHantTranslations).length);

// Check specific articles-related keys
const articlesKeys = Object.keys(zhHantTranslations).filter(key => key.startsWith('articles.'));
console.log('\n📝 Articles-related keys found:', articlesKeys.length);
articlesKeys.forEach(key => {
  console.log(`   ${key}: "${zhHantTranslations[key]}"`);
});

// Check if articles.title exists and what its value is
if (zhHantTranslations['articles.title']) {
  console.log('\n✅ articles.title found:', zhHantTranslations['articles.title']);
} else {
  console.log('\n❌ articles.title NOT found in Traditional Chinese translations');
}

// Check navigation keys
const navKeys = Object.keys(zhHantTranslations).filter(key => key.startsWith('nav.'));
console.log('\n🧭 Navigation keys found:', navKeys.length);
navKeys.forEach(key => {
  console.log(`   ${key}: "${zhHantTranslations[key]}"`);
});

console.log('\n✅ Traditional Chinese translations test completed'); 