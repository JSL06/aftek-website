-- Clear all existing products and create one template product
-- Run this script in your Supabase SQL Editor

-- 1. Clear all existing data
DELETE FROM product_translations;
DELETE FROM products;

-- 2. Reset the sequence (if using auto-increment)
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- 3. Create one template product
INSERT INTO products (
  id,
  name,
  description,
  category,
  model,
  "isActive",
  "inStock",
  "showInFeatured",
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Template Product - Test Item',
  'This is a template product for testing all website functions. You can edit this product to test the admin panel, multilingual support, and all features.',
  'Test Category',
  'TEMPLATE-001',
  true,
  true,
  true,
  NOW(),
  NOW()
);

-- 4. Get the ID of the created product
DO $$
DECLARE
  template_product_id UUID;
BEGIN
  SELECT id INTO template_product_id FROM products LIMIT 1;
  
  -- 5. Create translations for all 7 languages
  INSERT INTO product_translations (product_id, language_code, name, description) VALUES
    (template_product_id, 'en', 'Template Product - Test Item', 'This is a template product for testing all website functions. You can edit this product to test the admin panel, multilingual support, and all features.'),
    (template_product_id, 'zh-Hant', '模板產品 - 測試項目', '這是一個用於測試所有網站功能的模板產品。您可以編輯此產品來測試管理面板、多語言支持和所有功能。'),
    (template_product_id, 'zh-Hans', '模板产品 - 测试项目', '这是一个用于测试所有网站功能的模板产品。您可以编辑此产品来测试管理面板、多语言支持和所有功能。'),
    (template_product_id, 'ja', 'テンプレート製品 - テスト項目', 'これは、すべてのウェブサイト機能をテストするためのテンプレート製品です。管理パネル、多言語サポート、およびすべての機能をテストするために、この製品を編集できます。'),
    (template_product_id, 'ko', '템플릿 제품 - 테스트 항목', '이는 모든 웹사이트 기능을 테스트하기 위한 템플릿 제품입니다. 관리 패널, 다국어 지원 및 모든 기능을 테스트하기 위해 이 제품을 편집할 수 있습니다.'),
    (template_product_id, 'th', 'ผลิตภัณฑ์เทมเพลต - รายการทดสอบ', 'นี่คือผลิตภัณฑ์เทมเพลตสำหรับทดสอบฟังก์ชันเว็บไซต์ทั้งหมด คุณสามารถแก้ไขผลิตภัณฑ์นี้เพื่อทดสอบแผงควบคุม, การรองรับหลายภาษา และคุณสมบัติทั้งหมด'),
    (template_product_id, 'vi', 'Sản phẩm mẫu - Mục kiểm tra', 'Đây là sản phẩm mẫu để kiểm tra tất cả các chức năng của trang web. Bạn có thể chỉnh sửa sản phẩm này để kiểm tra bảng điều khiển quản trị, hỗ trợ đa ngôn ngữ và tất cả các tính năng.');
  
  RAISE NOTICE 'Template product created with ID: %', template_product_id;
  RAISE NOTICE 'Translations created for all 7 languages';
END $$;

-- 6. Verify the result
SELECT '=== TEMPLATE PRODUCT CREATED ===' as info;
SELECT 
  p.id,
  p.name,
  p.category,
  p.model,
  p."isActive",
  p."inStock",
  p."showInFeatured",
  p.created_at
FROM products p;

SELECT '=== TRANSLATIONS CREATED ===' as info;
SELECT 
  pt.product_id,
  pt.language_code,
  pt.name,
  LEFT(pt.description, 100) || '...' as description_preview
FROM product_translations pt
ORDER BY pt.language_code;

SELECT '=== READY FOR TESTING ===' as info;
SELECT 
  '1. Go to admin panel: /admin/products' as step1,
  '2. Edit the template product' as step2,
  '3. Test multilingual editing' as step3,
  '4. Test saving and loading' as step4,
  '5. Test website display' as step5;
