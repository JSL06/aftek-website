const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'locales');
const masterLang = 'en';
const languages = ['ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];

function loadTranslations(lang) {
  const filePath = path.join(localesPath, `${lang}.cjs`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/const \w+ = ({[\s\S]*});/);
  if (!match) return null;
  try {
    return eval('(' + match[1] + ')');
  } catch (e) {
    console.error(`Error parsing ${lang}.cjs:`, e.message);
    return null;
  }
}

function saveTranslations(lang, data) {
  const filePath = path.join(localesPath, `${lang}.cjs`);
  const content = `const ${lang} = ${JSON.stringify(data, null, 2)};\nmodule.exports = ${lang};\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function syncTranslations() {
  console.log('🔄 Syncing translation files to match English...');
  const master = loadTranslations(masterLang);
  if (!master) {
    console.error('❌ Could not load English translation file.');
    return;
  }
  const masterKeys = Object.keys(master);

  languages.forEach(lang => {
    console.log(`\n📝 Processing ${lang}...`);
    let changed = false;
    let target = loadTranslations(lang) || {};
    const newTranslations = {};
    // Add all master keys in order
    masterKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        newTranslations[key] = target[key];
      } else {
        newTranslations[key] = master[key]; // fallback to English
        changed = true;
        console.log(`  ➕ Added missing key: ${key}`);
      }
    });
    // Warn and remove extra keys
    Object.keys(target).forEach(key => {
      if (!masterKeys.includes(key)) {
        changed = true;
        console.log(`  ➖ Removed extra key: ${key}`);
      }
    });
    if (changed) {
      saveTranslations(lang, newTranslations);
      console.log(`  💾 Updated ${lang}.cjs to match English.`);
    } else {
      console.log(`  ✅ ${lang}.cjs is already in sync.`);
    }
  });
  console.log('\n🎉 All translation files are now consistent and in the same order as English!');
}

syncTranslations(); 