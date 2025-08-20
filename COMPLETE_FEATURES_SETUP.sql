-- =====================================================
-- COMPLETE FEATURES SYSTEM SETUP FOR AFTEK WEBSITE
-- =====================================================
-- 
-- This SQL file sets up the complete features management system
-- Run this in Supabase SQL Editor to enable full features management
--
-- What this creates:
-- 1. master_features table - stores feature definitions
-- 2. feature_translations table - stores multilingual feature names
-- 3. feature_categories table - stores feature category definitions
-- 4. category_translations table - stores multilingual category names
-- 5. Sample data for immediate use
-- 6. Proper indexes and constraints
--
-- =====================================================

-- =====================================================
-- 0. DROP EXISTING TABLES (if they exist)
-- =====================================================

-- Drop tables in correct order due to foreign key constraints
DROP TABLE IF EXISTS feature_translations CASCADE;
DROP TABLE IF EXISTS master_features CASCADE;
DROP TABLE IF EXISTS category_translations CASCADE;
DROP TABLE IF EXISTS feature_categories CASCADE;

-- =====================================================
-- 1. CREATE FEATURE CATEGORIES TABLE
-- =====================================================

CREATE TABLE feature_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_key VARCHAR(50) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE CATEGORY TRANSLATIONS TABLE
-- =====================================================

CREATE TABLE category_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES feature_categories(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, language_code)
);

-- =====================================================
-- 3. CREATE MASTER FEATURES TABLE
-- =====================================================

CREATE TABLE master_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES feature_categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE FEATURE TRANSLATIONS TABLE
-- =====================================================

CREATE TABLE feature_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID REFERENCES master_features(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, language_code)
);

-- =====================================================
-- 5. ADD FEATURES COLUMN TO PRODUCTS TABLE (if not exists)
-- =====================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_feature_categories_active ON feature_categories(is_active);
CREATE INDEX idx_feature_categories_order ON feature_categories(display_order);
CREATE INDEX idx_master_features_category ON master_features(category_id);
CREATE INDEX idx_master_features_active ON master_features(is_active);
CREATE INDEX idx_master_features_order ON master_features(display_order);
CREATE INDEX idx_feature_translations_feature ON feature_translations(feature_id);
CREATE INDEX idx_category_translations_category ON category_translations(category_id);

-- =====================================================
-- 7. INSERT SAMPLE CATEGORIES
-- =====================================================

INSERT INTO feature_categories (category_key, display_order, is_active) VALUES
('environmental-resistance', 1, true),
('performance-properties', 2, true),
('material-composition', 3, true),
('special-qualities', 4, true);

-- =====================================================
-- 8. INSERT SAMPLE CATEGORY TRANSLATIONS
-- =====================================================

-- Environment category translations
INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'en', 'Environmental', 'Features related to environmental conditions and resistance'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hant', '環境', '與環境條件和抵抗力相關的特性'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hans', '环境', '与环境条件和抵抗力相关的特性'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ja', '環境', '環境条件と耐性に関連する特性'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ko', '환경', '환경 조건과 저항력과 관련된 특성'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'th', 'สิ่งแวดล้อม', 'คุณสมบัติที่เกี่ยวข้องกับสภาพแวดล้อมและความต้านทาน'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'vi', 'Môi trường', 'Tính năng liên quan đến điều kiện môi trườngและ khả năng chống chịu'
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

-- Performance category translations
INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'en', 'Performance', 'Features related to performance and efficiency'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hant', '性能', '與性能和效率相關的特性'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hans', '性能', '与性能和效率相关的特性'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ja', '性能', '性能と効率に関連する特性'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ko', '성능', '성능과 효율성과 관련된 특성'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'th', 'ประสิทธิภาพ', 'คุณสมบัติที่เกี่ยวข้องกับประสิทธิภาพและประสิทธิผล'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'vi', 'Hiệu suất', 'Tính năng liên quan đến hiệu suất và hiệu quả'
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

-- Material Type category translations
INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'en', 'Material Type', 'Features related to the material type and composition'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hant', '材料類型', '與材料類型和組成相關的特性'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hans', '材料类型', '与材料类型和组成相关的特性'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ja', '材料タイプ', '材料タイプと組成に関連する特性'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ko', '재료 유형', '재료 유형과 구성에 관련된 특성'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'th', 'ประเภทวัสดุ', 'คุณสมบัติที่เกี่ยวข้องกับประเภทวัสดุและส่วนประกอบ'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'vi', 'Loại vật liệu', 'Tính năng liên quan đến loại vật liệu và thành phần'
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

-- Special Features category translations
INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'en', 'Special Features', 'Features related to specific properties or characteristics'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hant', '特殊特性', '與特定屬性或特性相關的特性'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'zh-Hans', '特殊特性', '与特定属性和特性相关的特性'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ja', '特殊特性', '特殊特性と特性に関連する特性'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'ko', '특수 특성', '특수 특성과 특성에 관련된 특성'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'th', 'คุณสมบัติพิเศษ', 'คุณสมบัติที่เกี่ยวข้องกับคุณสมบัติพิเศษและคุณสมบัติ'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO category_translations (category_id, language_code, display_name, description) 
SELECT fc.id, 'vi', 'Tính năng đặc biệt', 'Tính năng liên quan đến tính năng đặc biệt và tính năng'
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

-- =====================================================
-- 9. INSERT SAMPLE FEATURES
-- =====================================================

-- Environment features
INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'abrasion-resistant', fc.id, 1, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'chemical-exposure', fc.id, 2, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'dry-conditions', fc.id, 3, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'high-traffic-areas', fc.id, 4, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'uv-resistant', fc.id, 5, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'fireproof', fc.id, 6, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'waterproof', fc.id, 7, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'heat-resistant', fc.id, 8, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'cold-resistant', fc.id, 9, true
FROM feature_categories fc WHERE fc.category_key = 'environmental-resistance';

-- Performance features
INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'chemical-resistant', fc.id, 1, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'fast-cure', fc.id, 2, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'flexible', fc.id, 3, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'high-strength', fc.id, 4, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'impact-resistant', fc.id, 5, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'long-lasting', fc.id, 6, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'low-odor', fc.id, 7, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'temperature-resistant', fc.id, 8, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'weather-resistant', fc.id, 9, true
FROM feature_categories fc WHERE fc.category_key = 'performance-properties';

-- Material Type features
INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'acrylic', fc.id, 1, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'bitumen-based', fc.id, 2, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'cement-based', fc.id, 3, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'epoxy', fc.id, 4, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'fiber-reinforced', fc.id, 5, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'hybrid', fc.id, 6, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'polyurethane', fc.id, 7, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'rubber-based', fc.id, 8, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'silicone', fc.id, 9, true
FROM feature_categories fc WHERE fc.category_key = 'material-composition';

-- Special Features
INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'anti-microbial', fc.id, 1, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'biodegradable', fc.id, 2, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'eco-friendly', fc.id, 3, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'fire-resistant', fc.id, 4, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'low-voc', fc.id, 5, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'non-toxic', fc.id, 6, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'paintable', fc.id, 7, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'quick-setting', fc.id, 8, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'recyclable', fc.id, 9, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

INSERT INTO master_features (feature_key, category_id, display_order, is_active) 
SELECT 'self-leveling', fc.id, 10, true
FROM feature_categories fc WHERE fc.category_key = 'special-qualities';

-- =====================================================
-- 10. INSERT SAMPLE FEATURE TRANSLATIONS
-- =====================================================

-- Environment Features Translations
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Abrasion Resistant', 'Resistant to wear and abrasion'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐磨', '耐磨損和磨損'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐磨', '耐磨损和磨损'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐摩耗', '摩耗と磨耗に耐性'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내마모성', '마모와 마모에 저항'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนการขัดสี', 'ทนการสึกหรอและการขัดสี'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống mài mòn', 'Chống mài mòn và mài mòn'
FROM master_features mf WHERE mf.feature_key = 'abrasion-resistant';

-- Chemical Exposure
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Chemical Exposure', 'Resistant to chemical exposure'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '化學暴露', '耐化學暴露'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '化学暴露', '耐化学暴露'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '化学暴露', '化学暴露に耐性'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '화학 노출', '화학 노출에 저항'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนสารเคมี', 'ทนการสัมผัสสารเคมี'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống hóa chất', 'Chống tiếp xúc hóa chất'
FROM master_features mf WHERE mf.feature_key = 'chemical-exposure';

-- Dry Conditions
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Dry Conditions', 'Suitable for dry conditions'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '乾燥條件', '適用於乾燥條件'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '干燥条件', '适用于干燥条件'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '乾燥条件', '乾燥条件に適している'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '건조 조건', '건조 조건에 적합'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'สภาพแห้ง', 'เหมาะสำหรับสภาพแห้ง'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Điều kiện khô', 'Phù hợp với điều kiện khô'
FROM master_features mf WHERE mf.feature_key = 'dry-conditions';

-- High Traffic Areas
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'High Traffic Areas', 'Suitable for high traffic areas'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '高流量區域', '適用於高流量區域'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '高流量区域', '适用于高流量区域'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '高交通量エリア', '高交通量エリアに適している'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '고교통량 지역', '고교통량 지역에 적합'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'พื้นที่ที่มีการใช้งานสูง', 'เหมาะสำหรับพื้นที่ที่มีการใช้งานสูง'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Khu vực sử dụng cao', 'Phù hợp với khu vực sử dụng cao'
FROM master_features mf WHERE mf.feature_key = 'high-traffic-areas';

-- UV Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'UV Resistant', 'Resistant to ultraviolet radiation'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '抗紫外線', '抗紫外線輻射'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '抗紫外线', '抗紫外线辐射'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'UV耐性', '紫外線に耐性'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '자외선 저항', '자외선에 저항'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนรังสี UV', 'ทนรังสีอัลตราไวโอเลต'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống tia UV', 'Chống bức xạ tia cực tím'
FROM master_features mf WHERE mf.feature_key = 'uv-resistant';

-- Fireproof
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Fireproof', 'Resistant to fire and high temperatures'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '防火', '防火和耐高溫'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '防火', '防火和耐高温'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐火', '火災と高温に耐性'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내화', '화재와 고온에 저항'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนไฟ', 'ทนไฟและอุณหภูมิสูง'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống cháy', 'Chống cháy và chịu nhiệt cao'
FROM master_features mf WHERE mf.feature_key = 'fireproof';

-- Waterproof
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Waterproof', 'Resistant to water and moisture'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '防水', '防水和防潮'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '防水', '防水和防潮'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '防水', '水と湿気に耐性'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '방수', '물과 습기에 저항'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'กันน้ำ', 'กันน้ำและความชื้น'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống nước', 'Chống nước và ẩm ướt'
FROM master_features mf WHERE mf.feature_key = 'waterproof';

-- Heat Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Heat Resistant', 'Resistant to high temperatures'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐熱', '耐高溫'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐热', '耐高温'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐熱', '高温に耐性'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내열', '고온에 저항'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนความร้อน', 'ทนอุณหภูมิสูง'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chịu nhiệt', 'Chịu nhiệt độ cao'
FROM master_features mf WHERE mf.feature_key = 'heat-resistant';

-- Cold Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Cold Resistant', 'Resistant to low temperatures'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐寒', '耐低溫'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐寒', '耐低温'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐寒', '低温に耐性'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내한', '저온에 저항'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนความเย็น', 'ทนอุณหภูมิต่ำ'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chịu lạnh', 'Chịu nhiệt độ thấp'
FROM master_features mf WHERE mf.feature_key = 'cold-resistant';

-- Performance Features Translations
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Chemical Resistant', 'Resistant to chemical damage'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐化學', '耐化學損傷'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐化学', '耐化学损伤'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐薬品', '薬品による損傷に耐性'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내화학', '화학적 손상에 저항'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนสารเคมี', 'ทนความเสียหายจากสารเคมี'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống hóa chất', 'Chống hư hại hóa chất'
FROM master_features mf WHERE mf.feature_key = 'chemical-resistant';

-- Fast Cure
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Fast Cure', 'Quick curing time'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '快速固化', '快速固化時間'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '快速固化', '快速固化时间'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '速乾', '速い硬化時間'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '빠른 경화', '빠른 경화 시간'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'แห้งเร็ว', 'เวลาแห้งเร็ว'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Khô nhanh', 'Thời gian khô nhanh'
FROM master_features mf WHERE mf.feature_key = 'fast-cure';

-- Flexible
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Flexible', 'Flexible and bendable'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '靈活', '靈活和可彎曲'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '灵活', '灵活和可弯曲'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '柔軟', '柔軟で曲げやすい'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '유연', '유연하고 구부릴 수 있음'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ยืดหยุ่น', 'ยืดหยุ่นและโค้งงอได้'
FROM master_features mf WHERE mf.feature_key = 'flexible';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Linh hoạt', 'Linh hoạt và uốn cong được'
FROM master_features mf WHERE mf.feature_key = 'flexible';

-- High Strength
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'High Strength', 'High tensile and compressive strength'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '高強度', '高抗拉和抗壓強度'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '高强度', '高抗拉和抗压强度'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '高強度', '高い引張りと圧縮強度'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '고강도', '높은 인장 및 압축 강도'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ความแข็งแรงสูง', 'ความแข็งแรงแรงดึงและแรงอัดสูง'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Độ bền cao', 'Độ bền kéo và nén cao'
FROM master_features mf WHERE mf.feature_key = 'high-strength';

-- Impact Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Impact Resistant', 'Resistant to impact and shock'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '抗衝擊', '抗衝擊和震動'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '抗冲击', '抗冲击和震动'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '衝撃耐性', '衝撃とショックに耐性'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '충격 저항', '충격과 쇼크에 저항'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนการกระแทก', 'ทนการกระแทกและการสั่นสะเทือน'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống va đập', 'Chống va đập và chấn động'
FROM master_features mf WHERE mf.feature_key = 'impact-resistant';

-- Long Lasting
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Long Lasting', 'Extended durability and lifespan'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '持久', '延長耐用性和壽命'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '持久', '延长耐用性和寿命'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '長持ち', '長い耐久性と寿命'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '오래 지속', '연장된 내구성과 수명'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนทานยาวนาน', 'ความทนทานและอายุการใช้งานที่ยาวนาน'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Bền lâu', 'Độ bền và tuổi thọ kéo dài'
FROM master_features mf WHERE mf.feature_key = 'long-lasting';

-- Low Odor
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Low Odor', 'Minimal odor during application'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '低氣味', '施工時氣味最小'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '低气味', '施工时气味最小'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '低臭', '施工時の臭いが最小'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '낮은 냄새', '시공 시 냄새 최소'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'กลิ่นน้อย', 'กลิ่นน้อยที่สุดระหว่างการใช้งาน'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Ít mùi', 'Mùi hương tối thiểu khi thi công'
FROM master_features mf WHERE mf.feature_key = 'low-odor';

-- Temperature Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Temperature Resistant', 'Resistant to temperature extremes'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐溫', '耐極端溫度'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐温', '耐极端温度'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '温度耐性', '極端な温度に耐性'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '온도 저항', '극한 온도에 저항'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนอุณหภูมิ', 'ทนอุณหภูมิสุดขั้ว'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chịu nhiệt độ', 'Chịu nhiệt độ cực đoan'
FROM master_features mf WHERE mf.feature_key = 'temperature-resistant';

-- Weather Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Weather Resistant', 'Resistant to weather conditions'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '耐候', '耐天氣條件'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '耐候', '耐天气条件'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐候性', '天候条件に耐性'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내후성', '날씨 조건에 저항'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนสภาพอากาศ', 'ทนสภาพอากาศ'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chịu thời tiết', 'Chịu điều kiện thời tiết'
FROM master_features mf WHERE mf.feature_key = 'weather-resistant';

-- Material Type Features Translations
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Acrylic', 'Acrylic-based material'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '丙烯酸', '丙烯酸基材料'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '丙烯酸', '丙烯酸基材料'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'アクリル', 'アクリルベースの材料'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '아크릴', '아크릴 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'อะคริลิก', 'วัสดุอะคริลิก'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Acrylic', 'Vật liệu gốc acrylic'
FROM master_features mf WHERE mf.feature_key = 'acrylic';

-- Bitumen Based
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Bitumen Based', 'Bitumen-based material'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '瀝青基', '瀝青基材料'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '沥青基', '沥青基材料'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'ビチューメンベース', 'ビチューメンベースの材料'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '비투멘 기반', '비투멘 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'บิทูเมน', 'วัสดุบิทูเมน'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Bitumen', 'Vật liệu gốc bitumen'
FROM master_features mf WHERE mf.feature_key = 'bitumen-based';

-- Cement Based
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Cement Based', 'Cement-based material'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '水泥基', '水泥基材料'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '水泥基', '水泥基材料'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'セメントベース', 'セメントベースの材料'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '시멘트 기반', '시멘트 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ปูนซีเมนต์', 'วัสดุปูนซีเมนต์'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Xi măng', 'Vật liệu gốc xi măng'
FROM master_features mf WHERE mf.feature_key = 'cement-based';

-- Epoxy
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Epoxy', 'Epoxy-based material'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '環氧樹脂', '環氧樹脂基材料'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '环氧树脂', '环氧树脂基材料'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'エポキシ', 'エポキシベースの材料'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '에폭시', '에폭시 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'อีพ็อกซี่', 'วัสดุอีพ็อกซี่'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Epoxy', 'Vật liệu gốc epoxy'
FROM master_features mf WHERE mf.feature_key = 'epoxy';

-- Fiber Reinforced
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Fiber Reinforced', 'Fiber-reinforced material'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '纖維增強', '纖維增強材料'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '纤维增强', '纤维增强材料'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '繊維強化', '繊維強化材料'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '섬유 강화', '섬유 강화 재료'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'เสริมใย', 'วัสดุเสริมใย'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Gia cố sợi', 'Vật liệu gia cố sợi'
FROM master_features mf WHERE mf.feature_key = 'fiber-reinforced';

-- Hybrid
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Hybrid', 'Hybrid composite material'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '混合', '混合複合材料'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '混合', '混合复合材料'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'ハイブリッド', 'ハイブリッド複合材料'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '하이브리드', '하이브리드 복합 재료'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ไฮบริด', 'วัสดุคอมโพสิตไฮบริด'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Lai', 'Vật liệu composite lai'
FROM master_features mf WHERE mf.feature_key = 'hybrid';

-- Polyurethane
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Polyurethane', 'Polyurethane-based material'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '聚氨酯', '聚氨酯基材料'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '聚氨酯', '聚氨酯基材料'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'ポリウレタン', 'ポリウレタンベースの材料'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '폴리우레탄', '폴리우레탄 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'โพลียูรีเทน', 'วัสดุโพลียูรีเทน'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Polyurethane', 'Vật liệu gốc polyurethane'
FROM master_features mf WHERE mf.feature_key = 'polyurethane';

-- Rubber Based
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Rubber Based', 'Rubber-based material'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '橡膠基', '橡膠基材料'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '橡胶基', '橡胶基材料'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'ゴムベース', 'ゴムベースの材料'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '고무 기반', '고무 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ยาง', 'วัสดุยาง'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Cao su', 'Vật liệu gốc cao su'
FROM master_features mf WHERE mf.feature_key = 'rubber-based';

-- Silicone
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Silicone', 'Silicone-based material'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '矽膠', '矽膠基材料'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '硅胶', '硅胶基材料'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'シリコーン', 'シリコーンベースの材料'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '실리콘', '실리콘 기반 재료'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ซิลิโคน', 'วัสดุซิลิโคน'
FROM master_features mf WHERE mf.feature_key = 'silicone';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Silicone', 'Vật liệu gốc silicone'
FROM master_features mf WHERE mf.feature_key = 'silicone';

-- Special Features Translations
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Anti Microbial', 'Resistant to microbial growth'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '抗菌', '抗微生物生長'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '抗菌', '抗微生物生长'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '抗菌', '微生物の成長に耐性'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '항균', '미생물 성장에 저항'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ต้านเชื้อ', 'ต้านการเจริญเติบโตของจุลินทรีย์'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Kháng khuẩn', 'Chống sự phát triển vi sinh vật'
FROM master_features mf WHERE mf.feature_key = 'anti-microbial';

-- Biodegradable
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Biodegradable', 'Environmentally degradable material'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '生物降解', '環境可降解材料'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '生物降解', '环境可降解材料'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '生分解性', '環境で分解可能な材料'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '생분해성', '환경에서 분해 가능한 재료'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ย่อยสลายได้', 'วัสดุที่ย่อยสลายได้ในสิ่งแวดล้อม'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Phân hủy sinh học', 'Vật liệu có thể phân hủy trong môi trường'
FROM master_features mf WHERE mf.feature_key = 'biodegradable';

-- Eco Friendly
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Eco Friendly', 'Environmentally friendly material'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '環保', '環保材料'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '环保', '环保材料'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'エコフレンドリー', '環境に優しい材料'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '친환경', '환경 친화적 재료'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'เป็นมิตรกับสิ่งแวดล้อม', 'วัสดุที่เป็นมิตรกับสิ่งแวดล้อม'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Thân thiện môi trường', 'Vật liệu thân thiện môi trường'
FROM master_features mf WHERE mf.feature_key = 'eco-friendly';

-- Fire Resistant
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Fire Resistant', 'Resistant to fire and flames'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '防火', '防火和火焰'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '防火', '防火和火焰'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '耐火', '火災と炎に耐性'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '내화', '화재와 화염에 저항'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทนไฟ', 'ทนไฟและเปลวไฟ'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Chống cháy', 'Chống lửa và ngọn lửa'
FROM master_features mf WHERE mf.feature_key = 'fire-resistant';

-- Low VOC
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Low VOC', 'Low volatile organic compounds'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '低VOC', '低揮發性有機化合物'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '低VOC', '低挥发性有机化合物'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '低VOC', '低揮発性有機化合物'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '저VOC', '저휘발성 유기화합물'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'VOC ต่ำ', 'สารประกอบอินทรีย์ระเหยต่ำ'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'VOC thấp', 'Hợp chất hữu cơ bay hơi thấp'
FROM master_features mf WHERE mf.feature_key = 'low-voc';

-- Non Toxic
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Non Toxic', 'Non-toxic and safe material'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '無毒', '無毒和安全材料'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '无毒', '无毒和安全材料'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '無毒', '無毒で安全な材料'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '무독성', '무독성이고 안전한 재료'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ไม่เป็นพิษ', 'วัสดุที่ไม่เป็นพิษและปลอดภัย'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Không độc hại', 'Vật liệu không độc hại và an toàn'
FROM master_features mf WHERE mf.feature_key = 'non-toxic';

-- Paintable
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Paintable', 'Can be painted over'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '可塗漆', '可以塗漆'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '可涂漆', '可以涂漆'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '塗装可能', '塗装可能'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '도장 가능', '도장 가능'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ทาสีได้', 'สามารถทาสีได้'
FROM master_features mf WHERE mf.feature_key = 'paintable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Có thể sơn', 'Có thể sơn lên'
FROM master_features mf WHERE mf.feature_key = 'paintable';

-- Quick Setting
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Quick Setting', 'Fast setting time'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '快乾', '快速乾燥時間'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '快干', '快速干燥时间'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', '速乾', '速い硬化時間'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '빠른 건조', '빠른 건조 시간'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'แห้งเร็ว', 'เวลาแห้งเร็ว'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Khô nhanh', 'Thời gian khô nhanh'
FROM master_features mf WHERE mf.feature_key = 'quick-setting';

-- Recyclable
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Recyclable', 'Can be recycled'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '可回收', '可以回收'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '可回收', '可以回收'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'リサイクル可能', 'リサイクル可能'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '재활용 가능', '재활용 가능'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'รีไซเคิลได้', 'สามารถรีไซเคิลได้'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Có thể tái chế', 'Có thể tái chế'
FROM master_features mf WHERE mf.feature_key = 'recyclable';

-- Self Leveling
INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'en', 'Self Leveling', 'Self-leveling material'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hant', '自流平', '自流平材料'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'zh-Hans', '自流平', '自流平材料'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ja', 'セルフレベリング', 'セルフレベリング材料'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'ko', '셀프레벨링', '셀프레벨링 재료'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'th', 'ปรับระดับตัวเอง', 'วัสดุปรับระดับตัวเอง'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

INSERT INTO feature_translations (feature_id, language_code, display_name, description) 
SELECT mf.id, 'vi', 'Tự san phẳng', 'Vật liệu tự san phẳng'
FROM master_features mf WHERE mf.feature_key = 'self-leveling';

-- =====================================================
-- 11. CREATE UPDATED AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_feature_categories_updated_at
    BEFORE UPDATE ON feature_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_features_updated_at
    BEFORE UPDATE ON master_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_translations_updated_at
    BEFORE UPDATE ON category_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_translations_updated_at
    BEFORE UPDATE ON feature_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Check tables created
SELECT 'Tables created successfully!' as status;

-- Check sample data
SELECT 
    'Categories created: ' || COUNT(*) as categories_count
FROM feature_categories;

SELECT 
    'Features created: ' || COUNT(*) as features_count
FROM master_features;

SELECT 
    'Category translations: ' || COUNT(*) as category_translations_count
FROM category_translations;

SELECT 
    'Feature translations: ' || COUNT(*) as feature_translations_count
FROM feature_translations;

-- Show sample data
SELECT 'Sample categories:' as info;
SELECT 
    fc.category_key,
    ct.display_name,
    fc.display_order,
    fc.is_active
FROM feature_categories fc
JOIN category_translations ct ON fc.id = ct.category_id
WHERE ct.language_code = 'en'
ORDER BY fc.display_order;

SELECT 'Sample features:' as info;
SELECT 
    mf.feature_key,
    ct.display_name as category,
    ft.display_name as feature_name,
    mf.display_order,
    mf.is_active
FROM master_features mf
JOIN feature_categories fc ON mf.category_id = fc.id
JOIN category_translations ct ON fc.id = ct.category_id
JOIN feature_translations ft ON mf.id = ft.feature_id
WHERE ct.language_code = 'en' AND ft.language_code = 'en'
ORDER BY fc.display_order, mf.display_order;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Your features system is now ready! You can:
-- 1. Use the FeaturesEditor in the admin panel
-- 2. Add/edit/delete features and categories
-- 3. Manage multilingual translations
-- 4. Assign features to products
--
-- Next steps:
-- 1. Go to Admin Panel → Features Editor
-- 2. Start managing your features!
--
-- =====================================================
