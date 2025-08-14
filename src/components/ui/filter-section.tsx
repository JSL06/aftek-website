import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  children: ReactNode;
  className?: string;
}

export const FilterSection = ({
  title,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onClear,
  hasActiveFilters = false,
  children,
  className
}: FilterSectionProps) => {
  return (
    <div className={cn("mb-8 p-6 bg-transparent", className)} style={{ fontFamily: 'inherit' }}>
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {hasActiveFilters && onClear && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      {onSearchChange && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Filter Content */}
      {children}
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const FilterButton = ({ label, isSelected, onClick, className }: FilterButtonProps) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "transition-smooth",
        isSelected
          ? "text-primary-foreground" // Only text color, no extra bg or shadow
          : "hover:bg-primary/10",
        className
      )}
    >
      {label}
    </Button>
  );
};

interface FilterCategoryProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const FilterCategory = ({ title, children, className }: FilterCategoryProps) => {
  return (
    <div className={cn("mb-6", className)}>
      <h4 className="text-sm font-medium text-foreground mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}; 