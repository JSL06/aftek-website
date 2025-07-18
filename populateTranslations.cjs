const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Import all translation files - using require for CommonJS
const en = require('./src/locales/en.ts');
const ja = require('./src/locales/ja.ts');
const ko = require('./src/locales/ko.ts');
const th = require('./src/locales/th.ts');
const vi = require('./src/locales/vi.ts');
const zhHans = require('./src/locales/zh-Hans.ts');
const zhHant = require('./src/locales/zh-Hant.ts');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define all languages
const languages = {
  'en': { name: 'English', data: en },
  'ja': { name: '日本語', data: ja },
  'ko': { name: '한국어', data: ko },
  'th': { name: 'ไทย', data: th },
  'vi': { name: 'Tiếng Việt', data: vi },
  'zh-Hans': { name: '简体中文', data: zhHans },
  'zh-Hant': { name: '繁體中文', data: zhHant }
};

// Helper function to extract section from key
function getSection(key) {
  const parts = key.split('.');
  return parts[0] || 'common';
}

// Helper function to flatten nested objects
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        // Handle arrays by joining them
        if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].join(', ');
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
  }
  
  return flattened;
}

// Main function to populate translations
async function populateTranslations() {
  console.log('🚀 Starting translation population...');
  
  try {
    // First, clear existing translations
    console.log('🗑️  Clearing existing translations...');
    const { error: deleteError } = await supabase
      .from('website_texts')
      .delete()
      .neq('key', ''); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing existing translations:', deleteError);
      return;
    }
    
    console.log('✅ Existing translations cleared');
    
    // Prepare all translation data
    const allTranslations = [];
    
    for (const [langCode, langData] of Object.entries(languages)) {
      console.log(`📝 Processing ${langData.name} (${langCode})...`);
      
      const flattenedData = flattenObject(langData.data);
      
      for (const [key, value] of Object.entries(flattenedData)) {
        // Skip empty values
        if (!value || value.toString().trim() === '') {
          continue;
        }
        
        allTranslations.push({
          key: key,
          value: value.toString(),
          language: langCode,
          section: getSection(key)
        });
      }
      
      console.log(`✅ Processed ${Object.keys(flattenedData).length} keys for ${langData.name}`);
    }
    
    console.log(`📊 Total translations to insert: ${allTranslations.length}`);
    
    // Insert translations in batches
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < allTranslations.length; i += batchSize) {
      const batch = allTranslations.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('website_texts')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        return;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} translations (${insertedCount}/${allTranslations.length})`);
    }
    
    console.log('🎉 Translation population completed successfully!');
    console.log(`📈 Total translations inserted: ${insertedCount}`);
    
    // Verify the data
    console.log('🔍 Verifying data...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('website_texts')
      .select('language, count')
      .group('language');
    
    if (verificationError) {
      console.error('Error verifying data:', verificationError);
    } else {
      console.log('📊 Translation counts by language:');
      verificationData.forEach(item => {
        console.log(`  ${item.language}: ${item.count} translations`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
populateTranslations()
  .then(() => {
    console.log('✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 