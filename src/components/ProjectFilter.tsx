import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';
import { Search, X } from 'lucide-react';
import { Project } from '@/services/projectService';
import { filterService } from '@/services/filterService';

export interface ProjectFilters {
  search: string;
  category: string[];
  features: string[];
  completionYear: string[];
}

interface ProjectFilterProps {
  projects: Project[];
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  className?: string;
}

const ProjectFilter = ({ projects, filters, onFiltersChange, className = '' }: ProjectFilterProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Update search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...filters, search: localSearch });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearch]);

  // Load filter options from database
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [categoriesData, featuresData] = await Promise.all([
          filterService.getCategories(),
          filterService.getFeatures()
        ]);
        setCategories(categoriesData);
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Fallback to project data if database fails
        const fallbackCategories = [...new Set(projects.map(p => p.category))].sort();
        const fallbackFeatures = [...new Set(projects.flatMap(p => p.features || []))].sort();
        setCategories(fallbackCategories);
        setFeatures(fallbackFeatures);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [projects]);

  // Extract completion years from projects
  const completionYears = [...new Set(projects.map(p => {
    const year = new Date(p.completion_date).getFullYear().toString();
    return isNaN(Number(year)) ? p.completion_date : year;
  }))].sort().reverse();

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category];
    onFiltersChange({ ...filters, category: newCategories });
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFiltersChange({ ...filters, features: newFeatures });
  };

  const handleYearToggle = (year: string) => {
    const newYears = filters.completionYear.includes(year)
      ? filters.completionYear.filter(y => y !== year)
      : [...filters.completionYear, year];
    onFiltersChange({ ...filters, completionYear: newYears });
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      category: [],
      features: [],
      completionYear: []
    });
  };

  const hasActiveFilters = 
    !!filters.search ||
    filters.category.length > 0 ||
    filters.features.length > 0 ||
    filters.completionYear.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search projects by name, description, location, or client..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocalSearch('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          
          {filters.category.map(category => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryToggle(category)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.features.map(feature => (
            <Badge key={feature} variant="secondary" className="gap-1">
              {feature}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeatureToggle(feature)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.completionYear.map(year => (
            <Badge key={year} variant="secondary" className="gap-1">
              {year}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleYearToggle(year)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="ml-2"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Sections - Each on Separate Row */}
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <FilterButton
                key={category}
                label={category}
                isSelected={filters.category.includes(category)}
                onClick={() => handleCategoryToggle(category)}
              />
            ))}
          </div>
        </div>

        {/* Completion Year Filter */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Completion Year</h4>
          <div className="flex flex-wrap gap-2">
            {completionYears.map(year => (
              <FilterButton
                key={year}
                label={year}
                isSelected={filters.completionYear.includes(year)}
                onClick={() => handleYearToggle(year)}
              />
            ))}
          </div>
        </div>

        {/* Features Filter */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Features</h4>
          <div className="flex flex-wrap gap-2">
            {features.map(feature => (
              <FilterButton
                key={feature}
                label={feature}
                isSelected={filters.features.includes(feature)}
                onClick={() => handleFeatureToggle(feature)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilter; 