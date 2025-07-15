require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://txjhhwootljiqavnnghm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amhod29vdGxqaXFhdm5uZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc5MDQsImV4cCI6MjA2NzE2MzkwNH0.fJHzXibofO5jhnWp1COLbcHkamLf1l6hzwGdLpbt7YM';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or as environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const localesDir = path.join(__dirname, 'src', 'locales');

function getSection(key) {
  // Use the first part before the dot as the section
  return key.split('.')[0];
}

async function importFile(filePath, langCode) {
  console.log(`\n📁 Processing file: ${path.basename(filePath)}`);
  
  // Import the translation file as a module
  let translations;
  try {
    if (filePath.endsWith('.ts')) {
      // For TypeScript files, we need to handle them differently
      console.log(`⚠️  Skipping TypeScript file ${path.basename(filePath)} - please convert to .js first`);
      return;
    }
    
    console.log(`📖 Loading translations from ${path.basename(filePath)}...`);
    translations = require(filePath).default || require(filePath);
    console.log(`✅ Successfully loaded ${Object.keys(translations).length} translation keys`);
  } catch (e) {
    console.error(`❌ Failed to import ${path.basename(filePath)}:`, e.message);
    return;
  }

  const entries = Object.entries(translations);
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`🔄 Importing ${entries.length} translations for language: ${langCode}`);
  
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      const section = getSection(key);
      // Upsert (insert or update) the text
      const { error } = await supabase
        .from('website_texts')
        .upsert({
          key,
          section,
          language: langCode,
          value
        }, { onConflict: 'key,language' });
      
      if (error) {
        console.error(`❌ Error upserting ${langCode}:${key}:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }
    }
  }
  
  console.log(`✅ Completed ${path.basename(filePath)}: ${successCount} successful, ${errorCount} errors`);
  return { successCount, errorCount };
}

async function main() {
  console.log('🚀 Starting translation import...');
  console.log(`📂 Looking for translation files in: ${localesDir}`);
  
  // Check if locales directory exists
  if (!fs.existsSync(localesDir)) {
    console.error(`❌ Locales directory not found: ${localesDir}`);
    process.exit(1);
  }
  
  // Get all .cjs and .ts files
  const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.cjs') || f.endsWith('.ts'));
  
  if (files.length === 0) {
    console.error('❌ No translation files found in locales directory');
    process.exit(1);
  }
  
  console.log(`📋 Found ${files.length} translation files:`, files);
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  for (const file of files) {
    const langCode = file.replace('.cjs', '').replace('.ts', '');
    const filePath = path.join(localesDir, file);
    
    // Skip if we already processed this language (e.g., if both .cjs and .ts exist)
    if (file.endsWith('.ts') && fs.existsSync(path.join(localesDir, `${langCode}.cjs`))) {
      console.log(`⏭️  Skipping ${file} because ${langCode}.cjs already exists`);
      continue;
    }
    
    const result = await importFile(filePath, langCode);
    if (result) {
      totalSuccess += result.successCount;
      totalErrors += result.errorCount;
    }
  }
  
  console.log('\n🎉 Import complete!');
  console.log(`📊 Summary: ${totalSuccess} translations imported successfully, ${totalErrors} errors`);
  
  if (totalErrors > 0) {
    console.log('⚠️  Some errors occurred. Check the logs above for details.');
  } else {
    console.log('✅ All translations imported successfully!');
  }
}

main().catch(console.error); 