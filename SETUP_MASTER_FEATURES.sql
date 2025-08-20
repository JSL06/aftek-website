-- SETUP MASTER FEATURES SYSTEM
-- This script creates a master features table for centralized feature management
-- Run this in Supabase SQL Editor to set up the new features system

-- =====================================================
-- 1. CREATE MASTER FEATURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS master_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT UNIQUE NOT NULL, -- e.g., 'indoor-use', 'waterproof'
    category TEXT NOT NULL, -- e.g., 'environment', 'performance', 'material', 'special'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE FEATURE TRANSLATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES master_features(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL, -- 'en', 'zh-Hant', 'zh-Hans', 'ja', 'ko', 'th', 'vi'
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(feature_id, language_code)
);

-- =====================================================
-- 3. INSERT DEFAULT FEATURES (ALPHABETICALLY ORDERED)
-- =====================================================

-- Environment Category
INSERT INTO master_features (feature_key, category, display_order) VALUES
('abrasion-resistant', 'environment', 1),
('chemical-exposure', 'environment', 2),
('dry-conditions', 'environment', 3),
('high-traffic-areas', 'environment', 4),
('high-temperature', 'environment', 5),
('humid-conditions', 'environment', 6),
('indoor-use', 'environment', 7),
('low-temperature', 'environment', 8),
('outdoor-use', 'environment', 9),
('underwater', 'environment', 10)
ON CONFLICT (feature_key) DO UPDATE SET
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Performance Category
INSERT INTO master_features (feature_key, category, display_order) VALUES
('chemical-resistant', 'performance', 11),
('fast-cure', 'performance', 12),
('flexible', 'performance', 13),
('high-strength', 'performance', 14),
('impact-resistant', 'performance', 15),
('long-lasting', 'performance', 16),
('low-odor', 'performance', 17),
('temperature-resistant', 'performance', 18),
('uv-resistant', 'performance', 19),
('weather-resistant', 'performance', 20),
('waterproof', 'performance', 21)
ON CONFLICT (feature_key) DO UPDATE SET
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Material Type Category
INSERT INTO master_features (feature_key, category, display_order) VALUES
('acrylic', 'material', 22),
('bitumen-based', 'material', 23),
('cement-based', 'material', 24),
('epoxy', 'material', 25),
('fiber-reinforced', 'material', 26),
('hybrid', 'material', 27),
('polyurethane', 'material', 28),
('rubber-based', 'material', 29),
('silicone', 'material', 30)
ON CONFLICT (feature_key) DO UPDATE SET
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Special Features Category
INSERT INTO master_features (feature_key, category, display_order) VALUES
('anti-microbial', 'special', 31),
('biodegradable', 'special', 32),
('eco-friendly', 'special', 33),
('fire-resistant', 'special', 34),
('low-voc', 'special', 35),
('non-toxic', 'special', 36),
('paintable', 'special', 37),
('quick-setting', 'special', 38),
('recyclable', 'special', 39),
('self-leveling', 'special', 40)
ON CONFLICT (feature_key) DO UPDATE SET
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- =====================================================
-- 4. INSERT TRANSLATIONS FOR ALL FEATURES
-- =====================================================

-- English translations (base language)
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'en', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN 'Abrasion Resistant'
        WHEN 'chemical-exposure' THEN 'Chemical Exposure'
        WHEN 'dry-conditions' THEN 'Dry Conditions'
        WHEN 'high-traffic-areas' THEN 'High Traffic Areas'
        WHEN 'high-temperature' THEN 'High Temperature'
        WHEN 'humid-conditions' THEN 'Humid Conditions'
        WHEN 'indoor-use' THEN 'Indoor Use'
        WHEN 'low-temperature' THEN 'Low Temperature'
        WHEN 'outdoor-use' THEN 'Outdoor Use'
        WHEN 'underwater' THEN 'Underwater'
        -- Performance
        WHEN 'chemical-resistant' THEN 'Chemical Resistant'
        WHEN 'fast-cure' THEN 'Fast Cure'
        WHEN 'flexible' THEN 'Flexible'
        WHEN 'high-strength' THEN 'High Strength'
        WHEN 'impact-resistant' THEN 'Impact Resistant'
        WHEN 'long-lasting' THEN 'Long Lasting'
        WHEN 'low-odor' THEN 'Low Odor'
        WHEN 'temperature-resistant' THEN 'Temperature Resistant'
        WHEN 'uv-resistant' THEN 'UV Resistant'
        WHEN 'weather-resistant' THEN 'Weather Resistant'
        WHEN 'waterproof' THEN 'Waterproof'
        -- Material
        WHEN 'acrylic' THEN 'Acrylic'
        WHEN 'bitumen-based' THEN 'Bitumen Based'
        WHEN 'cement-based' THEN 'Cement Based'
        WHEN 'epoxy' THEN 'Epoxy'
        WHEN 'fiber-reinforced' THEN 'Fiber Reinforced'
        WHEN 'hybrid' THEN 'Hybrid'
        WHEN 'polyurethane' THEN 'Polyurethane'
        WHEN 'rubber-based' THEN 'Rubber Based'
        WHEN 'silicone' THEN 'Silicone'
        -- Special
        WHEN 'anti-microbial' THEN 'Anti Microbial'
        WHEN 'biodegradable' THEN 'Biodegradable'
        WHEN 'eco-friendly' THEN 'Eco Friendly'
        WHEN 'fire-resistant' THEN 'Fire Resistant'
        WHEN 'low-voc' THEN 'Low VOC'
        WHEN 'non-toxic' THEN 'Non Toxic'
        WHEN 'paintable' THEN 'Paintable'
        WHEN 'quick-setting' THEN 'Quick Setting'
        WHEN 'recyclable' THEN 'Recyclable'
        WHEN 'self-leveling' THEN 'Self Leveling'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Traditional Chinese translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'zh-Hant', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN '耐磨'
        WHEN 'chemical-exposure' THEN '化學暴露'
        WHEN 'dry-conditions' THEN '乾燥條件'
        WHEN 'high-traffic-areas' THEN '高流量區域'
        WHEN 'high-temperature' THEN '高溫'
        WHEN 'humid-conditions' THEN '潮濕條件'
        WHEN 'indoor-use' THEN '室內使用'
        WHEN 'low-temperature' THEN '低溫'
        WHEN 'outdoor-use' THEN '戶外使用'
        WHEN 'underwater' THEN '水下使用'
        -- Performance
        WHEN 'chemical-resistant' THEN '耐化學性'
        WHEN 'fast-cure' THEN '快速固化'
        WHEN 'flexible' THEN '靈活'
        WHEN 'high-strength' THEN '高強度'
        WHEN 'impact-resistant' THEN '抗衝擊'
        WHEN 'long-lasting' THEN '持久'
        WHEN 'low-odor' THEN '低氣味'
        WHEN 'temperature-resistant' THEN '耐溫性'
        WHEN 'uv-resistant' THEN '抗紫外線'
        WHEN 'weather-resistant' THEN '耐候性'
        WHEN 'waterproof' THEN '防水'
        -- Material
        WHEN 'acrylic' THEN '丙烯酸'
        WHEN 'bitumen-based' THEN '瀝青基'
        WHEN 'cement-based' THEN '水泥基'
        WHEN 'epoxy' THEN '環氧樹脂'
        WHEN 'fiber-reinforced' THEN '纖維增強'
        WHEN 'hybrid' THEN '混合'
        WHEN 'polyurethane' THEN '聚氨酯'
        WHEN 'rubber-based' THEN '橡膠基'
        WHEN 'silicone' THEN '矽膠'
        -- Special
        WHEN 'anti-microbial' THEN '抗菌'
        WHEN 'biodegradable' THEN '可生物降解'
        WHEN 'eco-friendly' THEN '環保'
        WHEN 'fire-resistant' THEN '防火'
        WHEN 'low-voc' THEN '低揮發性有機化合物'
        WHEN 'non-toxic' THEN '無毒'
        WHEN 'paintable' THEN '可塗漆'
        WHEN 'quick-setting' THEN '快速凝固'
        WHEN 'recyclable' THEN '可回收'
        WHEN 'self-leveling' THEN '自流平'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Simplified Chinese translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'zh-Hans', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN '耐磨'
        WHEN 'chemical-exposure' THEN '化学暴露'
        WHEN 'dry-conditions' THEN '干燥条件'
        WHEN 'high-traffic-areas' THEN '高流量区域'
        WHEN 'high-temperature' THEN '高温'
        WHEN 'humid-conditions' THEN '潮湿条件'
        WHEN 'indoor-use' THEN '室内使用'
        WHEN 'low-temperature' THEN '低温'
        WHEN 'outdoor-use' THEN '户外使用'
        WHEN 'underwater' THEN '水下使用'
        -- Performance
        WHEN 'chemical-resistant' THEN '耐化学性'
        WHEN 'fast-cure' THEN '快速固化'
        WHEN 'flexible' THEN '灵活'
        WHEN 'high-strength' THEN '高强度'
        WHEN 'impact-resistant' THEN '抗冲击'
        WHEN 'long-lasting' THEN '持久'
        WHEN 'low-odor' THEN '低气味'
        WHEN 'temperature-resistant' THEN '耐温性'
        WHEN 'uv-resistant' THEN '抗紫外线'
        WHEN 'weather-resistant' THEN '耐候性'
        WHEN 'waterproof' THEN '防水'
        -- Material
        WHEN 'acrylic' THEN '丙烯酸'
        WHEN 'bitumen-based' THEN '沥青基'
        WHEN 'cement-based' THEN '水泥基'
        WHEN 'epoxy' THEN '环氧树脂'
        WHEN 'fiber-reinforced' THEN '纤维增强'
        WHEN 'hybrid' THEN '混合'
        WHEN 'polyurethane' THEN '聚氨酯'
        WHEN 'rubber-based' THEN '橡胶基'
        WHEN 'silicone' THEN '硅胶'
        -- Special
        WHEN 'anti-microbial' THEN '抗菌'
        WHEN 'biodegradable' THEN '可生物降解'
        WHEN 'eco-friendly' THEN '环保'
        WHEN 'fire-resistant' THEN '防火'
        WHEN 'low-voc' THEN '低挥发性有机化合物'
        WHEN 'non-toxic' THEN '无毒'
        WHEN 'paintable' THEN '可涂漆'
        WHEN 'quick-setting' THEN '快速凝固'
        WHEN 'recyclable' THEN '可回收'
        WHEN 'self-leveling' THEN '自流平'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Japanese translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'ja', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN '耐摩耗性'
        WHEN 'chemical-exposure' THEN '化学暴露'
        WHEN 'dry-conditions' THEN '乾燥条件'
        WHEN 'high-traffic-areas' THEN '高交通量エリア'
        WHEN 'high-temperature' THEN '高温'
        WHEN 'humid-conditions' THEN '湿潤条件'
        WHEN 'indoor-use' THEN '屋内使用'
        WHEN 'low-temperature' THEN '低温'
        WHEN 'outdoor-use' THEN '屋外使用'
        WHEN 'underwater' THEN '水中使用'
        -- Performance
        WHEN 'chemical-resistant' THEN '耐薬品性'
        WHEN 'fast-cure' THEN '速乾'
        WHEN 'flexible' THEN '柔軟'
        WHEN 'high-strength' THEN '高強度'
        WHEN 'impact-resistant' THEN '衝撃抵抗'
        WHEN 'long-lasting' THEN '長持ち'
        WHEN 'low-odor' THEN '低臭気'
        WHEN 'temperature-resistant' THEN '耐熱性'
        WHEN 'uv-resistant' THEN 'UV耐性'
        WHEN 'weather-resistant' THEN '耐候性'
        WHEN 'waterproof' THEN '防水'
        -- Material
        WHEN 'acrylic' THEN 'アクリル'
        WHEN 'bitumen-based' THEN 'ビチューメン系'
        WHEN 'cement-based' THEN 'セメント系'
        WHEN 'epoxy' THEN 'エポキシ'
        WHEN 'fiber-reinforced' THEN '繊維強化'
        WHEN 'hybrid' THEN 'ハイブリッド'
        WHEN 'polyurethane' THEN 'ポリウレタン'
        WHEN 'rubber-based' THEN 'ゴム系'
        WHEN 'silicone' THEN 'シリコン'
        -- Special
        WHEN 'anti-microbial' THEN '抗菌'
        WHEN 'biodegradable' THEN '生分解性'
        WHEN 'eco-friendly' THEN 'エコフレンドリー'
        WHEN 'fire-resistant' THEN '耐火性'
        WHEN 'low-voc' THEN '低VOC'
        WHEN 'non-toxic' THEN '無毒'
        WHEN 'paintable' THEN '塗装可能'
        WHEN 'quick-setting' THEN '速凝'
        WHEN 'recyclable' THEN 'リサイクル可能'
        WHEN 'self-leveling' THEN '自己流平'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Korean translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'ko', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN '내마모성'
        WHEN 'chemical-exposure' THEN '화학 노출'
        WHEN 'dry-conditions' THEN '건조 조건'
        WHEN 'high-traffic-areas' THEN '고교통량 지역'
        WHEN 'high-temperature' THEN '고온'
        WHEN 'humid-conditions' THEN '습한 조건'
        WHEN 'indoor-use' THEN '실내 사용'
        WHEN 'low-temperature' THEN '저온'
        WHEN 'outdoor-use' THEN '실외 사용'
        WHEN 'underwater' THEN '수중 사용'
        -- Performance
        WHEN 'chemical-resistant' THEN '내화학성'
        WHEN 'fast-cure' THEN '빠른 경화'
        WHEN 'flexible' THEN '유연'
        WHEN 'high-strength' THEN '고강도'
        WHEN 'impact-resistant' THEN '내충격성'
        WHEN 'long-lasting' THEN '오래 지속'
        WHEN 'low-odor' THEN '저취'
        WHEN 'temperature-resistant' THEN '내열성'
        WHEN 'uv-resistant' THEN '자외선 저항'
        WHEN 'weather-resistant' THEN '내후성'
        WHEN 'waterproof' THEN '방수'
        -- Material
        WHEN 'acrylic' THEN '아크릴'
        WHEN 'bitumen-based' THEN '비투멘계'
        WHEN 'cement-based' THEN '시멘트계'
        WHEN 'epoxy' THEN '에폭시'
        WHEN 'fiber-reinforced' THEN '섬유 강화'
        WHEN 'hybrid' THEN '하이브리드'
        WHEN 'polyurethane' THEN '폴리우레탄'
        WHEN 'rubber-based' THEN '고무계'
        WHEN 'silicone' THEN '실리콘'
        -- Special
        WHEN 'anti-microbial' THEN '항균'
        WHEN 'biodegradable' THEN '생분해성'
        WHEN 'eco-friendly' THEN '친환경'
        WHEN 'fire-resistant' THEN '내화성'
        WHEN 'low-voc' THEN '저VOC'
        WHEN 'non-toxic' THEN '무독'
        WHEN 'paintable' THEN '도장 가능'
        WHEN 'quick-setting' THEN '급경화'
        WHEN 'recyclable' THEN '재활용 가능'
        WHEN 'self-leveling' THEN '자동 레벨링'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Thai translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'th', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN 'ทนการขัดสี'
        WHEN 'chemical-exposure' THEN 'ทนต่อสารเคมี'
        WHEN 'dry-conditions' THEN 'สภาพแห้ง'
        WHEN 'high-traffic-areas' THEN 'พื้นที่ที่มีการใช้งานสูง'
        WHEN 'high-temperature' THEN 'อุณหภูมิสูง'
        WHEN 'humid-conditions' THEN 'สภาพชื้น'
        WHEN 'indoor-use' THEN 'ใช้ในร่ม'
        WHEN 'low-temperature' THEN 'อุณหภูมิต่ำ'
        WHEN 'outdoor-use' THEN 'ใช้กลางแจ้ง'
        WHEN 'underwater' THEN 'ใต้น้ำ'
        -- Performance
        WHEN 'chemical-resistant' THEN 'ทนสารเคมี'
        WHEN 'fast-cure' THEN 'แห้งเร็ว'
        WHEN 'flexible' THEN 'ยืดหยุ่น'
        WHEN 'high-strength' THEN 'ความแข็งแรงสูง'
        WHEN 'impact-resistant' THEN 'ทนการกระแทก'
        WHEN 'long-lasting' THEN 'ทนทาน'
        WHEN 'low-odor' THEN 'กลิ่นน้อย'
        WHEN 'temperature-resistant' THEN 'ทนอุณหภูมิ'
        WHEN 'uv-resistant' THEN 'ทนรังสี UV'
        WHEN 'weather-resistant' THEN 'ทนสภาพอากาศ'
        WHEN 'waterproof' THEN 'กันน้ำ'
        -- Material
        WHEN 'acrylic' THEN 'อะคริลิก'
        WHEN 'bitumen-based' THEN 'ยางมะตอย'
        WHEN 'cement-based' THEN 'ซีเมนต์'
        WHEN 'epoxy' THEN 'อีพ็อกซี่'
        WHEN 'fiber-reinforced' THEN 'เสริมใย'
        WHEN 'hybrid' THEN 'ไฮบริด'
        WHEN 'polyurethane' THEN 'โพลียูรีเทน'
        WHEN 'rubber-based' THEN 'ยาง'
        WHEN 'silicone' THEN 'ซิลิโคน'
        -- Special
        WHEN 'anti-microbial' THEN 'ต้านเชื้อจุลินทรีย์'
        WHEN 'biodegradable' THEN 'ย่อยสลายได้'
        WHEN 'eco-friendly' THEN 'เป็นมิตรกับสิ่งแวดล้อม'
        WHEN 'fire-resistant' THEN 'ทนไฟ'
        WHEN 'low-voc' THEN 'VOC ต่ำ'
        WHEN 'non-toxic' THEN 'ไม่เป็นพิษ'
        WHEN 'paintable' THEN 'ทาสีได้'
        WHEN 'quick-setting' THEN 'แข็งตัวเร็ว'
        WHEN 'recyclable' THEN 'รีไซเคิลได้'
        WHEN 'self-leveling' THEN 'ปรับระดับตัวเอง'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Vietnamese translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'vi', 
    CASE feature_key
        -- Environment
        WHEN 'abrasion-resistant' THEN 'Chống mài mòn'
        WHEN 'chemical-exposure' THEN 'Chống hóa chất'
        WHEN 'dry-conditions' THEN 'Điều kiện khô'
        WHEN 'high-traffic-areas' THEN 'Khu vực có lưu lượng cao'
        WHEN 'high-temperature' THEN 'Nhiệt độ cao'
        WHEN 'humid-conditions' THEN 'Điều kiện ẩm'
        WHEN 'indoor-use' THEN 'Sử dụng trong nhà'
        WHEN 'low-temperature' THEN 'Nhiệt độ thấp'
        WHEN 'outdoor-use' THEN 'Sử dụng ngoài trời'
        WHEN 'underwater' THEN 'Dưới nước'
        -- Performance
        WHEN 'chemical-resistant' THEN 'Chống hóa chất'
        WHEN 'fast-cure' THEN 'Khô nhanh'
        WHEN 'flexible' THEN 'Linh hoạt'
        WHEN 'high-strength' THEN 'Độ bền cao'
        WHEN 'impact-resistant' THEN 'Chống va đập'
        WHEN 'long-lasting' THEN 'Bền lâu'
        WHEN 'low-odor' THEN 'Ít mùi'
        WHEN 'temperature-resistant' THEN 'Chịu nhiệt'
        WHEN 'uv-resistant' THEN 'Chống tia UV'
        WHEN 'weather-resistant' THEN 'Chống thời tiết'
        WHEN 'waterproof' THEN 'Chống thấm nước'
        -- Material
        WHEN 'acrylic' THEN 'Acrylic'
        WHEN 'bitumen-based' THEN 'Gốc bitum'
        WHEN 'cement-based' THEN 'Gốc xi măng'
        WHEN 'epoxy' THEN 'Epoxy'
        WHEN 'fiber-reinforced' THEN 'Gia cố sợi'
        WHEN 'hybrid' THEN 'Lai'
        WHEN 'polyurethane' THEN 'Polyurethane'
        WHEN 'rubber-based' THEN 'Gốc cao su'
        WHEN 'silicone' THEN 'Silicone'
        -- Special
        WHEN 'anti-microbial' THEN 'Kháng khuẩn'
        WHEN 'biodegradable' THEN 'Phân hủy sinh học'
        WHEN 'eco-friendly' THEN 'Thân thiện môi trường'
        WHEN 'fire-resistant' THEN 'Chống cháy'
        WHEN 'low-voc' THEN 'VOC thấp'
        WHEN 'non-toxic' THEN 'Không độc hại'
        WHEN 'paintable' THEN 'Có thể sơn'
        WHEN 'quick-setting' THEN 'Đông cứng nhanh'
        WHEN 'recyclable' THEN 'Có thể tái chế'
        WHEN 'self-leveling' THEN 'Tự san bằng'
        ELSE feature_key
    END
FROM master_features
ON CONFLICT (feature_id, language_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- =====================================================
-- 5. VERIFY THE SETUP
-- =====================================================

-- Show all features with their translations
SELECT 'Master Features Setup Complete!' as status;

-- Show sample data
SELECT 'Sample features by category:' as info;
SELECT 
    mf.category,
    mf.feature_key,
    mf.display_order,
    ft_en.display_name as english_name,
    ft_zh.display_name as chinese_name
FROM master_features mf
LEFT JOIN feature_translations ft_en ON mf.id = ft_en.feature_id AND ft_en.language_code = 'en'
LEFT JOIN feature_translations ft_zh ON mf.id = ft_zh.feature_id AND ft_zh.language_code = 'zh-Hant'
WHERE mf.is_active = true
ORDER BY mf.category, mf.display_order
LIMIT 20;

-- Show translation count
SELECT 'Translation coverage:' as info;
SELECT 
    language_code,
    COUNT(*) as feature_count
FROM feature_translations
GROUP BY language_code
ORDER BY language_code;
