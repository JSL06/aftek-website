-- Setup Guide System Database Tables
-- Run this in your Supabase SQL editor

-- 1. Building Types Table
CREATE TABLE IF NOT EXISTS guide_building_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL, -- Multilingual names: {"en": "Residential", "zh-Hans": "住宅", "zh-Hant": "住宅", "ja": "住宅", "ko": "주거용", "th": "ที่อยู่อาศัย", "vi": "Nhà ở"}
  description JSONB, -- Multilingual descriptions
  icon VARCHAR(50) DEFAULT 'Building2',
  image_url TEXT, -- Building diagram image
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Hotspots Table
CREATE TABLE IF NOT EXISTS guide_hotspots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_type_id UUID REFERENCES guide_building_types(id) ON DELETE CASCADE,
  label JSONB NOT NULL, -- Multilingual labels
  description JSONB, -- Multilingual descriptions
  category VARCHAR(100), -- e.g., "Foundation", "Walls", "Roof"
  x_position DECIMAL(5,2) NOT NULL, -- X coordinate (0-100)
  y_position DECIMAL(5,2) NOT NULL, -- Y coordinate (0-100)
  width DECIMAL(5,2) DEFAULT 40, -- Hotspot width
  height DECIMAL(5,2) DEFAULT 40, -- Hotspot height
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hotspot Products Association Table
CREATE TABLE IF NOT EXISTS guide_hotspot_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID REFERENCES guide_hotspots(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hotspot_id, product_id)
);

-- 4. Building Images Table
CREATE TABLE IF NOT EXISTS guide_building_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_type_id UUID REFERENCES guide_building_types(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) DEFAULT 'diagram', -- 'diagram', 'thumbnail', 'detail'
  alt_text JSONB, -- Multilingual alt text
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default building types
INSERT INTO guide_building_types (name, description, icon, display_order) VALUES
(
  '{"en": "Residential Building", "zh-Hans": "住宅建筑", "zh-Hant": "住宅建築", "ja": "住宅建築", "ko": "주거용 건물", "th": "อาคารที่อยู่อาศัย", "vi": "Tòa nhà dân cư"}',
  '{"en": "Houses, apartments, and residential complexes", "zh-Hans": "房屋、公寓和住宅综合体", "zh-Hant": "房屋、公寓和住宅綜合體", "ja": "住宅、アパート、住宅複合施設", "ko": "주택, 아파트 및 주거 단지", "th": "บ้าน อพาร์ตเมนต์ และคอมเพล็กซ์ที่อยู่อาศัย", "vi": "Nhà ở, căn hộ và khu dân cư"}',
  'Home',
  1
),
(
  '{"en": "Commercial Building", "zh-Hans": "商业建筑", "zh-Hant": "商業建築", "ja": "商業建築", "ko": "상업용 건물", "th": "อาคารพาณิชย์", "vi": "Tòa nhà thương mại"}',
  '{"en": "Offices, retail spaces, and commercial facilities", "zh-Hans": "办公室、零售空间和商业设施", "zh-Hant": "辦公室、零售空間和商業設施", "ja": "オフィス、小売スペース、商業施設", "ko": "사무실, 소매 공간 및 상업 시설", "th": "สำนักงาน พื้นที่ค้าปลีก และสิ่งอำนวยความสะดวกทางการค้า", "vi": "Văn phòng, không gian bán lẻ và cơ sở thương mại"}',
  'Building2',
  2
),
(
  '{"en": "Industrial Facility", "zh-Hans": "工业设施", "zh-Hant": "工業設施", "ja": "工業施設", "ko": "산업 시설", "th": "สิ่งอำนวยความสะดวกทางอุตสาหกรรม", "vi": "Cơ sở công nghiệp"}',
  '{"en": "Factories, warehouses, and industrial complexes", "zh-Hans": "工厂、仓库和工业综合体", "zh-Hant": "工廠、倉庫和工業綜合體", "ja": "工場、倉庫、工業複合施設", "ko": "공장, 창고 및 산업 단지", "th": "โรงงาน คลังสินค้า และคอมเพล็กซ์อุตสาหกรรม", "vi": "Nhà máy, kho hàng và khu công nghiệp"}',
  'Factory',
  3
),
(
  '{"en": "Infrastructure Project", "zh-Hans": "基础设施项目", "zh-Hant": "基礎設施項目", "ja": "インフラプロジェクト", "ko": "인프라 프로젝트", "th": "โครงการโครงสร้างพื้นฐาน", "vi": "Dự án cơ sở hạ tầng"}',
  '{"en": "Bridges, roads, tunnels, and public works", "zh-Hans": "桥梁、道路、隧道和公共工程", "zh-Hant": "橋樑、道路、隧道和公共工程", "ja": "橋、道路、トンネル、公共事業", "ko": "교량, 도로, 터널 및 공공 사업", "th": "สะพาน ถนน อุโมงค์ และงานสาธารณะ", "vi": "Cầu, đường, hầm và công trình công cộng"}',
  'Building2',
  4
)
ON CONFLICT DO NOTHING;

-- Insert sample hotspots for residential building
INSERT INTO guide_hotspots (building_type_id, label, description, category, x_position, y_position, display_order) 
SELECT 
  bt.id,
  '{"en": "Foundation", "zh-Hans": "基础", "zh-Hant": "基礎", "ja": "基礎", "ko": "기초", "th": "รากฐาน", "vi": "Móng"}',
  '{"en": "Building foundation and waterproofing", "zh-Hans": "建筑基础和防水", "zh-Hant": "建築基礎和防水", "ja": "建物の基礎と防水", "ko": "건물 기초 및 방수", "th": "รากฐานอาคารและการกันน้ำ", "vi": "Móng nhà và chống thấm"}',
  'Foundation',
  25.0,
  80.0,
  1
FROM guide_building_types bt WHERE bt.name->>'en' = 'Residential Building';

INSERT INTO guide_hotspots (building_type_id, label, description, category, x_position, y_position, display_order) 
SELECT 
  bt.id,
  '{"en": "Walls", "zh-Hans": "墙体", "zh-Hant": "牆體", "ja": "壁", "ko": "벽", "th": "ผนัง", "vi": "Tường"}',
  '{"en": "Exterior and interior walls", "zh-Hans": "外墙和内墙", "zh-Hant": "外牆和內牆", "ja": "外壁と内壁", "ko": "외벽 및 내벽", "th": "ผนังภายนอกและภายใน", "vi": "Tường ngoài và tường trong"}',
  'Walls',
  50.0,
  50.0,
  2
FROM guide_building_types bt WHERE bt.name->>'en' = 'Residential Building';

INSERT INTO guide_hotspots (building_type_id, label, description, category, x_position, y_position, display_order) 
SELECT 
  bt.id,
  '{"en": "Roof", "zh-Hans": "屋顶", "zh-Hant": "屋頂", "ja": "屋根", "ko": "지붕", "th": "หลังคา", "vi": "Mái nhà"}',
  '{"en": "Roof waterproofing and insulation", "zh-Hans": "屋顶防水和保温", "zh-Hant": "屋頂防水和保溫", "ja": "屋根の防水と断熱", "ko": "지붕 방수 및 단열", "th": "การกันน้ำและการฉนวนกันความร้อนของหลังคา", "vi": "Chống thấm mái nhà và cách nhiệt"}',
  'Roof',
  50.0,
  20.0,
  3
FROM guide_building_types bt WHERE bt.name->>'en' = 'Residential Building';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guide_hotspots_building_type ON guide_hotspots(building_type_id);
CREATE INDEX IF NOT EXISTS idx_guide_hotspot_products_hotspot ON guide_hotspot_products(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_guide_hotspot_products_product ON guide_hotspot_products(product_id);
CREATE INDEX IF NOT EXISTS idx_guide_building_images_building_type ON guide_building_images(building_type_id);

-- Enable Row Level Security
ALTER TABLE guide_building_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_hotspot_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_building_images ENABLE ROW LEVEL SECURITY;

-- Public read access for all guide tables
CREATE POLICY "Public read access for building types" ON guide_building_types FOR SELECT USING (true);
CREATE POLICY "Public read access for hotspots" ON guide_hotspots FOR SELECT USING (true);
CREATE POLICY "Public read access for hotspot products" ON guide_hotspot_products FOR SELECT USING (true);
CREATE POLICY "Public read access for building images" ON guide_building_images FOR SELECT USING (true);

-- Admin access for authenticated users
CREATE POLICY "Admin access for building types" ON guide_building_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin access for hotspots" ON guide_hotspots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin access for hotspot products" ON guide_hotspot_products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin access for building images" ON guide_building_images FOR ALL USING (auth.role() = 'authenticated');
