<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'locales');

// Products translations for each language
const productsTranslations = {
  'en': {
    'products.title': 'Products',
    'products.subtitle': 'Professional construction materials and solutions',
    'products.description': 'Discover our comprehensive range of construction chemicals, sealants, waterproofing systems, and flooring solutions.',
    'products.categories.waterproofing': 'Waterproofing Systems',
    'products.categories.sealants': 'Sealants & Adhesives',
    'products.categories.flooring': 'Flooring & Epoxy',
    'products.categories.insulation': 'Insulation & Soundproofing',
    'products.filters.title': 'Filter Products',
    'products.filters.clear': 'Clear Filters',
    'products.filters.search': 'Search products...',
    'products.filters.categories': 'Categories',
    'products.filters.applications': 'Applications',
    'products.loading': 'Loading products...',
    'products.noResults': 'No products found matching your criteria.',
    'products.viewDetails': 'View Details',
    'products.downloadSpecs': 'Download Specifications',
    'products.relatedProducts': 'Related Products'
  },
  'ja': {
    'products.title': '製品',
    'products.subtitle': 'プロフェッショナル建設材料とソリューション',
    'products.description': '包括的な建設用化学材料、シーラント、防水システム、床材ソリューションのラインをご覧ください。',
    'products.categories.waterproofing': '防水システム',
    'products.categories.sealants': 'シーラントと接着剤',
    'products.categories.flooring': '床材とエポキシ',
    'products.categories.insulation': '断熱と防音',
    'products.filters.title': '製品フィルター',
    'products.filters.clear': 'フィルターをクリア',
    'products.filters.search': '製品を検索...',
    'products.filters.categories': 'カテゴリ',
    'products.filters.applications': '用途',
    'products.loading': '製品を読み込み中...',
    'products.noResults': '条件に一致する製品が見つかりません。',
    'products.viewDetails': '詳細を見る',
    'products.downloadSpecs': '仕様書をダウンロード',
    'products.relatedProducts': '関連製品'
  },
  'ko': {
    'products.title': '제품',
    'products.subtitle': '전문 건설 자재 및 솔루션',
    'products.description': '포괄적인 건설용 화학재료, 실란트, 방수 시스템, 바닥재 솔루션 라인을 발견하세요.',
    'products.categories.waterproofing': '방수 시스템',
    'products.categories.sealants': '실란트 및 접착제',
    'products.categories.flooring': '바닥재 및 에폭시',
    'products.categories.insulation': '단열 및 방음',
    'products.filters.title': '제품 필터',
    'products.filters.clear': '필터 지우기',
    'products.filters.search': '제품 검색...',
    'products.filters.categories': '카테고리',
    'products.filters.applications': '응용 분야',
    'products.loading': '제품을 불러오는 중...',
    'products.noResults': '조건에 맞는 제품을 찾을 수 없습니다.',
    'products.viewDetails': '상세 보기',
    'products.downloadSpecs': '사양서 다운로드',
    'products.relatedProducts': '관련 제품'
  },
  'th': {
    'products.title': 'ผลิตภัณฑ์',
    'products.subtitle': 'วัสดุก่อสร้างและโซลูชันระดับมืออาชีพ',
    'products.description': 'ค้นพบผลิตภัณฑ์วัสดุก่อสร้าง สารเคมี ซีแลนต์ ระบบกันน้ำ และโซลูชันพื้นผิวที่ครอบคลุมของเรา',
    'products.categories.waterproofing': 'ระบบกันน้ำ',
    'products.categories.sealants': 'ซีแลนต์และกาว',
    'products.categories.flooring': 'พื้นผิวและอีพ็อกซี่',
    'products.categories.insulation': 'ฉนวนและกันเสียง',
    'products.filters.title': 'กรองผลิตภัณฑ์',
    'products.filters.clear': 'ล้างตัวกรอง',
    'products.filters.search': 'ค้นหาผลิตภัณฑ์...',
    'products.filters.categories': 'หมวดหมู่',
    'products.filters.applications': 'การใช้งาน',
    'products.loading': 'กำลังโหลดผลิตภัณฑ์...',
    'products.noResults': 'ไม่พบผลิตภัณฑ์ที่ตรงกับเงื่อนไขของคุณ',
    'products.viewDetails': 'ดูรายละเอียด',
    'products.downloadSpecs': 'ดาวน์โหลดข้อมูลจำเพาะ',
    'products.relatedProducts': 'ผลิตภัณฑ์ที่เกี่ยวข้อง'
  },
  'vi': {
    'products.title': 'Sản phẩm',
    'products.subtitle': 'Vật liệu xây dựng và giải pháp chuyên nghiệp',
    'products.description': 'Khám phá dòng sản phẩm vật liệu xây dựng, hóa chất, chất bịt kín, hệ thống chống thấm và giải pháp sàn toàn diện.',
    'products.categories.waterproofing': 'Hệ thống chống thấm',
    'products.categories.sealants': 'Chất bịt kín và keo dính',
    'products.categories.flooring': 'Sàn và epoxy',
    'products.categories.insulation': 'Cách nhiệt và cách âm',
    'products.filters.title': 'Lọc sản phẩm',
    'products.filters.clear': 'Xóa bộ lọc',
    'products.filters.search': 'Tìm kiếm sản phẩm...',
    'products.filters.categories': 'Danh mục',
    'products.filters.applications': 'Ứng dụng',
    'products.loading': 'Đang tải sản phẩm...',
    'products.noResults': 'Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.',
    'products.viewDetails': 'Xem chi tiết',
    'products.downloadSpecs': 'Tải thông số kỹ thuật',
    'products.relatedProducts': 'Sản phẩm liên quan'
  },
  'zh-Hans': {
    'products.title': '产品',
    'products.subtitle': '专业建筑材料与解决方案',
    'products.description': '探索我们全面的建筑材料、化学品、密封胶、防水系统和地板解决方案系列。',
    'products.categories.waterproofing': '防水系统',
    'products.categories.sealants': '密封胶和粘合剂',
    'products.categories.flooring': '地板和环氧树脂',
    'products.categories.insulation': '隔热和隔音',
    'products.filters.title': '筛选产品',
    'products.filters.clear': '清除筛选',
    'products.filters.search': '搜索产品...',
    'products.filters.categories': '类别',
    'products.filters.applications': '应用',
    'products.loading': '正在加载产品...',
    'products.noResults': '未找到符合您条件的产品。',
    'products.viewDetails': '查看详情',
    'products.downloadSpecs': '下载规格',
    'products.relatedProducts': '相关产品'
  },
  'zh-Hant': {
    'products.title': '產品',
    'products.subtitle': '專業建築材料與解決方案',
    'products.description': '探索我們全面的建築材料、化學品、密封膠、防水系統和地板解決方案系列。',
    'products.categories.waterproofing': '防水系統',
    'products.categories.sealants': '密封膠和粘合劑',
    'products.categories.flooring': '地板和環氧樹脂',
    'products.categories.insulation': '隔熱和隔音',
    'products.filters.title': '篩選產品',
    'products.filters.clear': '清除篩選',
    'products.filters.search': '搜尋產品...',
    'products.filters.categories': '類別',
    'products.filters.applications': '應用',
    'products.loading': '正在載入產品...',
    'products.noResults': '未找到符合您條件的產品。',
    'products.viewDetails': '查看詳情',
    'products.downloadSpecs': '下載規格',
    'products.relatedProducts': '相關產品'
  }
};

function addProductsTranslations() {
  console.log('🔧 Adding products translations to all language files...');
  
  const languages = ['en', 'ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];
  
  languages.forEach(lang => {
    console.log(`\n📝 Processing ${lang}...`);
    
    const filePath = path.join(localesPath, `${lang}.cjs`);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${lang}.cjs`);
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the object from the file
    const match = content.match(/const \w+ = ({[\s\S]*});/);
    if (!match) {
      console.log(`❌ Could not parse ${lang}.cjs`);
      return;
    }
    
    try {
      let translations = eval('(' + match[1] + ')');
      
      // Add products translations
      if (productsTranslations[lang]) {
        Object.keys(productsTranslations[lang]).forEach(key => {
          translations[key] = productsTranslations[lang][key];
        });
      }
      
      // Save the updated file
      const newContent = `const ${lang} = ${JSON.stringify(translations, null, 2)};\nmodule.exports = ${lang};\n`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      
      console.log(`  ✅ Added products translations to ${lang}.cjs`);
      
    } catch (e) {
      console.error(`❌ Error processing ${lang}.cjs:`, e.message);
    }
  });
  
  console.log('\n🎉 Products translations added successfully!');
  console.log('Now you can edit the products.title and other products text in the translation editor.');
}

=======
const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'locales');

// Products translations for each language
const productsTranslations = {
  'en': {
    'products.title': 'Products',
    'products.subtitle': 'Professional construction materials and solutions',
    'products.description': 'Discover our comprehensive range of construction chemicals, sealants, waterproofing systems, and flooring solutions.',
    'products.categories.waterproofing': 'Waterproofing Systems',
    'products.categories.sealants': 'Sealants & Adhesives',
    'products.categories.flooring': 'Flooring & Epoxy',
    'products.categories.insulation': 'Insulation & Soundproofing',
    'products.filters.title': 'Filter Products',
    'products.filters.clear': 'Clear Filters',
    'products.filters.search': 'Search products...',
    'products.filters.categories': 'Categories',
    'products.filters.applications': 'Applications',
    'products.loading': 'Loading products...',
    'products.noResults': 'No products found matching your criteria.',
    'products.viewDetails': 'View Details',
    'products.downloadSpecs': 'Download Specifications',
    'products.relatedProducts': 'Related Products'
  },
  'ja': {
    'products.title': '製品',
    'products.subtitle': 'プロフェッショナル建設材料とソリューション',
    'products.description': '包括的な建設用化学材料、シーラント、防水システム、床材ソリューションのラインをご覧ください。',
    'products.categories.waterproofing': '防水システム',
    'products.categories.sealants': 'シーラントと接着剤',
    'products.categories.flooring': '床材とエポキシ',
    'products.categories.insulation': '断熱と防音',
    'products.filters.title': '製品フィルター',
    'products.filters.clear': 'フィルターをクリア',
    'products.filters.search': '製品を検索...',
    'products.filters.categories': 'カテゴリ',
    'products.filters.applications': '用途',
    'products.loading': '製品を読み込み中...',
    'products.noResults': '条件に一致する製品が見つかりません。',
    'products.viewDetails': '詳細を見る',
    'products.downloadSpecs': '仕様書をダウンロード',
    'products.relatedProducts': '関連製品'
  },
  'ko': {
    'products.title': '제품',
    'products.subtitle': '전문 건설 자재 및 솔루션',
    'products.description': '포괄적인 건설용 화학재료, 실란트, 방수 시스템, 바닥재 솔루션 라인을 발견하세요.',
    'products.categories.waterproofing': '방수 시스템',
    'products.categories.sealants': '실란트 및 접착제',
    'products.categories.flooring': '바닥재 및 에폭시',
    'products.categories.insulation': '단열 및 방음',
    'products.filters.title': '제품 필터',
    'products.filters.clear': '필터 지우기',
    'products.filters.search': '제품 검색...',
    'products.filters.categories': '카테고리',
    'products.filters.applications': '응용 분야',
    'products.loading': '제품을 불러오는 중...',
    'products.noResults': '조건에 맞는 제품을 찾을 수 없습니다.',
    'products.viewDetails': '상세 보기',
    'products.downloadSpecs': '사양서 다운로드',
    'products.relatedProducts': '관련 제품'
  },
  'th': {
    'products.title': 'ผลิตภัณฑ์',
    'products.subtitle': 'วัสดุก่อสร้างและโซลูชันระดับมืออาชีพ',
    'products.description': 'ค้นพบผลิตภัณฑ์วัสดุก่อสร้าง สารเคมี ซีแลนต์ ระบบกันน้ำ และโซลูชันพื้นผิวที่ครอบคลุมของเรา',
    'products.categories.waterproofing': 'ระบบกันน้ำ',
    'products.categories.sealants': 'ซีแลนต์และกาว',
    'products.categories.flooring': 'พื้นผิวและอีพ็อกซี่',
    'products.categories.insulation': 'ฉนวนและกันเสียง',
    'products.filters.title': 'กรองผลิตภัณฑ์',
    'products.filters.clear': 'ล้างตัวกรอง',
    'products.filters.search': 'ค้นหาผลิตภัณฑ์...',
    'products.filters.categories': 'หมวดหมู่',
    'products.filters.applications': 'การใช้งาน',
    'products.loading': 'กำลังโหลดผลิตภัณฑ์...',
    'products.noResults': 'ไม่พบผลิตภัณฑ์ที่ตรงกับเงื่อนไขของคุณ',
    'products.viewDetails': 'ดูรายละเอียด',
    'products.downloadSpecs': 'ดาวน์โหลดข้อมูลจำเพาะ',
    'products.relatedProducts': 'ผลิตภัณฑ์ที่เกี่ยวข้อง'
  },
  'vi': {
    'products.title': 'Sản phẩm',
    'products.subtitle': 'Vật liệu xây dựng và giải pháp chuyên nghiệp',
    'products.description': 'Khám phá dòng sản phẩm vật liệu xây dựng, hóa chất, chất bịt kín, hệ thống chống thấm và giải pháp sàn toàn diện.',
    'products.categories.waterproofing': 'Hệ thống chống thấm',
    'products.categories.sealants': 'Chất bịt kín và keo dính',
    'products.categories.flooring': 'Sàn và epoxy',
    'products.categories.insulation': 'Cách nhiệt và cách âm',
    'products.filters.title': 'Lọc sản phẩm',
    'products.filters.clear': 'Xóa bộ lọc',
    'products.filters.search': 'Tìm kiếm sản phẩm...',
    'products.filters.categories': 'Danh mục',
    'products.filters.applications': 'Ứng dụng',
    'products.loading': 'Đang tải sản phẩm...',
    'products.noResults': 'Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.',
    'products.viewDetails': 'Xem chi tiết',
    'products.downloadSpecs': 'Tải thông số kỹ thuật',
    'products.relatedProducts': 'Sản phẩm liên quan'
  },
  'zh-Hans': {
    'products.title': '产品',
    'products.subtitle': '专业建筑材料与解决方案',
    'products.description': '探索我们全面的建筑材料、化学品、密封胶、防水系统和地板解决方案系列。',
    'products.categories.waterproofing': '防水系统',
    'products.categories.sealants': '密封胶和粘合剂',
    'products.categories.flooring': '地板和环氧树脂',
    'products.categories.insulation': '隔热和隔音',
    'products.filters.title': '筛选产品',
    'products.filters.clear': '清除筛选',
    'products.filters.search': '搜索产品...',
    'products.filters.categories': '类别',
    'products.filters.applications': '应用',
    'products.loading': '正在加载产品...',
    'products.noResults': '未找到符合您条件的产品。',
    'products.viewDetails': '查看详情',
    'products.downloadSpecs': '下载规格',
    'products.relatedProducts': '相关产品'
  },
  'zh-Hant': {
    'products.title': '產品',
    'products.subtitle': '專業建築材料與解決方案',
    'products.description': '探索我們全面的建築材料、化學品、密封膠、防水系統和地板解決方案系列。',
    'products.categories.waterproofing': '防水系統',
    'products.categories.sealants': '密封膠和粘合劑',
    'products.categories.flooring': '地板和環氧樹脂',
    'products.categories.insulation': '隔熱和隔音',
    'products.filters.title': '篩選產品',
    'products.filters.clear': '清除篩選',
    'products.filters.search': '搜尋產品...',
    'products.filters.categories': '類別',
    'products.filters.applications': '應用',
    'products.loading': '正在載入產品...',
    'products.noResults': '未找到符合您條件的產品。',
    'products.viewDetails': '查看詳情',
    'products.downloadSpecs': '下載規格',
    'products.relatedProducts': '相關產品'
  }
};

function addProductsTranslations() {
  console.log('🔧 Adding products translations to all language files...');
  
  const languages = ['en', 'ja', 'ko', 'th', 'vi', 'zh-Hans', 'zh-Hant'];
  
  languages.forEach(lang => {
    console.log(`\n📝 Processing ${lang}...`);
    
    const filePath = path.join(localesPath, `${lang}.cjs`);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${lang}.cjs`);
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the object from the file
    const match = content.match(/const \w+ = ({[\s\S]*});/);
    if (!match) {
      console.log(`❌ Could not parse ${lang}.cjs`);
      return;
    }
    
    try {
      let translations = eval('(' + match[1] + ')');
      
      // Add products translations
      if (productsTranslations[lang]) {
        Object.keys(productsTranslations[lang]).forEach(key => {
          translations[key] = productsTranslations[lang][key];
        });
      }
      
      // Save the updated file
      const newContent = `const ${lang} = ${JSON.stringify(translations, null, 2)};\nmodule.exports = ${lang};\n`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      
      console.log(`  ✅ Added products translations to ${lang}.cjs`);
      
    } catch (e) {
      console.error(`❌ Error processing ${lang}.cjs:`, e.message);
    }
  });
  
  console.log('\n🎉 Products translations added successfully!');
  console.log('Now you can edit the products.title and other products text in the translation editor.');
}

>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
addProductsTranslations(); 