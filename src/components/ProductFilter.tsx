import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';

interface ProductFilterProps {
  onFilterChange: (filters: ProductFilters) => void;
}

export interface ProductFilters {
  search: string;
  category: string[]; // Multiple category selection
  features: string[]; // Multiple features selection
}

const ProductFilter = ({ onFilterChange }: ProductFilterProps) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: [], // Empty array for no categories selected
    features: []
  });

  // State for collapsible sections - all collapsed by default
  const [expandedSections, setExpandedSections] = useState({
    applicationEnvironment: false,
    performanceProperties: false,
    baseType: false,
    specialFeatures: false
  });

  // Categories that match the admin page categories exactly
  const categories = [
    { id: 'Waterproofing', label: t('category.waterproofing') },
    { id: 'Sealants & Adhesives', label: t('category.sealants_adhesives') },
    { id: 'Redi-Mix G&M', label: t('category.redimix') },
    { id: 'Flooring Systems', label: t('category.flooring') },
    { id: 'Others (Insulation, Coatings)', label: t('category.others') }
  ];

  // Organized features by category
  const featureCategories = {
    applicationEnvironment: {
      title: t('features.application_environment'),
      features: [
        'Indoor Use',
        'Outdoor Use',
        'Underwater',
        'High Traffic Areas',
        'Chemical Exposure'
      ]
    },
    performanceProperties: {
      title: t('features.performance_properties'),
      features: [
        'Waterproof',
        'UV Resistant',
        'Flexible',
        'Fast Cure',
        'High Strength',
        'Low Odor',
        'Chemical Resistant',
        'Temperature Resistant'
      ]
    },
    baseType: {
      title: t('features.base_type'),
      features: [
        'Polyurethane',
        'Silicone',
        'Acrylic',
        'Epoxy',
        'Hybrid',
        'Cement Based'
      ]
    },
    specialFeatures: {
      title: t('features.special_features'),
      features: [
        'Eco Friendly',
        'Fire Resistant',
        'Anti Microbial',
        'Self Leveling',
        'Quick Setting',
        'Paintable'
      ]
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', category: [], features: [] };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Multiple category selection - toggle each category in/out of array
  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId];
    updateFilters({ category: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const toggleSection = (sectionKey: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const hasActiveFilters = Boolean(filters.search || filters.category.length > 0 || filters.features.length > 0);

  return (
    <FilterSection
      title={t('filter.title')}
      searchPlaceholder={t('filter.search_placeholder')}
      searchValue={filters.search}
      onSearchChange={(value) => updateFilters({ search: value })}
      onClear={clearFilters}
      hasActiveFilters={hasActiveFilters}
    >
      {/* Categories - Multiple Selection */}
      <FilterCategory title={t('filter.category')}>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            label={category.label}
            isSelected={filters.category.includes(category.id)}
            onClick={() => toggleCategory(category.id)}
          />
        ))}
      </FilterCategory>

      {/* Feature Categories - Multiple Selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">{t('filter.features')}</h4>
        
        {Object.entries(featureCategories).map(([key, category]) => (
          <div key={key} className="border border-border rounded-lg">
            <button
              onClick={() => toggleSection(key as keyof typeof expandedSections)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm">{category.title}</span>
              {expandedSections[key as keyof typeof expandedSections] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections[key as keyof typeof expandedSections] && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature) => (
                    <FilterButton
                      key={feature}
                      label={feature}
                      isSelected={filters.features.includes(feature)}
                      onClick={() => toggleFeature(feature)}
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default ProductFilter;