-- =====================================================
-- AFTEK WEBSITE - COMPLETE GUIDE SYSTEM SETUP
-- =====================================================
-- This script ensures all guide tables are properly set up in Supabase
-- Run this in Supabase SQL Editor to complete the guide system setup
-- =====================================================

-- =====================================================
-- 1. CREATE GUIDE TABLES IF THEY DON'T EXIST
-- =====================================================

-- Create guide_building_types table
CREATE TABLE IF NOT EXISTS guide_building_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL DEFAULT '{}',
    description JSONB DEFAULT '{}',
    icon TEXT DEFAULT 'Building2',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide_hotspots table
CREATE TABLE IF NOT EXISTS guide_hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_type_id UUID REFERENCES guide_building_types(id) ON DELETE CASCADE,
    label JSONB NOT NULL DEFAULT '{}',
    description JSONB DEFAULT '{}',
    category TEXT DEFAULT '',
    x_position INTEGER DEFAULT 50,
    y_position INTEGER DEFAULT 50,
    width INTEGER DEFAULT 50,
    height INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide_hotspot_products table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS guide_hotspot_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotspot_id UUID REFERENCES guide_hotspots(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotspot_id, product_id)
);

-- Create guide_building_images table
CREATE TABLE IF NOT EXISTS guide_building_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_type_id UUID REFERENCES guide_building_types(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Indexes for guide_building_types
CREATE INDEX IF NOT EXISTS idx_guide_building_types_active ON guide_building_types(is_active);
CREATE INDEX IF NOT EXISTS idx_guide_building_types_order ON guide_building_types(display_order);

-- Indexes for guide_hotspots
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_building_type ON guide_hotspots(building_type_id);
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_active ON guide_hotspots(is_active);
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_order ON guide_hotspots(display_order);

-- Indexes for guide_hotspot_products
CREATE INDEX IF NOT EXISTS idx_guide_hotspot_products_hotspot ON guide_hotspot_products(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_guide_hotspot_products_product ON guide_hotspot_products(product_id);

-- Indexes for guide_building_images
CREATE INDEX IF NOT EXISTS idx_guide_building_images_building_type ON guide_building_images(building_type_id);

-- =====================================================
-- 3. INSERT DEFAULT BUILDING TYPES
-- =====================================================

-- Insert default building types if they don't exist
INSERT INTO guide_building_types (name, description, icon, display_order, is_active) 
VALUES 
(
    '{"en": "Residential Building", "zh-Hans": "住宅建筑", "zh-Hant": "住宅建築", "ja": "住宅建築", "ko": "주거용 건물", "th": "อาคารที่อยู่อาศัย", "vi": "Tòa nhà dân cư"}',
    '{"en": "Residential buildings including houses, apartments, and condominiums", "zh-Hans": "住宅建筑包括房屋、公寓和共管公寓", "zh-Hant": "住宅建築包括房屋、公寓和共管公寓", "ja": "住宅建築には家屋、アパート、マンションが含まれます", "ko": "주거용 건물에는 주택, 아파트, 콘도미니움이 포함됩니다", "th": "อาคารที่อยู่อาศัยรวมถึงบ้าน อพาร์ตเมนต์ และคอนโดมิเนียม", "vi": "Tòa nhà dân cư bao gồm nhà ở, căn hộ và chung cư"}',
    'Home',
    1,
    true
)
ON CONFLICT DO NOTHING;

INSERT INTO guide_building_types (name, description, icon, display_order, is_active) 
VALUES 
(
    '{"en": "Commercial Building", "zh-Hans": "商业建筑", "zh-Hant": "商業建築", "ja": "商業建築", "ko": "상업용 건물", "th": "อาคารเชิงพาณิชย์", "vi": "Tòa nhà thương mại"}',
    '{"en": "Commercial buildings including offices, retail spaces, and shopping centers", "zh-Hans": "商业建筑包括办公室、零售空间和购物中心", "zh-Hant": "商業建築包括辦公室、零售空間和購物中心", "ja": "商業建築にはオフィス、小売スペース、ショッピングセンターが含まれます", "ko": "상업용 건물에는 사무실, 소매 공간, 쇼핑 센터가 포함됩니다", "th": "อาคารเชิงพาณิชย์รวมถึงสำนักงาน พื้นที่ค้าปลีก และศูนย์การค้า", "vi": "Tòa nhà thương mại bao gồm văn phòng, không gian bán lẻ và trung tâm mua sắm"}',
    'Building2',
    2,
    true
)
ON CONFLICT DO NOTHING;

INSERT INTO guide_building_types (name, description, icon, display_order, is_active) 
VALUES 
(
    '{"en": "Industrial Facility", "zh-Hans": "工业设施", "zh-Hant": "工業設施", "ja": "工業施設", "ko": "산업 시설", "th": "โรงงานอุตสาหกรรม", "vi": "Cơ sở công nghiệp"}',
    '{"en": "Industrial facilities including factories, warehouses, and manufacturing plants", "zh-Hans": "工业设施包括工厂、仓库和制造厂", "zh-Hant": "工業設施包括工廠、倉庫和製造廠", "ja": "工業施設には工場、倉庫、製造工場が含まれます", "ko": "산업 시설에는 공장, 창고, 제조 공장이 포함됩니다", "th": "โรงงานอุตสาหกรรมรวมถึงโรงงาน คลังสินค้า และโรงงานผลิต", "vi": "Cơ sở công nghiệp bao gồm nhà máy, kho hàng và nhà máy sản xuất"}',
    'Factory',
    3,
    true
)
ON CONFLICT DO NOTHING;

INSERT INTO guide_building_types (name, description, icon, display_order, is_active) 
VALUES 
(
    '{"en": "Infrastructure Project", "zh-Hans": "基础设施项目", "zh-Hant": "基礎設施項目", "ja": "インフラプロジェクト", "ko": "인프라 프로젝트", "th": "โครงการโครงสร้างพื้นฐาน", "vi": "Dự án cơ sở hạ tầng"}',
    '{"en": "Infrastructure projects including bridges, roads, and public works", "zh-Hans": "基础设施项目包括桥梁、道路和公共工程", "zh-Hant": "基礎設施項目包括橋樑、道路和公共工程", "ja": "インフラプロジェクトには橋、道路、公共事業が含まれます", "ko": "인프라 프로젝트에는 다리, 도로, 공공 사업이 포함됩니다", "th": "โครงการโครงสร้างพื้นฐานรวมถึงสะพาน ถนน และงานสาธารณะ", "vi": "Dự án cơ sở hạ tầng bao gồm cầu, đường và công trình công cộng"}',
    'Building2',
    4,
    true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. INSERT SAMPLE HOTSPOTS
-- =====================================================

-- Get the first building type ID for sample hotspots
DO $$
DECLARE
    residential_id UUID;
BEGIN
    SELECT id INTO residential_id FROM guide_building_types WHERE display_order = 1 LIMIT 1;
    
    IF residential_id IS NOT NULL THEN
        -- Insert sample hotspots for residential building
        INSERT INTO guide_hotspots (building_type_id, label, description, category, x_position, y_position, width, height, display_order, is_active) 
        VALUES 
        (
            residential_id,
            '{"en": "Foundation", "zh-Hans": "地基", "zh-Hant": "地基", "ja": "基礎", "ko": "기초", "th": "ฐานราก", "vi": "Móng"}',
            '{"en": "Foundation waterproofing and structural support", "zh-Hans": "地基防水和结构支撑", "zh-Hant": "地基防水和結構支撐", "ja": "基礎防水と構造サポート", "ko": "기초 방수 및 구조 지지", "th": "การกันน้ำฐานรากและการรองรับโครงสร้าง", "vi": "Chống thấm móng và hỗ trợ kết cấu"}',
            'Foundation',
            20,
            80,
            60,
            60,
            1,
            true
        ),
        (
            residential_id,
            '{"en": "Walls", "zh-Hans": "墙体", "zh-Hant": "牆體", "ja": "壁", "ko": "벽", "th": "ผนัง", "vi": "Tường"}',
            '{"en": "Wall construction and insulation", "zh-Hans": "墙体施工和保温", "zh-Hant": "牆體施工和保溫", "ja": "壁の建設と断熱", "ko": "벽 건설 및 단열", "th": "การก่อสร้างผนังและการฉนวนกันความร้อน", "vi": "Xây dựng tường và cách nhiệt"}',
            'Walls',
            50,
            50,
            60,
            60,
            2,
            true
        ),
        (
            residential_id,
            '{"en": "Roof", "zh-Hans": "屋顶", "zh-Hant": "屋頂", "ja": "屋根", "ko": "지붕", "th": "หลังคา", "vi": "Mái nhà"}',
            '{"en": "Roof waterproofing and insulation", "zh-Hans": "屋顶防水和保温", "zh-Hant": "屋頂防水和保溫", "ja": "屋根防水と断熱", "ko": "지붕 방수 및 단열", "th": "การกันน้ำหลังคาและการฉนวนกันความร้อน", "vi": "Chống thấm mái nhà và cách nhiệt"}',
            'Roof',
            50,
            20,
            60,
            60,
            3,
            true
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- 5. SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all guide tables
ALTER TABLE guide_building_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_hotspot_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_building_images ENABLE ROW LEVEL SECURITY;

-- Create policies for guide_building_types
CREATE POLICY "Allow public read access to active building types" ON guide_building_types
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage building types" ON guide_building_types
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for guide_hotspots
CREATE POLICY "Allow public read access to active hotspots" ON guide_hotspots
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage hotspots" ON guide_hotspots
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for guide_hotspot_products
CREATE POLICY "Allow public read access to hotspot products" ON guide_hotspot_products
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage hotspot products" ON guide_hotspot_products
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for guide_building_images
CREATE POLICY "Allow public read access to building images" ON guide_building_images
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage building images" ON guide_building_images
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. VERIFY THE SETUP
-- =====================================================

-- Check if tables were created
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('guide_building_types', 'guide_hotspots', 'guide_hotspot_products', 'guide_building_images') 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'guide_%';

-- Check if building types were inserted
SELECT 
    id,
    name->>'en' as english_name,
    name->>'zh-Hant' as traditional_chinese_name,
    icon,
    display_order,
    is_active
FROM guide_building_types 
ORDER BY display_order;

-- Check if hotspots were inserted
SELECT 
    h.id,
    h.label->>'en' as english_label,
    h.label->>'zh-Hant' as traditional_chinese_label,
    bt.name->>'en' as building_type,
    h.category,
    h.x_position,
    h.y_position,
    h.is_active
FROM guide_hotspots h
JOIN guide_building_types bt ON h.building_type_id = bt.id
ORDER BY bt.display_order, h.display_order;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Guide system setup completed successfully!' as status;
