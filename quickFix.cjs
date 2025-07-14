<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'locales');

// Simple replacements for each language
const replacements = {
  'en': {
    'ABOUT_US_PREVIEW_TEXT_PLACEHOLDER': 'Leading provider of construction chemicals and solutions with over 30 years of experience in the Asia-Pacific region.',
    'PRODUCTS_TEASER_DESCRIPTION_PLACEHOLDER': 'Discover our comprehensive range of construction materials and solutions designed for professional applications.',
    'ARTICLES_TEASER_DESCRIPTION_PLACEHOLDER': 'Stay updated with the latest industry insights, technical articles, and construction best practices.',
    'CLIENT_REVIEW_1_QUOTE': 'Aftek\'s waterproofing solutions exceeded our expectations. The quality and durability of their products are outstanding.',
    'CLIENT_REVIEW_1_AUTHOR': 'John Chen',
    'CLIENT_REVIEW_1_POSITION': 'Project Manager',
    'CLIENT_REVIEW_1_COMPANY': 'Taipei Construction Co.',
    'CLIENT_REVIEW_2_QUOTE': 'The sealants and adhesives from Aftek have proven to be reliable and long-lasting in our industrial applications.',
    'CLIENT_REVIEW_2_AUTHOR': 'Sarah Kim',
    'CLIENT_REVIEW_2_POSITION': 'Technical Director',
    'CLIENT_REVIEW_2_COMPANY': 'Singapore Industrial Ltd.',
    'CLIENT_REVIEW_3_QUOTE': 'Excellent technical support and product quality. Aftek has been our trusted partner for over 5 years.',
    'CLIENT_REVIEW_3_AUTHOR': 'Michael Wong',
    'CLIENT_REVIEW_3_POSITION': 'Operations Manager',
    'CLIENT_REVIEW_3_COMPANY': 'Vietnam Manufacturing Corp.'
  },
  'ja': {
    'ABOUT_US_PREVIEW_TEXT_PLACEHOLDER': 'アジア太平洋地域で30年以上の経験を持つ建設用化学材料とソリューションの主要プロバイダー。',
    'PRODUCTS_TEASER_DESCRIPTION_PLACEHOLDER': '専門用途向けに設計された包括的な建築材料とソリューションのラインをご覧ください。',
    'ARTICLES_TEASER_DESCRIPTION_PLACEHOLDER': '最新の業界インサイト、技術記事、建設ベストプラクティスで最新情報を入手してください。',
    'CLIENT_REVIEW_1_QUOTE': 'Aftekの防水ソリューションは期待を上回りました。製品の品質と耐久性は素晴らしいです。',
    'CLIENT_REVIEW_1_AUTHOR': 'ジョン・チェン',
    'CLIENT_REVIEW_1_POSITION': 'プロジェクトマネージャー',
    'CLIENT_REVIEW_1_COMPANY': '台北建設株式会社',
    'CLIENT_REVIEW_2_QUOTE': 'Aftekのシーラントと接着剤は、当社の工業用途で信頼性が高く長持ちすることが証明されています。',
    'CLIENT_REVIEW_2_AUTHOR': 'サラ・キム',
    'CLIENT_REVIEW_2_POSITION': '技術ディレクター',
    'CLIENT_REVIEW_2_COMPANY': 'シンガポール工業株式会社',
    'CLIENT_REVIEW_3_QUOTE': '優れた技術サポートと製品品質。Aftekは5年以上にわたって私たちの信頼できるパートナーです。',
    'CLIENT_REVIEW_3_AUTHOR': 'マイケル・ウォン',
    'CLIENT_REVIEW_3_POSITION': '運営マネージャー',
    'CLIENT_REVIEW_3_COMPANY': 'ベトナム製造株式会社'
  }
};

function fixFile(lang) {
  const filePath = path.join(localesPath, `${lang}.cjs`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${lang}.cjs`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  if (replacements[lang]) {
    Object.keys(replacements[lang]).forEach(placeholder => {
      const replacement = replacements[lang][placeholder];
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(placeholder, 'g'), replacement);
        changes++;
        console.log(`  ✅ Fixed: ${placeholder}`);
      }
    });
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  💾 Saved ${lang}.cjs with ${changes} changes`);
  } else {
    console.log(`  ✅ ${lang}.cjs is already up to date`);
  }
}

console.log('🔧 Quick fix for translation files...');

// Fix English and Japanese first
fixFile('en');
fixFile('ja');

console.log('\n🎉 Quick fix completed!');
=======
const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'locales');

// Simple replacements for each language
const replacements = {
  'en': {
    'ABOUT_US_PREVIEW_TEXT_PLACEHOLDER': 'Leading provider of construction chemicals and solutions with over 30 years of experience in the Asia-Pacific region.',
    'PRODUCTS_TEASER_DESCRIPTION_PLACEHOLDER': 'Discover our comprehensive range of construction materials and solutions designed for professional applications.',
    'ARTICLES_TEASER_DESCRIPTION_PLACEHOLDER': 'Stay updated with the latest industry insights, technical articles, and construction best practices.',
    'CLIENT_REVIEW_1_QUOTE': 'Aftek\'s waterproofing solutions exceeded our expectations. The quality and durability of their products are outstanding.',
    'CLIENT_REVIEW_1_AUTHOR': 'John Chen',
    'CLIENT_REVIEW_1_POSITION': 'Project Manager',
    'CLIENT_REVIEW_1_COMPANY': 'Taipei Construction Co.',
    'CLIENT_REVIEW_2_QUOTE': 'The sealants and adhesives from Aftek have proven to be reliable and long-lasting in our industrial applications.',
    'CLIENT_REVIEW_2_AUTHOR': 'Sarah Kim',
    'CLIENT_REVIEW_2_POSITION': 'Technical Director',
    'CLIENT_REVIEW_2_COMPANY': 'Singapore Industrial Ltd.',
    'CLIENT_REVIEW_3_QUOTE': 'Excellent technical support and product quality. Aftek has been our trusted partner for over 5 years.',
    'CLIENT_REVIEW_3_AUTHOR': 'Michael Wong',
    'CLIENT_REVIEW_3_POSITION': 'Operations Manager',
    'CLIENT_REVIEW_3_COMPANY': 'Vietnam Manufacturing Corp.'
  },
  'ja': {
    'ABOUT_US_PREVIEW_TEXT_PLACEHOLDER': 'アジア太平洋地域で30年以上の経験を持つ建設用化学材料とソリューションの主要プロバイダー。',
    'PRODUCTS_TEASER_DESCRIPTION_PLACEHOLDER': '専門用途向けに設計された包括的な建築材料とソリューションのラインをご覧ください。',
    'ARTICLES_TEASER_DESCRIPTION_PLACEHOLDER': '最新の業界インサイト、技術記事、建設ベストプラクティスで最新情報を入手してください。',
    'CLIENT_REVIEW_1_QUOTE': 'Aftekの防水ソリューションは期待を上回りました。製品の品質と耐久性は素晴らしいです。',
    'CLIENT_REVIEW_1_AUTHOR': 'ジョン・チェン',
    'CLIENT_REVIEW_1_POSITION': 'プロジェクトマネージャー',
    'CLIENT_REVIEW_1_COMPANY': '台北建設株式会社',
    'CLIENT_REVIEW_2_QUOTE': 'Aftekのシーラントと接着剤は、当社の工業用途で信頼性が高く長持ちすることが証明されています。',
    'CLIENT_REVIEW_2_AUTHOR': 'サラ・キム',
    'CLIENT_REVIEW_2_POSITION': '技術ディレクター',
    'CLIENT_REVIEW_2_COMPANY': 'シンガポール工業株式会社',
    'CLIENT_REVIEW_3_QUOTE': '優れた技術サポートと製品品質。Aftekは5年以上にわたって私たちの信頼できるパートナーです。',
    'CLIENT_REVIEW_3_AUTHOR': 'マイケル・ウォン',
    'CLIENT_REVIEW_3_POSITION': '運営マネージャー',
    'CLIENT_REVIEW_3_COMPANY': 'ベトナム製造株式会社'
  }
};

function fixFile(lang) {
  const filePath = path.join(localesPath, `${lang}.cjs`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${lang}.cjs`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  if (replacements[lang]) {
    Object.keys(replacements[lang]).forEach(placeholder => {
      const replacement = replacements[lang][placeholder];
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(placeholder, 'g'), replacement);
        changes++;
        console.log(`  ✅ Fixed: ${placeholder}`);
      }
    });
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  💾 Saved ${lang}.cjs with ${changes} changes`);
  } else {
    console.log(`  ✅ ${lang}.cjs is already up to date`);
  }
}

console.log('🔧 Quick fix for translation files...');

// Fix English and Japanese first
fixFile('en');
fixFile('ja');

console.log('\n🎉 Quick fix completed!');
>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
console.log('Now you can use the translation editor to edit all languages.'); 