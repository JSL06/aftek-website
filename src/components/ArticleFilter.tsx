import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';

interface ArticleFilterProps {
  onFilterChange: (filters: ArticleFilters) => void;
}

export interface ArticleFilters {
  search: string;
  category: string[];
}

const ArticleFilter = ({ onFilterChange }: ArticleFilterProps) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ArticleFilters>({
    search: '',
    category: []
  });

  // Common article categories
  const categories = [
    { id: 'Industry News', label: t('articles.categories.industry_news') || 'Industry News' },
    { id: 'Technology', label: t('articles.categories.technology') || 'Technology' },
    { id: 'Sustainability', label: t('articles.categories.sustainability') || 'Sustainability' },
    { id: 'Case Studies', label: t('articles.categories.case_studies') || 'Case Studies' },
    { id: 'Product Updates', label: t('articles.categories.product_updates') || 'Product Updates' },
    { id: 'Company News', label: t('articles.categories.company_news') || 'Company News' }
  ];

  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared = { search: '', category: [] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId];
    updateFilters({ category: newCategories });
  };

  const hasActiveFilters = Boolean(filters.search || filters.category.length > 0);

  return (
    <FilterSection
      title={t('articles.filters.title') || 'Filter Articles'}
      searchPlaceholder={t('articles.filters.search_placeholder') || 'Search articles...'}
      searchValue={filters.search}
      onSearchChange={(value) => updateFilters({ search: value })}
      onClear={clearFilters}
      hasActiveFilters={hasActiveFilters}
    >
      {/* Categories */}
      <FilterCategory title={t('articles.filters.categories') || 'Categories'}>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            label={category.label}
            isSelected={Boolean(filters.category.includes(category.id))}
            onClick={() => toggleCategory(category.id)}
          />
        ))}
      </FilterCategory>
      {/* Removed active filters display badges for simplicity */}
    </FilterSection>
  );
};

export default ArticleFilter; 