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
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
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
             id: 'environment',
             name: 'Environmental',
             features: [
               { id: 'fireproof', feature_key: 'fireproof', category: 'environment', display_order: 1, is_active: true, translations: { en: 'Fireproof', 'zh-Hant': '防火', 'zh-Hans': '防火', ja: '耐火', ko: '내화', th: 'ทนไฟ', vi: 'Chống cháy' } },
               { id: 'waterproof', feature_key: 'waterproof', category: 'environment', display_order: 2, is_active: true, translations: { en: 'Waterproof', 'zh-Hant': '防水', 'zh-Hans': '防水', ja: '防水', ko: '방수', th: 'กันน้ำ', vi: 'Chống nước' } },
               { id: 'heat-resistant', feature_key: 'heat-resistant', category: 'environment', display_order: 3, is_active: true, translations: { en: 'Heat Resistant', 'zh-Hant': '耐熱', 'zh-Hans': '耐热', ja: '耐熱', ko: '내열', th: 'ทนความร้อน', vi: 'Chịu nhiệt' } },
               { id: 'cold-resistant', feature_key: 'cold-resistant', category: 'environment', display_order: 4, is_active: true, translations: { en: 'Cold Resistant', 'zh-Hant': '耐寒', 'zh-Hans': '耐寒', ja: '耐寒', ko: '내한', th: 'ทนความเย็น', vi: 'Chịu lạnh' } },
               { id: 'uv-resistant', feature_key: 'uv-resistant', category: 'environment', display_order: 5, is_active: true, translations: { en: 'UV Resistant', 'zh-Hant': '抗紫外線', 'zh-Hans': '抗紫外线', ja: 'UV耐性', ko: '자외선 차단', th: 'ทนรังสี UV', vi: 'Chống tia UV' } }
             ]
           },
           {
             id: 'performance',
             name: 'Performance',
             features: [
               { id: 'high-strength', feature_key: 'high-strength', category: 'performance', display_order: 6, is_active: true, translations: { en: 'High Strength', 'zh-Hant': '高強度', 'zh-Hans': '高强度', ja: '高強度', ko: '고강도', th: 'ความแข็งแรงสูง', vi: 'Độ bền cao' } },
               { id: 'durable', feature_key: 'durable', category: 'performance', display_order: 7, is_active: true, translations: { en: 'Durable', 'zh-Hant': '耐用', 'zh-Hans': '耐用', ja: '耐久', ko: '내구성', th: 'ทนทาน', vi: 'Bền bỉ' } },
               { id: 'flexible', feature_key: 'flexible', category: 'performance', display_order: 8, is_active: true, translations: { en: 'Flexible', 'zh-Hant': '靈活', 'zh-Hans': '灵活', ja: '柔軟', ko: '유연', th: 'ยืดหยุ่น', vi: 'Linh hoạt' } },
               { id: 'fast-curing', feature_key: 'fast-curing', category: 'performance', display_order: 9, is_active: true, translations: { en: 'Fast Curing', 'zh-Hant': '快速固化', 'zh-Hans': '快速固化', ja: '速乾', ko: '빠른 경화', th: 'แห้งเร็ว', vi: 'Khô nhanh' } },
               { id: 'low-voc', feature_key: 'low-voc', category: 'performance', display_order: 10, is_active: true, translations: { en: 'Low VOC', 'zh-Hant': '低揮發性', 'zh-Hans': '低挥发性', ja: '低VOC', ko: '저VOC', th: 'VOC ต่ำ', vi: 'VOC thấp' } }
             ]
           },
           {
             id: 'safety',
             name: 'Safety',
             features: [
               { id: 'non-toxic', feature_key: 'non-toxic', category: 'safety', display_order: 11, is_active: true, translations: { en: 'Non-Toxic', 'zh-Hant': '無毒', 'zh-Hans': '无毒', ja: '無毒', ko: '무독성', th: 'ไม่เป็นพิษ', vi: 'Không độc hại' } },
               { id: 'eco-friendly', feature_key: 'eco-friendly', category: 'safety', display_order: 12, is_active: true, translations: { en: 'Eco-Friendly', 'zh-Hant': '環保', 'zh-Hans': '环保', ja: '環境にやさしい', ko: '친환경', th: 'เป็นมิตรกับสิ่งแวดล้อม', vi: 'Thân thiện môi trường' } },
               { id: 'child-safe', feature_key: 'child-safe', category: 'safety', display_order: 13, is_active: true, translations: { en: 'Child Safe', 'zh-Hant': '兒童安全', 'zh-Hans': '儿童安全', ja: '子供に安全', ko: '어린이 안전', th: 'ปลอดภัยสำหรับเด็ก', vi: 'An toàn cho trẻ em' } }
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

  const toggleFeature = (featureId: string) => {
    // Get the feature name in the current language
    const feature = featureCategories
      .flatMap(cat => cat.features)
      .find(f => f.id === featureId);
    
    if (!feature) return;
    
    const featureName = getFeatureName(feature);
    const newSelected = selectedFeatures.includes(featureName)
      ? selectedFeatures.filter(name => name !== featureName)
      : [...selectedFeatures, featureName];
    onFeaturesChange(newSelected);
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

  const getCategoryName = (categoryId: string) => {
    const category = featureCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const removeFeature = (featureName: string) => {
    const newSelected = selectedFeatures.filter(name => name !== featureName);
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
       {selectedFeatures.length > 0 && (
         <div className="space-y-2">
           <label className="text-sm font-medium text-gray-700">
             {t('admin.products.selectedFeatures')} ({selectedFeatures.length})
           </label>
           <div className="flex flex-wrap gap-2">
             {selectedFeatures.map(featureName => (
               <Badge
                 key={featureName}
                 variant="secondary"
                 className="flex items-center gap-1 px-2 py-1"
               >
                 {featureName}
                 <button
                   type="button"
                   onClick={() => removeFeature(featureName)}
                   className="ml-1 hover:text-red-500"
                 >
                   <X className="h-3 w-3" />
                 </button>
               </Badge>
             ))}
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
              <div className="p-4 space-y-2">
                {category.features.map(feature => (
                                     <label
                     key={feature.id}
                     className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                   >
                                         <input
                       type="checkbox"
                       checked={selectedFeatures.includes(getFeatureName(feature))}
                       onChange={() => toggleFeature(feature.id)}
                       className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                     />
                    <span className="text-sm text-gray-700">
                      {getFeatureName(feature)}
                    </span>
                  </label>
                ))}
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
             const allNames = featureCategories.flatMap(cat => cat.features).map(f => getFeatureName(f));
             onFeaturesChange(allNames);
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
