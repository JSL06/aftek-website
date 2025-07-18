const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = 'https://txjhhwootljiqavnnghm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amhod29vdGxqaXFhdm5uZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc5MDQsImV4cCI6MjA2NzE2MzkwNH0.fJHzXibofO5jhnWp1COLbcHkamLf1l6hzwGdLpbt7YM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Define all translations manually from the locale files
const translations = {
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.products': 'Products',
    'nav.projects': 'Projects',
    'nav.articles': 'Articles',
    'nav.guide': 'Guide',
    'nav.contact': 'Contact',
    
    // Home Page
    'home.hero.title': 'Excellence in Construction',
    'home.hero.subtitle': 'Professional construction solutions and premium materials for over 30 years',
    'home.hero.aboutBtn': 'About Us',
    'home.hero.companyProfileBtn': 'Company Profile PDF',
    'home.mission.title': 'Mission Statement',
    'home.mission.paragraph1': 'Taiwan Aftek Co., Ltd. and its affiliated companies are distributed across the entire Asia-Pacific region, covering professional manufacturers in the fields of construction sealants, adhesives, flooring materials, and waterproofing materials, providing customers with usage recommendations and consulting services for construction chemical materials.',
    'home.mission.paragraph2': 'Our original intention and sole goal is to help customers and the vast market better understand construction chemicals, learn how to maximize their industry value through the use of high-performance, innovative products that keep pace with the times, and create unlimited business opportunities together.',
    'home.services.title': 'Our Services',
    'home.services.subtitle': 'Comprehensive building materials and construction solutions across Asia-Pacific markets',
    'home.services.sealants.title': 'Sealants & Adhesives',
    'home.services.sealants.desc': 'Professional sealants and adhesives for building joints, gaps, and bonding applications. Our products provide excellent flexibility and durability for various construction materials.',
    'home.services.waterproofing.title': 'Waterproofing Systems',
    'home.services.waterproofing.desc': 'Complete waterproofing solutions to protect buildings from water damage. We offer liquid-applied and sheet membrane systems for roofs, basements, and exterior walls.',
    'home.services.flooring.title': 'Flooring & Epoxy',
    'home.services.flooring.desc': 'Industrial and commercial flooring solutions including epoxy coatings, self-leveling compounds, and decorative floor finishes for various applications.',
    'home.services.grout.title': 'Redi-Mix G&M',
    'home.services.grout.desc': 'Ready-mixed grouts and mortars for construction and repair applications. High-strength, non-shrink formulations for structural and non-structural use.',
    'home.about.title': 'About Aftek',
    'home.about.desc': 'With over 30 years of experience in the construction materials industry, Aftek has established itself as a trusted partner for contractors, architects, and builders across the Asia-Pacific region.',
    'home.explore.title': 'Explore Our Solutions',
    'home.explore.products.title': 'Our Products',
    'home.explore.products.desc': 'Discover our comprehensive range of construction chemicals, from waterproofing membranes to high-performance adhesives, designed to meet the demanding requirements of modern construction projects.',
    'home.explore.products.btn': 'View Products',
    'home.explore.articles.title': 'Latest Articles',
    'home.explore.articles.desc': 'Stay informed with the latest industry insights, technical guides, and construction best practices from our team of experts and technical specialists.',
    'home.explore.articles.btn': 'Read Articles',
    'home.brochure.title': 'Download Our Catalog',
    'home.brochure.desc': 'Download our comprehensive brochure featuring technical specifications, application guides, and case studies.',
    'home.brochure.btn': 'Download Full Catalog (PDF)',
    'home.projects.title': 'Past Projects',
    'home.projects.desc': 'Explore our portfolio of successful construction projects across Asia-Pacific',
    'home.projects.viewAll': 'View All Projects',
    'home.recommended.title': 'Recommended Products',
    'home.recommended.subtitle': 'Discover our most popular and trusted construction solutions',
    'home.recommended.viewAll': 'View All Products',
    'home.featured.title': 'Featured Products',
    'home.featured.subtitle': 'Discover Our Best-Selling Solutions',
    'home.reviews.title': 'Client Reviews',
    'home.reviews.subtitle': 'What Our Clients Say About Us',
    
    // Footer
    'footer.contact.title': 'Contact Us',
    'footer.contact.phone': 'Phone',
    'footer.contact.phone.value': '02-2799-6558',
    'footer.contact.hours': 'Hours',
    'footer.contact.hours.value': '08:30–17:30',
    'footer.contact.email': 'Email',
    'footer.contact.email.value': 'info@aftek.com.tw',
    'footer.links.title': 'Quick Links',
    'footer.products.title': 'Products',
    'footer.company.title': 'Company',
    'footer.company.desc': 'Professional construction materials and solutions provider across Asia-Pacific region.',
    'footer.copyright': 'Taiwan Aftek Co., Ltd. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    
    // Common UI
    'ui.learnMore': 'Learn More',
    'ui.viewAll': 'View All',
    'ui.download': 'Download',
    'ui.readMore': 'Read More',
    'ui.contactUs': 'Contact Us',
    'ui.getQuote': 'Get Quote',
    'ui.backToProducts': 'Back to Products',
    
    // Chatbot
    'chatbot.title': 'How can we help?',
    'chatbot.placeholder': 'Ask about our products...',
    'chatbot.send': 'Send',
    'chatbot.typing': 'Typing...',
    
    // About Page
    'about.title': 'About',
    'about.hero.title': 'About Aftek',
    'about.hero.subtitle': 'Building excellence through innovative construction solutions',
    'about.mission.title': 'Our Mission',
    'about.vision.title': 'Our Vision',
    'about.vision.content': 'To be the leading provider of innovative construction chemical solutions across the Asia-Pacific region, setting new standards for quality, performance, and sustainability in the building industry.',
    'about.values.title': 'Our Values',
    'about.values.quality': 'Quality Excellence',
    'about.values.innovation': 'Continuous Innovation',
    'about.values.service': 'Customer Service',
    'about.values.sustainability': 'Environmental Responsibility',
    'about.team.title': 'Leadership Team',
    'about.history.title': 'Our History',
    'about.history.content': 'Founded in 1990, Aftek has grown from a local supplier to a regional leader in construction chemicals, serving major projects across Taiwan, Southeast Asia, and beyond.',
    'about.timeline.title': 'Our Journey',
    
    // Contact Page
    'contact.title': 'Contact',
    'contact.subtitle': 'Get in touch with our team to discuss your construction material needs and project requirements.',
    'contact.info.title': 'Contact Information',
    'contact.info.address': 'Address',
    'contact.info.phone': 'Phone',
    'contact.info.email': 'Email',
    'contact.info.hours': 'Business Hours',
    'contact.location.title': 'Our Location',
    'contact.form.title': 'Send us a Message',
    'contact.form.firstName': 'First Name',
    'contact.form.firstName.placeholder': 'Enter your first name',
    'contact.form.lastName': 'Last Name',
    'contact.form.lastName.placeholder': 'Enter your last name',
    'contact.form.company': 'Company',
    'contact.form.company.placeholder': 'Enter your company',
    'contact.form.email': 'Email',
    'contact.form.email.placeholder': 'Enter your email',
    'contact.form.phone': 'Phone',
    'contact.form.phone.placeholder': 'Enter your phone number',
    'contact.form.subject': 'Subject',
    'contact.form.subject.placeholder': 'Enter the subject',
    'contact.form.message': 'Message',
    'contact.form.message.placeholder': 'Type your message here',
    'contact.form.submit': 'Send Message',
    
    // Products Page
    'products.title': 'Products',
    'products.subtitle': 'Professional construction chemicals and building materials',
    'products.filters.all': 'All Categories',
    'products.filters.waterproofing': 'Waterproofing',
    'products.filters.sealants': 'Sealants & Adhesives',
    'products.filters.flooring': 'Flooring Systems',
    'products.filters.grout': 'Redi-Mix G&M',
    'products.filters.insulation': 'Insulation & Coatings',
    'products.search.placeholder': 'Search products...',
    'products.viewDetails': 'View Details',
    'products.specifications': 'Specifications',
    'products.features': 'Key Features',
    'products.applications': 'Applications',
    'products.downloads': 'Downloads',
    
    // Projects Page
    'projects.title': 'Projects',
    'projects.subtitle': 'Successful construction projects across Asia-Pacific region',
    'projects.viewDetails': 'View Project Details',
    'projects.category': 'Category',
    'projects.location': 'Location',
    
    // Articles Page
    'articles.title': 'Articles & News',
    'articles.subtitle': 'Latest industry insights and technical information',
    'articles.readMore': 'Read More',
    'articles.published': 'Published',
    'articles.author': 'Author',
    'articles.category': 'Category',
    
    // Resources Page
    'resources.title': 'Resources',
    'resources.subtitle': 'Technical guides, specifications, and documentation',
    'resources.download': 'Download',
    'resources.view': 'View',
    'resources.specifications': 'Technical Specifications',
    'resources.safety': 'Safety Data Sheets',
    'resources.applications': 'Application Guides'
  },
  
  'zh-Hant': {
    // Navigation
    'nav.home': '首頁',
    'nav.about': '關於我們',
    'nav.products': '產品',
    'nav.projects': '專案',
    'nav.articles': '文章',
    'nav.guide': '使用指南',
    'nav.contact': '聯絡我們',
    
    // Home Page
    'home.hero.title': '卓越建築工程',
    'home.hero.subtitle': '超過30年的專業建築解決方案和優質材料',
    'home.hero.aboutBtn': '關於我們',
    'home.hero.companyProfileBtn': '公司簡介PDF',
    'home.mission.title': '使命宣言',
    'home.mission.paragraph1': '台灣Aftek有限公司及其關聯企業分布於整個亞太地區，涵蓋建築密封膠、黏合劑、地板材料與防水材料等領域的專業製造商，為客戶提供建築化學材料的使用建議與諮詢服務。',
    'home.mission.paragraph2': '我們的初衷且唯一的目標，就是協助客戶及廣垠市場進一步認識建材化學，了解如何藉由使用具高效能、與時並進之創新產品，將自身產業價值最大化，以期共創無限商機。',
    'home.services.title': '我們的服務',
    'home.services.subtitle': '橫跨亞太市場的綜合建築材料和建築解決方案',
    'home.services.sealants.title': '密封劑與黏合劑',
    'home.services.sealants.desc': '用於建築接縫、縫隙和黏接應用的專業密封劑和黏合劑。我們的產品為各種建築材料提供優異的柔韌性和耐久性。',
    'home.services.waterproofing.title': '防水系統',
    'home.services.waterproofing.desc': '保護建築物免受水損害的完整防水解決方案。我們為屋頂、地下室和外牆提供液體塗布和片狀薄膜系統。',
    'home.services.flooring.title': '地板與環氧樹脂',
    'home.services.flooring.desc': '工業和商業地板解決方案，包括環氧樹脂塗料、自流平化合物和各種應用的裝飾地板飾面。',
    'home.services.grout.title': 'Redi-Mix G&M',
    'home.services.grout.desc': '用於建築和修復應用的預拌水泥漿和砂漿。結構和非結構用途的高強度、無收縮配方。',
    'home.about.title': '關於Aftek',
    'home.about.desc': '憑藉在建築材料行業超過30年的經驗，Aftek已成為亞太地區承包商、建築師和建築商的可信合作夥伴。',
    'home.explore.title': '探索我們的解決方案',
    'home.explore.products.title': '我們的產品',
    'home.explore.products.desc': '探索我們全方位的建築化學品，從防水薄膜到高性能黏合劑，專為滿足現代建築專案的嚴格要求而設計。',
    'home.explore.products.btn': '查看產品',
    'home.explore.articles.title': '最新文章',
    'home.explore.articles.desc': '透過我們專家和技術專家團隊的最新行業洞察、技術指南和建築最佳實務保持資訊更新。',
    'home.explore.articles.btn': '閱讀文章',
    'home.brochure.title': '下載我們的目錄',
    'home.brochure.desc': '下載我們的綜合手冊，包含技術規格、應用指南和案例研究。',
    'home.brochure.btn': '下載完整目錄 (PDF)',
    'home.projects.title': '過往專案',
    'home.projects.desc': '探索我們在亞太地區成功建築專案的作品集',
    'home.projects.viewAll': '查看所有專案',
    'home.recommended.title': '推薦產品',
    'home.recommended.subtitle': '探索我們最受歡迎和最可信賴的建設解決方案',
    'home.recommended.viewAll': '查看所有產品',
    'home.featured.title': '精選產品',
    'home.featured.subtitle': '探索我們的最佳銷售解決方案',
    'home.reviews.title': '客戶評價',
    'home.reviews.subtitle': '客戶對我們的評價',
    
    // Footer
    'footer.contact.title': '聯絡我們',
    'footer.contact.phone': '電話',
    'footer.contact.phone.value': '02-2799-6558',
    'footer.contact.hours': '時間',
    'footer.contact.hours.value': '08:30–17:30',
    'footer.contact.email': '電子郵件',
    'footer.contact.email.value': 'info@aftek.com.tw',
    'footer.links.title': '快速連結',
    'footer.products.title': '產品',
    'footer.company.title': '公司',
    'footer.company.desc': '亞太地區專業建築材料與解決方案提供商。',
    'footer.copyright': '台灣Aftek有限公司 版權所有。',
    'footer.privacy': '隱私政策',
    'footer.terms': '服務條款',
    
    // Common UI
    'ui.learnMore': '了解更多',
    'ui.viewAll': '查看全部',
    'ui.download': '下載',
    'ui.readMore': '閱讀更多',
    'ui.contactUs': '聯絡我們',
    'ui.getQuote': '取得報價',
    'ui.backToProducts': '返回產品',
    
    // Chatbot
    'chatbot.title': '我們如何協助您？',
    'chatbot.placeholder': '詢問我們的產品...',
    'chatbot.send': '發送',
    'chatbot.typing': '輸入中...',
    
    // About Page
    'about.title': '關於我們',
    'about.hero.title': '關於Aftek',
    'about.hero.subtitle': '透過創新建築解決方案建立卓越',
    'about.mission.title': '我們的使命',
    'about.vision.title': '我們的願景',
    'about.vision.content': '成為亞太地區領先的創新建築化學解決方案提供商，在建築行業中為品質、性能和可持續性設立新標準。',
    'about.values.title': '我們的價值觀',
    'about.values.quality': '品質卓越',
    'about.values.innovation': '持續創新',
    'about.values.service': '客戶服務',
    'about.values.sustainability': '環境責任',
    'about.team.title': '領導團隊',
    'about.history.title': '我們的歷史',
    'about.history.content': '成立於1990年，雅德科技從本地供應商發展成為建築化學品的區域領導者，為台灣、東南亞及其他地區的重大項目提供服務。',
    'about.timeline.title': '我們的歷程',
    
    // Contact Page
    'contact.title': '聯絡我們',
    'contact.subtitle': '與我們的團隊聯繫，討論您的建築材料需求和專案要求。',
    'contact.info.title': '聯絡資訊',
    'contact.info.address': '地址',
    'contact.info.phone': '電話',
    'contact.info.email': '電子郵件',
    'contact.info.hours': '營業時間',
    'contact.location.title': '我們的位置',
    'contact.form.title': '發送訊息給我們',
    'contact.form.firstName': '名字',
    'contact.form.firstName.placeholder': '輸入您的名字',
    'contact.form.lastName': '姓氏',
    'contact.form.lastName.placeholder': '輸入您的姓氏',
    'contact.form.company': '公司',
    'contact.form.company.placeholder': '輸入您的公司',
    'contact.form.email': '電子郵件',
    'contact.form.email.placeholder': '輸入您的電子郵件',
    'contact.form.phone': '電話',
    'contact.form.phone.placeholder': '輸入您的電話號碼',
    'contact.form.subject': '主旨',
    'contact.form.subject.placeholder': '輸入主旨',
    'contact.form.message': '訊息',
    'contact.form.message.placeholder': '在此輸入您的訊息',
    'contact.form.submit': '發送訊息',
    
    // Products Page
    'products.title': '產品',
    'products.subtitle': '專業建築化學品和建築材料',
    'products.filters.all': '所有類別',
    'products.filters.waterproofing': '防水',
    'products.filters.sealants': '密封劑與黏合劑',
    'products.filters.flooring': '地板系統',
    'products.filters.grout': 'Redi-Mix G&M',
    'products.filters.insulation': '隔熱與塗料',
    'products.search.placeholder': '搜尋產品...',
    'products.viewDetails': '查看詳情',
    'products.specifications': '規格',
    'products.features': '主要特色',
    'products.applications': '應用',
    'products.downloads': '下載',
    
    // Projects Page
    'projects.title': '專案',
    'projects.subtitle': '亞太地區成功的建築專案',
    'projects.viewDetails': '查看專案詳情',
    'projects.category': '類別',
    'projects.location': '位置',
    
    // Articles Page
    'articles.title': '文章與新聞',
    'articles.subtitle': '最新行業洞察和技術資訊',
    'articles.readMore': '閱讀更多',
    'articles.published': '發布日期',
    'articles.author': '作者',
    'articles.category': '類別',
    
    // Resources Page
    'resources.title': '資源',
    'resources.subtitle': '技術指南、規格和文件',
    'resources.download': '下載',
    'resources.view': '查看',
    'resources.specifications': '技術規格',
    'resources.safety': '安全資料表',
    'resources.applications': '應用指南'
  }
};

// Helper function to extract section from key
function getSection(key) {
  const parts = key.split('.');
  return parts[0] || 'common';
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
    
    for (const [langCode, langData] of Object.entries(translations)) {
      console.log(`📝 Processing ${langCode}...`);
      
      for (const [key, value] of Object.entries(langData)) {
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
      
      console.log(`✅ Processed ${Object.keys(langData).length} keys for ${langCode}`);
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