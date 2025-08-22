-- Add missing feature translations for all supported languages
-- This will ensure features translate properly in ALL languages

-- First, let's add Simplified Chinese (zh-Hans) translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT mf.id, 'zh-Hans', 
  CASE mf.feature_key
    WHEN 'uv_resistance' THEN '抗紫外线'
    WHEN 'corrosion_protection' THEN '防腐保护'
    WHEN 'weather_resistance' THEN '耐候性'
    WHEN 'chemical_resistance' THEN '化学抗性'
    WHEN 'high_temperature_resistance' THEN '高温抗性'
    WHEN 'water_resistance' THEN '防水性'
    WHEN 'flexible_bonding' THEN '弹性粘合'
    WHEN 'gap_filling' THEN '填缝'
    WHEN 'fast_curing' THEN '快速固化'
    WHEN 'long_lasting' THEN '持久耐用'
    WHEN 'durable_surface' THEN '耐用表面'
    WHEN 'easy_maintenance' THEN '易于维护'
    WHEN 'slip_resistant' THEN '防滑'
    WHEN 'stain_resistant' THEN '防污'
    WHEN 'mold_resistant' THEN '防霉'
    WHEN 'color_consistent' THEN '颜色一致'
    WHEN 'high_strength' THEN '高强度'
    WHEN 'structural_grade' THEN '结构级'
    WHEN 'shrinkage_resistant' THEN '抗收缩'
    WHEN 'quick_setting' THEN '快速凝固'
    WHEN 'easy_mixing' THEN '易于混合'
    WHEN 'flexible_membrane' THEN '弹性膜'
    WHEN 'thermal_insulation' THEN '隔热'
    WHEN 'sound_dampening' THEN '隔音'
    WHEN 'enhanced_bonding' THEN '增强粘合'
    WHEN 'quick_drying' THEN '快速干燥'
    WHEN 'low_voc' THEN '低挥发性'
    WHEN 'dual_purpose' THEN '双重用途'
    WHEN 'versatile_application' THEN '多功能应用'
    WHEN 'professional_grade' THEN '专业级'
    WHEN 'uv_resistant' THEN '抗紫外线'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM feature_translations ft 
  WHERE ft.feature_id = mf.id AND ft.language_code = 'zh-Hans'
);

-- Add Japanese (ja) translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT mf.id, 'ja', 
  CASE mf.feature_key
    WHEN 'uv_resistance' THEN '紫外線抵抗'
    WHEN 'corrosion_protection' THEN '腐食防止'
    WHEN 'weather_resistance' THEN '耐候性'
    WHEN 'chemical_resistance' THEN '化学抵抗'
    WHEN 'high_temperature_resistance' THEN '高温抵抗'
    WHEN 'water_resistance' THEN '防水性'
    WHEN 'flexible_bonding' THEN '柔軟な接着'
    WHEN 'gap_filling' THEN '隙間充填'
    WHEN 'fast_curing' THEN '急速硬化'
    WHEN 'long_lasting' THEN '長持ち'
    WHEN 'durable_surface' THEN '耐久表面'
    WHEN 'easy_maintenance' THEN 'メンテナンス容易'
    WHEN 'slip_resistant' THEN '滑り止め'
    WHEN 'stain_resistant' THEN '汚れ防止'
    WHEN 'mold_resistant' THEN 'カビ防止'
    WHEN 'color_consistent' THEN '色一貫性'
    WHEN 'high_strength' THEN '高強度'
    WHEN 'structural_grade' THEN '構造級'
    WHEN 'shrinkage_resistant' THEN '収縮防止'
    WHEN 'quick_setting' THEN '急速凝固'
    WHEN 'easy_mixing' THEN '混合容易'
    WHEN 'flexible_membrane' THEN '柔軟膜'
    WHEN 'thermal_insulation' THEN '断熱'
    WHEN 'sound_dampening' THEN '防音'
    WHEN 'enhanced_bonding' THEN '強化接着'
    WHEN 'quick_drying' THEN '急速乾燥'
    WHEN 'low_voc' THEN '低VOC'
    WHEN 'dual_purpose' THEN '二重用途'
    WHEN 'versatile_application' THEN '多用途応用'
    WHEN 'professional_grade' THEN 'プロ級'
    WHEN 'uv_resistant' THEN '紫外線抵抗'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM feature_translations ft 
  WHERE ft.feature_id = mf.id AND ft.language_code = 'ja'
);

-- Add Korean (ko) translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT mf.id, 'ko', 
  CASE mf.feature_key
    WHEN 'uv_resistance' THEN '자외선 저항'
    WHEN 'corrosion_protection' THEN '부식 방지'
    WHEN 'weather_resistance' THEN '내후성'
    WHEN 'chemical_resistance' THEN '화학 저항'
    WHEN 'high_temperature_resistance' THEN '고온 저항'
    WHEN 'water_resistance' THEN '방수성'
    WHEN 'flexible_bonding' THEN '유연한 접착'
    WHEN 'gap_filling' THEN '틈새 채움'
    WHEN 'fast_curing' THEN '급속 경화'
    WHEN 'long_lasting' THEN '오래 지속'
    WHEN 'durable_surface' THEN '내구성 표면'
    WHEN 'easy_maintenance' THEN '유지보수 용이'
    WHEN 'slip_resistant' THEN '미끄럼 방지'
    WHEN 'stain_resistant' THEN '얼룩 방지'
    WHEN 'mold_resistant' THEN '곰팡이 방지'
    WHEN 'color_consistent' THEN '색상 일관성'
    WHEN 'high_strength' THEN '고강도'
    WHEN 'structural_grade' THEN '구조급'
    WHEN 'shrinkage_resistant' THEN '수축 방지'
    WHEN 'quick_setting' THEN '급속 응고'
    WHEN 'easy_mixing' THEN '혼합 용이'
    WHEN 'flexible_membrane' THEN '유연한 막'
    WHEN 'thermal_insulation' THEN '단열'
    WHEN 'sound_dampening' THEN '방음'
    WHEN 'enhanced_bonding' THEN '강화 접착'
    WHEN 'quick_drying' THEN '급속 건조'
    WHEN 'low_voc' THEN '저VOC'
    WHEN 'dual_purpose' THEN '이중 용도'
    WHEN 'versatile_application' THEN '다용도 응용'
    WHEN 'professional_grade' THEN '전문가급'
    WHEN 'uv_resistant' THEN '자외선 저항'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM feature_translations ft 
  WHERE ft.feature_id = mf.id AND ft.language_code = 'ko'
);

-- Add Thai (th) translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT mf.id, 'th', 
  CASE mf.feature_key
    WHEN 'uv_resistance' THEN 'ต้านรังสีอัลตราไวโอเลต'
    WHEN 'corrosion_protection' THEN 'ป้องกันการกัดกร่อน'
    WHEN 'weather_resistance' THEN 'ทนต่อสภาพอากาศ'
    WHEN 'chemical_resistance' THEN 'ต้านสารเคมี'
    WHEN 'high_temperature_resistance' THEN 'ทนอุณหภูมิสูง'
    WHEN 'water_resistance' THEN 'กันน้ำ'
    WHEN 'flexible_bonding' THEN 'การยึดติดแบบยืดหยุ่น'
    WHEN 'gap_filling' THEN 'การเติมช่องว่าง'
    WHEN 'fast_curing' THEN 'การแข็งตัวเร็ว'
    WHEN 'long_lasting' THEN 'ทนทานยาวนาน'
    WHEN 'durable_surface' THEN 'พื้นผิวทนทาน'
    WHEN 'easy_maintenance' THEN 'บำรุงรักษาง่าย'
    WHEN 'slip_resistant' THEN 'กันลื่น'
    WHEN 'stain_resistant' THEN 'กันคราบ'
    WHEN 'mold_resistant' THEN 'กันเชื้อรา'
    WHEN 'color_consistent' THEN 'สีสม่ำเสมอ'
    WHEN 'high_strength' THEN 'ความแข็งแรงสูง'
    WHEN 'structural_grade' THEN 'เกรดโครงสร้าง'
    WHEN 'shrinkage_resistant' THEN 'ต้านการหดตัว'
    WHEN 'quick_setting' THEN 'การตั้งตัวเร็ว'
    WHEN 'easy_mixing' THEN 'ผสมง่าย'
    WHEN 'flexible_membrane' THEN 'เมมเบรนยืดหยุ่น'
    WHEN 'thermal_insulation' THEN 'ฉนวนความร้อน'
    WHEN 'sound_dampening' THEN 'ลดเสียง'
    WHEN 'enhanced_bonding' THEN 'การยึดติดที่เพิ่มขึ้น'
    WHEN 'quick_drying' THEN 'แห้งเร็ว'
    WHEN 'low_voc' THEN 'VOC ต่ำ'
    WHEN 'dual_purpose' THEN 'ใช้ได้สองอย่าง'
    WHEN 'versatile_application' THEN 'การใช้งานหลากหลาย'
    WHEN 'professional_grade' THEN 'เกรดมืออาชีพ'
    WHEN 'uv_resistant' THEN 'ต้านรังสีอัลตราไวโอเลต'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM feature_translations ft 
  WHERE ft.feature_id = mf.id AND ft.language_code = 'th'
);

-- Add Vietnamese (vi) translations
INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT mf.id, 'vi', 
  CASE mf.feature_key
    WHEN 'uv_resistance' THEN 'Chống tia cực tím'
    WHEN 'corrosion_protection' THEN 'Bảo vệ chống ăn mòn'
    WHEN 'weather_resistance' THEN 'Chống chịu thời tiết'
    WHEN 'chemical_resistance' THEN 'Chống chịu hóa chất'
    WHEN 'high_temperature_resistance' THEN 'Chống chịu nhiệt độ cao'
    WHEN 'water_resistance' THEN 'Chống thấm nước'
    WHEN 'flexible_bonding' THEN 'Liên kết linh hoạt'
    WHEN 'gap_filling' THEN 'Lấp đầy khe hở'
    WHEN 'fast_curing' THEN 'Đông cứng nhanh'
    WHEN 'long_lasting' THEN 'Bền lâu'
    WHEN 'durable_surface' THEN 'Bề mặt bền'
    WHEN 'easy_maintenance' THEN 'Bảo trì dễ dàng'
    WHEN 'slip_resistant' THEN 'Chống trượt'
    WHEN 'stain_resistant' THEN 'Chống vết bẩn'
    WHEN 'mold_resistant' THEN 'Chống nấm mốc'
    WHEN 'color_consistent' THEN 'Màu sắc nhất quán'
    WHEN 'high_strength' THEN 'Độ bền cao'
    WHEN 'structural_grade' THEN 'Cấp độ cấu trúc'
    WHEN 'shrinkage_resistant' THEN 'Chống co ngót'
    WHEN 'quick_setting' THEN 'Đông kết nhanh'
    WHEN 'easy_mixing' THEN 'Trộn dễ dàng'
    WHEN 'flexible_membrane' THEN 'Màng linh hoạt'
    WHEN 'thermal_insulation' THEN 'Cách nhiệt'
    WHEN 'sound_dampening' THEN 'Giảm âm'
    WHEN 'enhanced_bonding' THEN 'Liên kết tăng cường'
    WHEN 'quick_drying' THEN 'Khô nhanh'
    WHEN 'low_voc' THEN 'VOC thấp'
    WHEN 'dual_purpose' THEN 'Hai mục đích'
    WHEN 'versatile_application' THEN 'Ứng dụng đa năng'
    WHEN 'professional_grade' THEN 'Cấp độ chuyên nghiệp'
    WHEN 'uv_resistant' THEN 'Chống tia cực tím'
    ELSE mf.feature_key
  END
FROM master_features mf
WHERE mf.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM feature_translations ft 
  WHERE ft.feature_id = mf.id AND ft.language_code = 'vi'
);

-- Verify the results
SELECT 
  ft.language_code,
  COUNT(*) as translation_count
FROM feature_translations ft
GROUP BY ft.language_code
ORDER BY ft.language_code;
