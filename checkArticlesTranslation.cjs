const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticlesTranslation() {
  console.log('🔍 Checking articles.title translation in database...');
  
  try {
    // Check for articles.title in Traditional Chinese
    const { data, error } = await supabase
      .from('website_texts')
      .select('*')
      .eq('key', 'articles.title')
      .eq('language', 'zh-Hant');
    
    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('✅ No database entry found for articles.title in Traditional Chinese');
      console.log('📝 This means it should use the local translation: "文章與新聞"');
    } else {
      console.log('❌ Found database entry that might be overriding local translation:');
      console.log('   Key:', data[0].key);
      console.log('   Language:', data[0].language);
      console.log('   Value:', data[0].value);
      console.log('   Section:', data[0].section);
      
      if (data[0].value === 'Articles') {
        console.log('\n🚨 PROBLEM FOUND: Database has "Articles" instead of "文章與新聞"');
        console.log('   This is overriding the local translation!');
      }
    }
    
    // Also check for any articles-related entries in Traditional Chinese
    console.log('\n🔍 Checking all articles-related entries in Traditional Chinese...');
    const { data: allArticles, error: allError } = await supabase
      .from('website_texts')
      .select('*')
      .eq('language', 'zh-Hant')
      .like('key', 'articles.%');
    
    if (allError) {
      console.error('❌ Error fetching articles data:', allError);
      return;
    }
    
    if (!allArticles || allArticles.length === 0) {
      console.log('✅ No articles-related database entries found in Traditional Chinese');
    } else {
      console.log(`📝 Found ${allArticles.length} articles-related entries:`);
      allArticles.forEach(entry => {
        console.log(`   ${entry.key}: "${entry.value}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkArticlesTranslation(); 