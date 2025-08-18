-- =====================================================
-- AFTEK WEBSITE - SETUP MULTILINGUAL PRODUCTS
-- =====================================================
-- This script creates a proper multilingual structure for products
-- Run this in Supabase SQL Editor to fix the translation issues
-- =====================================================

-- =====================================================
-- 1. CREATE PRODUCT TRANSLATIONS TABLE
-- =====================================================

-- Create a table to store product translations
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL CHECK (language_code IN ('en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'th', 'vi')),
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language_code);

-- =====================================================
-- 2. CREATE RLS POLICIES FOR PRODUCT TRANSLATIONS
-- =====================================================

-- Enable RLS on the new table
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product translations
CREATE POLICY "Allow public read access to product translations" ON product_translations
    FOR SELECT USING (true);

-- Allow authenticated users to manage product translations
CREATE POLICY "Allow authenticated users to manage product translations" ON product_translations
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. MIGRATE EXISTING PRODUCT DATA
-- =====================================================

-- Insert existing product data as Traditional Chinese translations
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'zh-Hant' as language_code,
    name,
    description
FROM products 
WHERE name IS NOT NULL AND name != ''
ON CONFLICT (product_id, language_code) DO NOTHING;

-- =====================================================
-- 4. INSERT TRANSLATIONS FOR EXISTING PRODUCTS
-- =====================================================

-- Insert English translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'en' as language_code,
    'XOO11 Floor Composite Sound Insulation Material' as name,
    'XOO11 floor composite sound insulation material is suitable for application in floor interlayers, combining a viscoelastic polymer sound insulation coating and a layer of polyester fiber, giving this product excellent waterproofing and sound absorption and noise reduction performance.' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Simplified Chinese translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'zh-Hans' as language_code,
    'XOO11 楼板复合隔音材' as name,
    'XOO11楼板复合隔音材适合施作在楼地板夹层，藉由结合一黏弹性聚合隔音涂膜及一层聚酯纤维，赋予本产品极佳防水兼吸音减噪性能。' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Japanese translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ja' as language_code,
    'XOO11 床板複合防音材' as name,
    'XOO11床板複合防音材は床板のサンドイッチ構造に適しており、粘弾性ポリマー防音コーティングとポリエステル繊維の層を組み合わせることで、優れた防水性と吸音・防音性能を提供します。' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Korean translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ko' as language_code,
    'XOO11 바닥 복합 방음재' as name,
    'XOO11 바닥 복합 방음재는 바닥 인터레이어에 적용하기에 적합하며, 점탄성 폴리머 방음 코팅과 폴리에스터 섬유 층을 결합하여 우수한 방수 및 흡음 및 소음 감소 성능을 제공합니다.' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Thai translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'th' as language_code,
    'XOO11 วัสดุกันเสียงแบบผสมสำหรับพื้น' as name,
    'XOO11 วัสดุกันเสียงแบบผสมสำหรับพื้นเหมาะสำหรับการใช้งานในชั้นระหว่างพื้น โดยการรวมกันของโพลิเมอร์กันเสียงแบบเหนียวและชั้นของโพลิเอสเตอร์ไฟเบอร์ ให้ผลิตภัณฑ์นี้มีประสิทธิภาพในการกันน้ำและการดูดซับเสียงและลดเสียงรบกวนที่ยอดเยี่ยม' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Vietnamese translations for XOO11
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'vi' as language_code,
    'XOO11 Vật liệu cách âm tổng hợp cho sàn' as name,
    'XOO11 vật liệu cách âm tổng hợp cho sàn phù hợp để áp dụng trong lớp giữa sàn, kết hợp lớp phủ cách âm polymer nhớt đàn hồi và một lớp sợi polyester, mang lại cho sản phẩm này hiệu suất chống thấm nước và hấp thụ âm thanh và giảm tiếng ồn tuyệt vời.' as description
FROM products 
WHERE name LIKE '%XOO11%' OR name LIKE '%樓板複合隔音材%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert English translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'en' as language_code,
    'HY-330 Tactile Texture Paint (Small Rock Surface)' as name,
    'HY-330 tactile texture paint (small rock surface) is formulated with special high-molecular-weight resin, which can be applied with various sizes of quartz sand to create a perfect imitation stone texture.' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Simplified Chinese translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'zh-Hans' as language_code,
    'HY-330 手感纹理涂料(小岩面)' as name,
    'HY-330手感纹理涂料(小岩面)以特殊高分子树脂调配而成，可搭配各种尺寸的石英砂施作并塑造完美仿石面纹理质感。' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Japanese translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ja' as language_code,
    'HY-330 触感テクスチャペイント(小岩面)' as name,
    'HY-330触感テクスチャペイント(小岩面)は特殊な高分子量樹脂で調合され、様々なサイズの石英砂と組み合わせて完璧な石の質感を再現できます。' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Korean translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ko' as language_code,
    'HY-330 촉감 텍스처 페인트(작은 바위 표면)' as name,
    'HY-330 촉감 텍스처 페인트(작은 바위 표면)는 특별한 고분자량 수지로 제조되어 다양한 크기의 석영 모래와 함께 적용하여 완벽한 돌 질감을 만들 수 있습니다.' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Thai translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'th' as language_code,
    'HY-330 สีทาเนื้อสัมผัส(พื้นผิวหินเล็ก)' as name,
    'HY-330 สีทาเนื้อสัมผัส(พื้นผิวหินเล็ก)ถูกสร้างขึ้นด้วยเรซินน้ำหนักโมเลกุลสูงพิเศษ ซึ่งสามารถใช้กับทรายควอทซ์ขนาดต่างๆ เพื่อสร้างพื้นผิวหินที่สมบูรณ์แบบ' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Vietnamese translations for HY-330
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'vi' as language_code,
    'HY-330 Sơn kết cấu xúc giác(Đá nhỏ)' as name,
    'HY-330 sơn kết cấu xúc giác(đá nhỏ) được tạo ra với nhựa trọng lượng phân tử cao đặc biệt, có thể áp dụng với cát thạch anh các kích thước khác nhau để tạo ra kết cấu đá hoàn hảo.' as description
FROM products 
WHERE name LIKE '%HY-330%' OR name LIKE '%手感紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert English translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'en' as language_code,
    'HY-330AS Textured Paint (Imitation Stone Surface)' as name,
    'HY-330AS textured paint (imitation stone surface) is refined with unique copolymerization technology''s silicone acrylic resin, combined with weather-resistant pigments and fillers.' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Simplified Chinese translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'zh-Hans' as language_code,
    'HY-330AS 纹理涂料(仿岗石面)' as name,
    'HY-330AS纹理涂料(仿岗石面)使用独特共聚技术的硅丙烯酸树脂，搭配耐候颜料及填料精制而成。' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Japanese translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ja' as language_code,
    'HY-330AS テクスチャペイント(模擬石表面)' as name,
    'HY-330ASテクスチャペイント(模擬石表面)はユニークな共重合技術のシリコーンアクリル樹脂で精製され、耐候性顔料と充填剤を組み合わせています。' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Korean translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'ko' as language_code,
    'HY-330AS 텍스처 페인트(모방 돌 표면)' as name,
    'HY-330AS 텍스처 페인트(모방 돌 표면)는 독특한 공중합 기술의 실리콘 아크릴 수지로 정제되어 내후성 안료와 충전제와 결합됩니다.' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Thai translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'th' as language_code,
    'HY-330AS สีทาเนื้อสัมผัส(พื้นผิวหินเทียม)' as name,
    'HY-330AS สีทาเนื้อสัมผัส(พื้นผิวหินเทียม)ถูกกลั่นด้วยเรซินซิลิโคนอะคริลิกเทคโนโลยีการโคพอลิเมอไรเซชันที่เป็นเอกลักษณ์ ร่วมกับเม็ดสีและตัวเติมที่ทนต่อสภาพอากาศ' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- Insert Vietnamese translations for HY-330AS
INSERT INTO product_translations (product_id, language_code, name, description)
SELECT 
    id,
    'vi' as language_code,
    'HY-330AS Sơn kết cấu(Bề mặt đá giả)' as name,
    'HY-330AS sơn kết cấu(bề mặt đá giả) được tinh chế bằng nhựa acrylic silicone công nghệ đồng trùng hợp độc đáo, kết hợp với bột màu và chất độn chống thời tiết.' as description
FROM products 
WHERE name LIKE '%HY-330AS%' OR name LIKE '%紋理塗料%'
ON CONFLICT (product_id, language_code) DO NOTHING;

-- =====================================================
-- 5. CREATE FUNCTION TO GET TRANSLATED PRODUCTS
-- =====================================================

-- Create a function to get products with translations
CREATE OR REPLACE FUNCTION get_products_with_translations(target_language VARCHAR(10) DEFAULT 'en')
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    image_url TEXT,
    price NUMERIC,
    in_stock BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(pt.name, p.name) as name,
        COALESCE(pt.description, p.description) as description,
        p.category,
        p.image_url,
        p.price,
        p.in_stock,
        p.created_at,
        p.updated_at
    FROM products p
    LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.language_code = target_language
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VERIFY THE SETUP
-- =====================================================

-- Check how many translations we have for each language
SELECT 
    language_code,
    COUNT(*) as translation_count
FROM product_translations 
GROUP BY language_code 
ORDER BY language_code;

-- Check how many translations we have for each product
SELECT 
    p.name as product_name,
    COUNT(pt.language_code) as language_count,
    STRING_AGG(pt.language_code, ', ' ORDER BY pt.language_code) as languages
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
GROUP BY p.id, p.name
ORDER BY p.name;

-- Test the translation function
SELECT * FROM get_products_with_translations('en') LIMIT 3;
SELECT * FROM get_products_with_translations('zh-Hant') LIMIT 3;
SELECT * FROM get_products_with_translations('vi') LIMIT 3;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Multilingual product system setup complete! Products now support translations in all languages.' as status;
