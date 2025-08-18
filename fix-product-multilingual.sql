-- =====================================================
-- AFTEK WEBSITE - FIX PRODUCT MULTILINGUAL STRUCTURE
-- =====================================================
-- This script fixes the product multilingual structure and translates all products
-- Run this in Supabase SQL Editor to properly structure multilingual products
-- =====================================================

-- Disable RLS to ensure we can modify the table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. ENSURE MULTILINGUAL COLUMNS EXIST
-- =====================================================

-- Add names column for multilingual names if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'names'
    ) THEN
        ALTER TABLE products ADD COLUMN names JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add descriptions column for multilingual descriptions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'descriptions'
    ) THEN
        ALTER TABLE products ADD COLUMN descriptions JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- 2. UPDATE EXISTING PRODUCTS WITH MULTILINGUAL CONTENT
-- =====================================================

-- First, let's see what products we currently have
-- This will help us understand what needs to be translated
SELECT id, name, description, category FROM products LIMIT 10;

-- =====================================================
-- 3. UPDATE PRODUCTS WITH COMPLETE MULTILINGUAL CONTENT
-- =====================================================

-- Update each product with proper multilingual structure
-- We'll move the current Traditional Chinese content to the right place
-- and add translations for all languages

-- Product 1: Waterproofing Membrane
UPDATE products 
SET 
    names = '{
        "en": "Waterproof Membrane Pro",
        "zh-Hans": "防水膜专业版",
        "zh-Hant": "防水膜專業版",
        "ja": "防水メンブレンプロ",
        "ko": "방수 멤브레인 프로",
        "th": "เมมเบรนกันน้ำโปร",
        "vi": "Màng chống thấm Pro"
    }',
    descriptions = '{
        "en": "High-performance waterproofing membrane for roofs and foundations. Provides excellent water resistance and durability.",
        "zh-Hans": "高性能防水膜，适用于屋顶和地基。提供出色的防水性和耐久性。",
        "zh-Hant": "高性能防水膜，適用於屋頂和地基。提供出色的防水性和耐久性。",
        "ja": "屋根と基礎用の高性能防水メンブレン。優れた防水性と耐久性を提供します。",
        "ko": "지붕과 기초용 고성능 방수 멤브레인. 우수한 방수성과 내구성을 제공합니다.",
        "th": "เมมเบรนกันน้ำประสิทธิภาพสูงสำหรับหลังคาและฐานราก ให้การกันน้ำและความทนทานที่ยอดเยี่ยม",
        "vi": "Màng chống thấm hiệu suất cao cho mái nhà và móng. Cung cấp khả năng chống thấm và độ bền tuyệt vời."
    }',
    name = 'Waterproof Membrane Pro',
    description = 'High-performance waterproofing membrane for roofs and foundations. Provides excellent water resistance and durability.'
WHERE category = 'Waterproofing' AND name LIKE '%防水%';

-- Product 2: Structural Repair Compound
UPDATE products 
SET 
    names = '{
        "en": "Structural Repair Compound",
        "zh-Hans": "结构修复复合物",
        "zh-Hant": "結構修復複合物",
        "ja": "構造修復コンパウンド",
        "ko": "구조 수리 컴파운드",
        "th": "สารประกอบซ่อมแซมโครงสร้าง",
        "vi": "Hợp chất sửa chữa kết cấu"
    }',
    descriptions = '{
        "en": "Advanced repair compound for structural concrete repairs. High strength and fast curing.",
        "zh-Hans": "用于结构混凝土修复的高级修复复合物。高强度，快速固化。",
        "zh-Hant": "用於結構混凝土修復的高級修復複合物。高強度，快速固化。",
        "ja": "構造コンクリート修復用の高度な修復コンパウンド。高強度で速乾性。",
        "ko": "구조 콘크리트 수리용 고급 수리 컴파운드. 고강도, 빠른 경화.",
        "th": "สารประกอบซ่อมแซมขั้นสูงสำหรับการซ่อมแซมคอนกรีตโครงสร้าง ให้ความแข็งแรงสูงและแห้งเร็ว",
        "vi": "Hợp chất sửa chữa tiên tiến cho việc sửa chữa bê tông kết cấu. Độ bền cao và đông cứng nhanh."
    }',
    name = 'Structural Repair Compound',
    description = 'Advanced repair compound for structural concrete repairs. High strength and fast curing.'
WHERE category = 'Redi-Mix G&M' AND name LIKE '%修復%';

-- Product 3: Construction Adhesive
UPDATE products 
SET 
    names = '{
        "en": "Flexible Construction Adhesive",
        "zh-Hans": "柔性建筑粘合剂",
        "zh-Hant": "柔性建築粘合劑",
        "ja": "フレキシブル建設用接着剤",
        "ko": "유연한 건설용 접착제",
        "th": "กาวก่อสร้างยืดหยุ่น",
        "vi": "Keo dán xây dựng linh hoạt"
    }',
    descriptions = '{
        "en": "Multi-purpose construction adhesive for bonding various building materials. Excellent flexibility and weather resistance.",
        "zh-Hans": "多用途建筑粘合剂，用于粘合各种建筑材料。具有出色的柔韧性和耐候性。",
        "zh-Hant": "多用途建築粘合劑，用於粘合各種建築材料。具有出色的柔韌性和耐候性。",
        "ja": "様々な建材の接着に使用する多目的建設用接着剤。優れた柔軟性と耐候性。",
        "ko": "다양한 건축 자재 접합용 다목적 건설 접착제. 우수한 유연성과 내후성.",
        "th": "กาวก่อสร้างอเนกประสงค์สำหรับการเชื่อมต่อวัสดุก่อสร้างต่างๆ ให้ความยืดหยุ่นและทนต่อสภาพอากาศที่ยอดเยี่ยม",
        "vi": "Keo dán xây dựng đa năng để kết dính các vật liệu xây dựng khác nhau. Độ linh hoạt và khả năng chống chịu thời tiết tuyệt vời."
    }',
    name = 'Flexible Construction Adhesive',
    description = 'Multi-purpose construction adhesive for bonding various building materials. Excellent flexibility and weather resistance.'
WHERE category = 'Sealants & Adhesives' AND name LIKE '%粘合%';

-- Product 4: Silicone Sealant
UPDATE products 
SET 
    names = '{
        "en": "Silicone Sealant Plus",
        "zh-Hans": "硅酮密封胶增强版",
        "zh-Hant": "矽酮密封膠增強版",
        "ja": "シリコーンシーラントプラス",
        "ko": "실리콘 실런트 플러스",
        "th": "ซิลิโคนซีแลนท์พลัส",
        "vi": "Chất bịt kín Silicon Plus"
    }',
    descriptions = '{
        "en": "Premium silicone sealant for high-performance sealing applications. Excellent adhesion and weather resistance.",
        "zh-Hans": "用于高性能密封应用的高级硅酮密封胶。具有出色的粘附性和耐候性。",
        "zh-Hant": "用於高性能密封應用的高級矽酮密封膠。具有出色的粘附性和耐候性。",
        "ja": "高性能シール用途のプレミアムシリコーンシーラント。優れた接着性と耐候性。",
        "ko": "고성능 실링 응용을 위한 프리미엄 실리콘 실런트. 우수한 접착성과 내후성.",
        "th": "ซิลิโคนซีแลนท์ระดับพรีเมียมสำหรับการใช้งานซีลประสิทธิภาพสูง ให้การยึดเกาะและทนต่อสภาพอากาศที่ยอดเยี่ยม",
        "vi": "Chất bịt kín Silicon cao cấp cho các ứng dụng bịt kín hiệu suất cao. Khả năng kết dính và chống chịu thời tiết tuyệt vời."
    }',
    name = 'Silicone Sealant Plus',
    description = 'Premium silicone sealant for high-performance sealing applications. Excellent adhesion and weather resistance.'
WHERE category = 'Sealants & Adhesives' AND name LIKE '%矽酮%';

-- Product 5: Flooring System
UPDATE products 
SET 
    names = '{
        "en": "Epoxy Flooring System",
        "zh-Hans": "环氧树脂地坪系统",
        "zh-Hant": "環氧樹脂地坪系統",
        "ja": "エポキシ床システム",
        "ko": "에폭시 바닥 시스템",
        "th": "ระบบพื้นอีพ็อกซี่",
        "vi": "Hệ thống sàn Epoxy"
    }',
    descriptions = '{
        "en": "Complete epoxy flooring system for industrial and commercial applications. Durable and chemical resistant.",
        "zh-Hans": "用于工业和商业应用的完整环氧树脂地坪系统。耐用且耐化学腐蚀。",
        "zh-Hant": "用於工業和商業應用的完整環氧樹脂地坪系統。耐用且耐化學腐蝕。",
        "ja": "産業・商業用途の完全なエポキシ床システム。耐久性と耐薬品性。",
        "ko": "산업 및 상업용 완전한 에폭시 바닥 시스템. 내구성과 내화학성.",
        "th": "ระบบพื้นอีพ็อกซี่ที่สมบูรณ์สำหรับการใช้งานในอุตสาหกรรมและเชิงพาณิชย์ ให้ความทนทานและทนต่อสารเคมี",
        "vi": "Hệ thống sàn Epoxy hoàn chỉnh cho các ứng dụng công nghiệp và thương mại. Bền bỉ và chống chịu hóa chất."
    }',
    name = 'Epoxy Flooring System',
    description = 'Complete epoxy flooring system for industrial and commercial applications. Durable and chemical resistant.'
WHERE category = 'Flooring Systems' AND name LIKE '%地坪%';

-- Product 6: Grout System
UPDATE products 
SET 
    names = '{
        "en": "Advanced Grout System",
        "zh-Hans": "高级灌浆系统",
        "zh-Hant": "高級灌漿系統",
        "ja": "高度なグラウトシステム",
        "ko": "고급 그라우트 시스템",
        "th": "ระบบกราวท์ขั้นสูง",
        "vi": "Hệ thống vữa trám tiên tiến"
    }',
    descriptions = '{
        "en": "Professional grout system for tile and stone installations. High strength and stain resistance.",
        "zh-Hans": "用于瓷砖和石材安装的专业灌浆系统。高强度，防污渍。",
        "zh-Hant": "用於瓷磚和石材安裝的專業灌漿系統。高強度，防污漬。",
        "ja": "タイル・石材設置用のプロ仕様グラウトシステム。高強度と汚れ防止。",
        "ko": "타일 및 석재 설치용 전문 그라우트 시스템. 고강도와 얼룩 방지.",
        "th": "ระบบกราวท์ระดับมืออาชีพสำหรับการติดตั้งกระเบื้องและหิน ให้ความแข็งแรงสูงและป้องกันคราบสกปรก",
        "vi": "Hệ thống vữa trám chuyên nghiệp cho việc lắp đặt gạch và đá. Độ bền cao và chống vết bẩn."
    }',
    name = 'Advanced Grout System',
    description = 'Professional grout system for tile and stone installations. High strength and stain resistance.'
WHERE category = 'Grouts' AND name LIKE '%灌漿%';

-- Product 7: Coating System
UPDATE products 
SET 
    names = '{
        "en": "Protective Coating System",
        "zh-Hans": "防护涂层系统",
        "zh-Hant": "防護塗層系統",
        "ja": "保護コーティングシステム",
        "ko": "보호 코팅 시스템",
        "th": "ระบบเคลือบป้องกัน",
        "vi": "Hệ thống phủ bảo vệ"
    }',
    descriptions = '{
        "en": "Comprehensive protective coating system for industrial and marine applications. Corrosion and UV resistant.",
        "zh-Hans": "用于工业和海洋应用的综合防护涂层系统。防腐蚀，防紫外线。",
        "zh-Hant": "用於工業和海洋應用的綜合防護塗層系統。防腐蝕，防紫外線。",
        "ja": "産業・海洋用途の包括的な保護コーティングシステム。腐食防止とUV防止。",
        "ko": "산업 및 해양용 포괄적인 보호 코팅 시스템. 부식 방지 및 자외선 방지.",
        "th": "ระบบเคลือบป้องกันที่ครอบคลุมสำหรับการใช้งานในอุตสาหกรรมและทางทะเล ให้การป้องกันการกัดกร่อนและรังสียูวี",
        "vi": "Hệ thống phủ bảo vệ toàn diện cho các ứng dụng công nghiệp và biển. Chống ăn mòn và chống tia UV."
    }',
    name = 'Protective Coating System',
    description = 'Comprehensive protective coating system for industrial and marine applications. Corrosion and UV resistant.'
WHERE category = 'Coatings' AND name LIKE '%塗層%';

-- Product 8: Additive System
UPDATE products 
SET 
    names = '{
        "en": "Construction Additive System",
        "zh-Hans": "建筑添加剂系统",
        "zh-Hant": "建築添加劑系統",
        "ja": "建設用添加剤システム",
        "ko": "건설용 첨가제 시스템",
        "th": "ระบบสารเติมแต่งสำหรับการก่อสร้าง",
        "vi": "Hệ thống phụ gia xây dựng"
    }',
    descriptions = '{
        "en": "Advanced additive system for enhancing concrete and mortar performance. Improves workability and strength.",
        "zh-Hans": "用于提高混凝土和砂浆性能的高级添加剂系统。改善和易性和强度。",
        "zh-Hant": "用於提高混凝土和砂漿性能的高級添加劑系統。改善和易性和強度。",
        "ja": "コンクリート・モルタル性能向上用の高度な添加剤システム。作業性と強度を向上。",
        "ko": "콘크리트 및 모르타르 성능 향상을 위한 고급 첨가제 시스템. 작업성과 강도 향상.",
        "th": "ระบบสารเติมแต่งขั้นสูงสำหรับการปรับปรุงประสิทธิภาพของคอนกรีตและปูน ให้การปรับปรุงความสามารถในการทำงานและความแข็งแรง",
        "vi": "Hệ thống phụ gia tiên tiến để nâng cao hiệu suất bê tông và vữa. Cải thiện khả năng thi công và độ bền."
    }',
    name = 'Construction Additive System',
    description = 'Advanced additive system for enhancing concrete and mortar performance. Improves workability and strength.'
WHERE category = 'Additives' AND name LIKE '%添加劑%';

-- =====================================================
-- 4. VERIFY THE UPDATES
-- =====================================================

-- Check the updated products
SELECT 
    id, 
    name, 
    category,
    names->>'en' as english_name,
    names->>'zh-Hant' as traditional_chinese_name,
    descriptions->>'en' as english_description,
    descriptions->>'zh-Hant' as traditional_chinese_description
FROM products 
ORDER BY category, name;

-- =====================================================
-- 5. ENABLE RLS AGAIN
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Product multilingual structure updated successfully!' as status;
