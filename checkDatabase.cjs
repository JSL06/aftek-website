<<<<<<< HEAD
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database for existing translations...');
  
  try {
    const { data, error } = await supabase
      .from('website_texts')
      .select('language, key')
      .order('language');
    
    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('📭 Database is empty - no translations found');
      return;
    }
    
    // Group by language
    const languages = {};
    data.forEach(item => {
      if (!languages[item.language]) {
        languages[item.language] = [];
      }
      languages[item.language].push(item.key);
    });
    
    console.log('📊 Found translations for languages:');
    Object.keys(languages).forEach(lang => {
      console.log(`  ${lang}: ${languages[lang].length} translations`);
    });
    
    // Check which languages are missing
    const expectedLanguages = ['en', 'ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];
    const missingLanguages = expectedLanguages.filter(lang => !languages[lang]);
    
    if (missingLanguages.length > 0) {
      console.log('\n❌ Missing languages:', missingLanguages.join(', '));
    } else {
      console.log('\n✅ All expected languages are present');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

=======
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database for existing translations...');
  
  try {
    const { data, error } = await supabase
      .from('website_texts')
      .select('language, key')
      .order('language');
    
    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('📭 Database is empty - no translations found');
      return;
    }
    
    // Group by language
    const languages = {};
    data.forEach(item => {
      if (!languages[item.language]) {
        languages[item.language] = [];
      }
      languages[item.language].push(item.key);
    });
    
    console.log('📊 Found translations for languages:');
    Object.keys(languages).forEach(lang => {
      console.log(`  ${lang}: ${languages[lang].length} translations`);
    });
    
    // Check which languages are missing
    const expectedLanguages = ['en', 'ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];
    const missingLanguages = expectedLanguages.filter(lang => !languages[lang]);
    
    if (missingLanguages.length > 0) {
      console.log('\n❌ Missing languages:', missingLanguages.join(', '));
    } else {
      console.log('\n✅ All expected languages are present');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
checkDatabase(); 