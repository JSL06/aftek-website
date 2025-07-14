<<<<<<< HEAD
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get language from command line argument
const targetLanguage = process.argv[2];

if (!targetLanguage) {
  console.log('❌ Please specify a language code (e.g., node importSingleLanguage.cjs ja)');
  console.log('Available languages: en, ja, ko, th, vi, zh-Hans, zh-Hant');
  process.exit(1);
}

const localesPath = path.join(__dirname, 'src', 'locales');
const filePath = path.join(localesPath, `${targetLanguage}.cjs`);

if (!fs.existsSync(filePath)) {
  console.log(`❌ Language file not found: ${filePath}`);
  process.exit(1);
}

async function importLanguage() {
  console.log(`🚀 Importing translations for language: ${targetLanguage}`);
  
  try {
    // Load the translation file
    const translationModule = require(filePath);
    const translations = translationModule.default || translationModule;
    
    console.log(`📖 Loaded ${Object.keys(translations).length} translations from ${targetLanguage}.cjs`);
    
    // Convert to database format
    const textsToInsert = Object.entries(translations).map(([key, value]) => ({
      key,
      language: targetLanguage,
      section: key.split('.')[0],
      value: String(value)
    }));
    
    console.log(`🔄 Inserting ${textsToInsert.length} translations...`);
    
    // Insert in batches to avoid timeouts
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < textsToInsert.length; i += batchSize) {
      const batch = textsToInsert.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('website_texts')
          .upsert(batch, { onConflict: 'key,language' });
        
        if (error) {
          console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} translations inserted`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Network error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      }
    }
    
    console.log(`\n📊 Import Summary for ${targetLanguage}:`);
    console.log(`  ✅ Successfully imported: ${successCount}`);
    console.log(`  ❌ Failed to import: ${errorCount}`);
    console.log(`  📝 Total processed: ${textsToInsert.length}`);
    
  } catch (error) {
    console.error('❌ Error loading translation file:', error);
  }
}

=======
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get language from command line argument
const targetLanguage = process.argv[2];

if (!targetLanguage) {
  console.log('❌ Please specify a language code (e.g., node importSingleLanguage.cjs ja)');
  console.log('Available languages: en, ja, ko, th, vi, zh-Hans, zh-Hant');
  process.exit(1);
}

const localesPath = path.join(__dirname, 'src', 'locales');
const filePath = path.join(localesPath, `${targetLanguage}.cjs`);

if (!fs.existsSync(filePath)) {
  console.log(`❌ Language file not found: ${filePath}`);
  process.exit(1);
}

async function importLanguage() {
  console.log(`🚀 Importing translations for language: ${targetLanguage}`);
  
  try {
    // Load the translation file
    const translationModule = require(filePath);
    const translations = translationModule.default || translationModule;
    
    console.log(`📖 Loaded ${Object.keys(translations).length} translations from ${targetLanguage}.cjs`);
    
    // Convert to database format
    const textsToInsert = Object.entries(translations).map(([key, value]) => ({
      key,
      language: targetLanguage,
      section: key.split('.')[0],
      value: String(value)
    }));
    
    console.log(`🔄 Inserting ${textsToInsert.length} translations...`);
    
    // Insert in batches to avoid timeouts
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < textsToInsert.length; i += batchSize) {
      const batch = textsToInsert.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('website_texts')
          .upsert(batch, { onConflict: 'key,language' });
        
        if (error) {
          console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} translations inserted`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Network error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      }
    }
    
    console.log(`\n📊 Import Summary for ${targetLanguage}:`);
    console.log(`  ✅ Successfully imported: ${successCount}`);
    console.log(`  ❌ Failed to import: ${errorCount}`);
    console.log(`  📝 Total processed: ${textsToInsert.length}`);
    
  } catch (error) {
    console.error('❌ Error loading translation file:', error);
  }
}

>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
importLanguage(); 