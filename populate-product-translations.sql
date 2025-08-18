-- Populate product translations for existing product
-- This will ensure the product editor shows proper content in each language

-- First, let's see what we currently have
SELECT * FROM product_translations WHERE product_id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';

-- Clear existing translations for this product to avoid duplicates
DELETE FROM product_translations WHERE product_id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';

-- Insert proper translations for all 7 languages
INSERT INTO product_translations (product_id, language_code, name, description) VALUES
-- Traditional Chinese
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'zh-Hant', 'X0011 樓板複合隔音材', '先進的防水膜，適用於關鍵應用。具有優異的防水性能和耐久性，適合各種建築工程使用。'),
-- English
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'en', 'X0011 High-Performance Waterproofing Membrane', 'Advanced waterproofing membrane for critical applications. Features excellent waterproofing performance and durability, suitable for various construction projects.'),
-- Simplified Chinese
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'zh-Hans', 'X0011 楼板复合隔音材', '先进的防水膜，适用于关键应用。具有优异的防水性能和耐久性，适合各种建筑工程使用。'),
-- Japanese
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'ja', 'X0011 床板複合遮音材', '重要な用途に適した高度な防水膜。優れた防水性能と耐久性を備え、様々な建設プロジェクトに適しています。'),
-- Korean
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'ko', 'X0011 바닥 복합 방음재', '중요한 용도에 적합한 고급 방수 막재. 우수한 방수 성능과 내구성을 갖추고 있으며, 다양한 건설 프로젝트에 적합합니다.'),
-- Thai
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'th', 'X0011 วัสดุกันเสียงแบบผสมสำหรับพื้น', 'เมมเบรนกันน้ำขั้นสูงสำหรับการใช้งานที่สำคัญ มีประสิทธิภาพการกันน้ำที่ยอดเยี่ยมและความทนทาน เหมาะสำหรับโครงการก่อสร้างต่างๆ'),
-- Vietnamese
('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82', 'vi', 'X0011 Vật liệu cách âm tổng hợp cho sàn', 'Màng chống thấm nước tiên tiến cho các ứng dụng quan trọng. Có hiệu suất chống thấm nước tuyệt vời và độ bền, phù hợp cho các dự án xây dựng khác nhau.');

-- Verify the insertions
SELECT 
    language_code,
    name,
    LEFT(description, 50) || '...' as description_preview
FROM product_translations 
WHERE product_id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'
ORDER BY language_code;

-- Count total translations for this product
SELECT COUNT(*) as total_translations 
FROM product_translations 
WHERE product_id = 'e0516503-cacc-4a2a-a9a8-49bcaa3a8e82';
