import React, { useState, useMemo, useEffect } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import FeaturesService, { FeatureWithTranslations, FeatureCategory } from '@/services/featuresService';

export interface Feature {
  id: string;
  name: string;
  category: string;
  translations: Record<string, string>;
}

interface FeaturesChecklistProps {
  features: Feature[]; // This prop is kept for backward compatibility but not used
  selectedFeatures: string[]; // This should now be feature keys, not names
  onFeaturesChange: (featureKeys: string[]) => void; // Now returns feature keys
  language: string;
  placeholder?: string;
  className?: string;
}

export const FeaturesChecklist: React.FC<FeaturesChecklistProps> = ({
  features, // Not used anymore - features come from database
  selectedFeatures,
  onFeaturesChange,
  language,
  placeholder = "Search features...",
  className = ""
}) => {
  const { t } = useTranslation();
  

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['environment']);
  const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch features from database on component mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categories = await FeaturesService.getFeaturesByCategory();
        setFeatureCategories(categories);
        

        
        // Auto-expand first category if available
        if (categories.length > 0) {
          setExpandedCategories([categories[0].id]);
        }
      } catch (err) {
        console.error('Error fetching features:', err);
                 // Fallback to default features if database is not ready
         const fallbackCategories = [
           {
             id: 'environmental-resistance',
             name: 'Environmental Resistance',
             features: [
               { id: 'abrasion-resistant', feature_key: 'abrasion-resistant', category: 'environmental-resistance', display_order: 1, is_active: true, translations: { en: 'Abrasion Resistant', 'zh-Hant': '耐磨', 'zh-Hans': '耐磨', ja: '耐摩耗', ko: '내마모성', th: 'ทนการขัดสี', vi: 'Chống mài mòn' } },
               { id: 'chemical-exposure', feature_key: 'chemical-exposure', category: 'environmental-resistance', display_order: 2, is_active: true, translations: { en: 'Chemical Exposure', 'zh-Hant': '化學暴露', 'zh-Hans': '化学暴露', ja: '化学暴露', ko: '화학 노출', th: 'ทนสารเคมี', vi: 'Chống hóa chất' } },
               { id: 'dry-conditions', feature_key: 'dry-conditions', category: 'environmental-resistance', display_order: 3, is_active: true, translations: { en: 'Dry Conditions', 'zh-Hant': '乾燥條件', 'zh-Hans': '干燥条件', ja: '乾燥条件', ko: '건조 조건', th: 'สภาพแห้ง', vi: 'Điều kiện khô' } },
               { id: 'high-traffic-areas', feature_key: 'high-traffic-areas', category: 'environmental-resistance', display_order: 4, is_active: true, translations: { en: 'High Traffic Areas', 'zh-Hant': '高流量區域', 'zh-Hans': '高流量区域', ja: '高交通量エリア', ko: '고교통량 지역', th: 'พื้นที่ที่มีการใช้งานสูง', vi: 'Khu vực sử dụng cao' } },
               { id: 'uv-resistant', feature_key: 'uv-resistant', category: 'environmental-resistance', display_order: 5, is_active: true, translations: { en: 'UV Resistant', 'zh-Hant': '抗紫外線', 'zh-Hans': '抗紫外线', ja: 'UV耐性', ko: '자외선 저항', th: 'ทนรังสี UV', vi: 'Chống tia UV' } },
               { id: 'fireproof', feature_key: 'fireproof', category: 'environmental-resistance', display_order: 6, is_active: true, translations: { en: 'Fireproof', 'zh-Hant': '防火', 'zh-Hans': '防火', ja: '耐火', ko: '내화', th: 'ทนไฟ', vi: 'Chống cháy' } },
               { id: 'waterproof', feature_key: 'waterproof', category: 'environmental-resistance', display_order: 7, is_active: true, translations: { en: 'Waterproof', 'zh-Hant': '防水', 'zh-Hans': '防水', ja: '防水', ko: '방수', th: 'กันน้ำ', vi: 'Chống nước' } },
               { id: 'heat-resistant', feature_key: 'heat-resistant', category: 'environmental-resistance', display_order: 8, is_active: true, translations: { en: 'Heat Resistant', 'zh-Hant': '耐熱', 'zh-Hans': '耐热', ja: '耐熱', ko: '내열', th: 'ทนความร้อน', vi: 'Chịu nhiệt' } },
               { id: 'cold-resistant', feature_key: 'cold-resistant', category: 'environmental-resistance', display_order: 9, is_active: true, translations: { en: 'Cold Resistant', 'zh-Hant': '耐寒', 'zh-Hans': '耐寒', ja: '耐寒', ko: '내한', th: 'ทนความเย็น', vi: 'Chịu lạnh' } }
             ]
           },
           {
             id: 'performance-properties',
             name: 'Performance Properties',
             features: [
               { id: 'chemical-resistant', feature_key: 'chemical-resistant', category: 'performance-properties', display_order: 1, is_active: true, translations: { en: 'Chemical Resistant', 'zh-Hant': '耐化學', 'zh-Hans': '耐化学', ja: '耐薬品', ko: '내화학', th: 'ทนสารเคมี', vi: 'Chống hóa chất' } },
               { id: 'fast-cure', feature_key: 'fast-cure', category: 'performance-properties', display_order: 2, is_active: true, translations: { en: 'Fast Cure', 'zh-Hant': '快速固化', 'zh-Hans': '快速固化', ja: '速乾', ko: '빠른 경화', th: 'แห้งเร็ว', vi: 'Khô nhanh' } },
               { id: 'flexible', feature_key: 'flexible', category: 'performance-properties', display_order: 3, is_active: true, translations: { en: 'Flexible', 'zh-Hant': '靈活', 'zh-Hans': '灵活', ja: '柔軟', ko: '유연', th: 'ยืดหยุ่น', vi: 'Linh hoạt' } },
               { id: 'high-strength', feature_key: 'high-strength', category: 'performance-properties', display_order: 4, is_active: true, translations: { en: 'High Strength', 'zh-Hant': '高強度', 'zh-Hans': '高强度', ja: '高強度', ko: '고강도', th: 'ความแข็งแรงสูง', vi: 'Độ bền cao' } },
               { id: 'impact-resistant', feature_key: 'impact-resistant', category: 'performance-properties', display_order: 5, is_active: true, translations: { en: 'Impact Resistant', 'zh-Hant': '抗衝擊', 'zh-Hans': '抗冲击', ja: '衝撃耐性', ko: '충격 저항', th: 'ทนการกระแทก', vi: 'Chống va đập' } },
               { id: 'long-lasting', feature_key: 'long-lasting', category: 'performance-properties', display_order: 6, is_active: true, translations: { en: 'Long Lasting', 'zh-Hant': '持久', 'zh-Hans': '持久', ja: '長持ち', ko: '오래 지속', th: 'ทนทานยาวนาน', vi: 'Bền lâu' } },
               { id: 'low-odor', feature_key: 'low-odor', category: 'performance-properties', display_order: 7, is_active: true, translations: { en: 'Low Odor', 'zh-Hant': '低氣味', 'zh-Hans': '低气味', ja: '低臭', ko: '낮은 냄새', th: 'กลิ่นน้อย', vi: 'Ít mùi' } },
               { id: 'temperature-resistant', feature_key: 'temperature-resistant', category: 'performance-properties', display_order: 8, is_active: true, translations: { en: 'Temperature Resistant', 'zh-Hant': '耐溫', 'zh-Hans': '耐温', ja: '温度耐性', ko: '온도 저항', th: 'ทนอุณหภูมิ', vi: 'Chịu nhiệt độ' } },
               { id: 'weather-resistant', feature_key: 'weather-resistant', category: 'performance-properties', display_order: 9, is_active: true, translations: { en: 'Weather Resistant', 'zh-Hant': '耐候', 'zh-Hans': '耐候', ja: '耐候性', ko: '내후성', th: 'ทนสภาพอากาศ', vi: 'Chịu thời tiết' } }
             ]
           },
           {
             id: 'material-composition',
             name: 'Material Composition',
             features: [
               { id: 'acrylic', feature_key: 'acrylic', category: 'material-composition', display_order: 1, is_active: true, translations: { en: 'Acrylic', 'zh-Hant': '丙烯酸', 'zh-Hans': '丙烯酸', ja: 'アクリル', ko: '아크릴', th: 'อะคริลิก', vi: 'Acrylic' } },
               { id: 'bitumen-based', feature_key: 'bitumen-based', category: 'material-composition', display_order: 2, is_active: true, translations: { en: 'Bitumen Based', 'zh-Hant': '瀝青基', 'zh-Hans': '沥青基', ja: 'ビチューメンベース', ko: '비투멘 기반', th: 'บิทูเมน', vi: 'Bitumen' } },
               { id: 'cement-based', feature_key: 'cement-based', category: 'material-composition', display_order: 3, is_active: true, translations: { en: 'Cement Based', 'zh-Hant': '水泥基', 'zh-Hans': '水泥基', ja: 'セメントベース', ko: '시멘트 기반', th: 'ปูนซีเมนต์', vi: 'Xi măng' } },
               { id: 'epoxy', feature_key: 'epoxy', category: 'material-composition', display_order: 4, is_active: true, translations: { en: 'Epoxy', 'zh-Hant': '環氧樹脂', 'zh-Hans': '环氧树脂', ja: 'エポキシ', ko: '에폭시', th: 'อีพ็อกซี่', vi: 'Epoxy' } },
               { id: 'fiber-reinforced', feature_key: 'fiber-reinforced', category: 'material-composition', display_order: 5, is_active: true, translations: { en: 'Fiber Reinforced', 'zh-Hant': '纖維增強', 'zh-Hans': '纤维增强', ja: '繊維強化', ko: '섬유 강화', th: 'เสริมใย', vi: 'Gia cố sợi' } },
               { id: 'hybrid', feature_key: 'hybrid', category: 'material-composition', display_order: 6, is_active: true, translations: { en: 'Hybrid', 'zh-Hant': '混合', 'zh-Hans': '混合', ja: 'ハイブリッド', ko: '하이브리드', th: 'ไฮบริด', vi: 'Lai' } },
               { id: 'polyurethane', feature_key: 'polyurethane', category: 'material-composition', display_order: 7, is_active: true, translations: { en: 'Polyurethane', 'zh-Hant': '聚氨酯', 'zh-Hans': '聚氨酯', ja: 'ポリウレタン', ko: '폴리우레탄', th: 'โพลียูรีเทน', vi: 'Polyurethane' } },
               { id: 'rubber-based', feature_key: 'rubber-based', category: 'material-composition', display_order: 8, is_active: true, translations: { en: 'Rubber Based', 'zh-Hant': '橡膠基', 'zh-Hans': '橡胶基', ja: 'ゴムベース', ko: '고무 기반', th: 'ยาง', vi: 'Cao su' } },
               { id: 'silicone', feature_key: 'silicone', category: 'material-composition', display_order: 9, is_active: true, translations: { en: 'Silicone', 'zh-Hant': '矽膠', 'zh-Hans': '硅胶', ja: 'シリコーン', ko: '실리콘', th: 'ซิลิโคน', vi: 'Silicone' } }
             ]
           },
           {
             id: 'special-qualities',
             name: 'Special Qualities',
             features: [
               { id: 'anti-microbial', feature_key: 'anti-microbial', category: 'special-qualities', display_order: 1, is_active: true, translations: { en: 'Anti Microbial', 'zh-Hant': '抗菌', 'zh-Hans': '抗菌', ja: '抗菌', ko: '항균', th: 'ต้านเชื้อ', vi: 'Kháng khuẩn' } },
               { id: 'biodegradable', feature_key: 'biodegradable', category: 'special-qualities', display_order: 2, is_active: true, translations: { en: 'Biodegradable', 'zh-Hant': '生物降解', 'zh-Hans': '生物降解', ja: '生分解性', ko: '생분해성', th: 'ย่อยสลายได้', vi: 'Phân hủy sinh học' } },
               { id: 'eco-friendly', feature_key: 'eco-friendly', category: 'special-qualities', display_order: 3, is_active: true, translations: { en: 'Eco Friendly', 'zh-Hant': '環保', 'zh-Hans': '环保', ja: 'エコフレンドリー', ko: '친환경', th: 'เป็นมิตรกับสิ่งแวดล้อม', vi: 'Thân thiện môi trường' } },
               { id: 'fire-resistant', feature_key: 'fire-resistant', category: 'special-qualities', display_order: 4, is_active: true, translations: { en: 'Fire Resistant', 'zh-Hant': '防火', 'zh-Hans': '防火', ja: '耐火', ko: '내화', th: 'ทนไฟ', vi: 'Chống cháy' } },
               { id: 'low-voc', feature_key: 'low-voc', category: 'special-qualities', display_order: 5, is_active: true, translations: { en: 'Low VOC', 'zh-Hant': '低VOC', 'zh-Hans': '低VOC', ja: '低VOC', ko: '저VOC', th: 'VOC ต่ำ', vi: 'VOC thấp' } },
               { id: 'non-toxic', feature_key: 'non-toxic', category: 'special-qualities', display_order: 6, is_active: true, translations: { en: 'Non Toxic', 'zh-Hant': '無毒', 'zh-Hans': '无毒', ja: '無毒', ko: '무독성', th: 'ไม่เป็นพิษ', vi: 'Không độc hại' } },
               { id: 'paintable', feature_key: 'paintable', category: 'special-qualities', display_order: 7, is_active: true, translations: { en: 'Paintable', 'zh-Hant': '可塗漆', 'zh-Hans': '可涂漆', ja: '塗装可能', ko: '도장 가능', th: 'ทาสีได้', vi: 'Có thể sơn' } },
               { id: 'quick-setting', feature_key: 'quick-setting', category: 'special-qualities', display_order: 8, is_active: true, translations: { en: 'Quick Setting', 'zh-Hant': '快乾', 'zh-Hans': '快干', ja: '速乾', ko: '빠른 건조', th: 'แห้งเร็ว', vi: 'Khô nhanh' } },
               { id: 'recyclable', feature_key: 'recyclable', category: 'special-qualities', display_order: 9, is_active: true, translations: { en: 'Recyclable', 'zh-Hant': '可回收', 'zh-Hans': '可回收', ja: 'リサイクル可能', ko: '재활용 가능', th: 'รีไซเคิลได้', vi: 'Có thể tái chế' } },
               { id: 'self-leveling', feature_key: 'self-leveling', category: 'special-qualities', display_order: 10, is_active: true, translations: { en: 'Self Leveling', 'zh-Hant': '自流平', 'zh-Hans': '自流平', ja: 'セルフレベリング', ko: '셀프레벨링', th: 'ปรับระดับตัวเอง', vi: 'Tự san phẳng' } }
             ]
           }
         ];
        setFeatureCategories(fallbackCategories);
        setExpandedCategories(['environment']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  // Filter features based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return featureCategories;
    
    const searchLower = searchTerm.toLowerCase();
    return featureCategories.map(category => ({
      ...category,
      features: category.features.filter(feature => {
        const nameMatch = feature.feature_key.toLowerCase().includes(searchLower);
        const translationMatch = Object.values(feature.translations).some(
          trans => trans.toLowerCase().includes(searchLower)
        );
        return nameMatch || translationMatch;
      })
    })).filter(category => category.features.length > 0);
  }, [featureCategories, searchTerm]);

  const toggleFeature = (featureKey: string) => {
    // Check if the feature is already selected (using normalized comparison)
    const isCurrentlySelected = normalizedSelectedFeatures.includes(featureKey);
    
    if (isCurrentlySelected) {
      // Remove the feature - find and remove the original identifier
      const newSelected = selectedFeatures.filter(key => {
        const normalizedKey = normalizeToFeatureKey(key);
        return normalizedKey !== featureKey;
      });
      onFeaturesChange(newSelected);
    } else {
      // Add the feature - always add the feature key
      onFeaturesChange([...selectedFeatures, featureKey]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getFeatureName = (feature: FeatureWithTranslations) => {
    return feature.translations[language] || feature.translations.en || feature.feature_key;
  };

  // Function to normalize feature identifiers to feature keys
  const normalizeToFeatureKey = (featureIdentifier: string): string => {
    // If it's already a feature key (contains hyphens), return as is
    if (featureIdentifier.includes('-')) {
      return featureIdentifier;
    }
    
    // If it's a feature name, try to find the corresponding feature key
    const allFeatures = featureCategories.flatMap(cat => cat.features);
    const matchingFeature = allFeatures.find(f => 
      f.translations.en === featureIdentifier || 
      Object.values(f.translations).includes(featureIdentifier)
    );
    
    return matchingFeature ? matchingFeature.feature_key : featureIdentifier;
  };

  // Normalize selectedFeatures to ensure they are all feature keys
  const normalizedSelectedFeatures = useMemo(() => {
    if (!Array.isArray(selectedFeatures)) return [];
    return selectedFeatures.map(normalizeToFeatureKey);
  }, [selectedFeatures, featureCategories]);

  const getCategoryName = (categoryId: string) => {
    const category = featureCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const removeFeature = (featureKey: string) => {
    // Remove from the original selectedFeatures array
    const newSelected = selectedFeatures.filter(key => {
      const normalizedKey = normalizeToFeatureKey(key);
      return normalizedKey !== featureKey;
    });
    onFeaturesChange(newSelected);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading features...</p>
        </div>
      </div>
    );
  }

  // Show fallback message if using default features
  const isUsingFallback = featureCategories.length > 0 && featureCategories[0].id === 'environment';

  // Error state
  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No features available
  if (featureCategories.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No features available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

             {/* Selected Features Display */}
       {normalizedSelectedFeatures.length > 0 && (
         <div className="space-y-2">
           <label className="text-sm font-medium text-gray-700">
             {t('admin.products.selectedFeatures')} ({normalizedSelectedFeatures.length})
           </label>
           <div className="flex flex-wrap gap-2">
             {normalizedSelectedFeatures.map(featureKey => {
               // Find the feature to get its translated name
               const feature = featureCategories
                 .flatMap(cat => cat.features)
                 .find(f => f.feature_key === featureKey);
               
               if (!feature) return null;
               
               const featureName = getFeatureName(feature);
               
               return (
                 <Badge
                   key={featureKey}
                   variant="secondary"
                   className="flex items-center gap-1 px-2 py-1"
                 >
                   {featureName}
                   <button
                     type="button"
                     onClick={() => removeFeature(featureKey)}
                     className="ml-1 hover:text-red-500"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 </Badge>
               );
             })}
           </div>
         </div>
       )}

      {/* Features Checklist */}
      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <div key={category.id} className="border rounded-lg">
                         <button
               type="button"
               onClick={() => toggleCategory(category.id)}
               className="w-full px-4 py-2 text-left font-medium bg-blue-50 hover:bg-blue-100 rounded-t-lg flex items-center justify-between border-b border-blue-200"
             >
              <span>{category.name}</span>
              <span className="text-sm text-gray-500">
                {expandedCategories.includes(category.id) ? '−' : '+'}
              </span>
            </button>
            
                        {expandedCategories.includes(category.id) && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {category.features.map(feature => (
                    <label
                      key={feature.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={normalizedSelectedFeatures.includes(feature.feature_key)}
                        onChange={() => toggleFeature(feature.feature_key)}
                        className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {getFeatureName(feature)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onFeaturesChange([])}
          className="text-xs"
        >
          {t('admin.products.clearAll')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const allIds = featureCategories.flatMap(cat => cat.features).map(f => f.feature_key);
            onFeaturesChange(allIds);
          }}
          className="text-xs"
        >
          {t('admin.products.selectAll')}
        </Button>
      </div>
    </div>
  );
};

export default FeaturesChecklist;
