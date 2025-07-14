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
  category: string[];
  features: string[];
}

const ProductFilter = ({ onFilterChange }: ProductFilterProps) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: [],
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
        t('features.indoor_use'),
        t('features.outdoor_use'),
        t('features.chemical_resistance')
      ]
    },
    performanceProperties: {
      title: t('features.key_performance_properties'),
      features: [
        t('features.waterproof'),
        t('features.fire_resistant'),
        t('features.weather_resistant'),
        t('features.fast_curing'),
        t('features.high_strength')
      ]
    },
    baseType: {
      title: t('features.base_type'),
      features: [
        t('features.water_based'),
        t('features.solvent_based')
      ]
    },
    specialFeatures: {
      title: t('features.special_features'),
      features: [
        t('features.nontoxic'),
        t('features.self_leveling'),
        t('features.anti_slip'),
        t('features.uv_resistant'),
        t('features.temperature_resistant')
      ]
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared = { search: '', category: [], features: [] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

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
      {/* Categories */}
      <FilterCategory title={t('filter.category')}>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            label={category.label}
            isSelected={Boolean(filters.category.includes(category.id))}
            onClick={() => toggleCategory(category.id)}
          />
        ))}
      </FilterCategory>

      {/* Feature Categories */}
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
                      isSelected={Boolean(filters.features.includes(feature))}
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