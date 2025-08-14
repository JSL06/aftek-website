import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface ArticleFilterProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const ArticleFilter: React.FC<ArticleFilterProps> = ({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onSearch,
  onClear,
}) => {
  const { t } = useTranslation();

  const categories = [
    { value: 'all', label: t('All Categories') },
    { value: 'news', label: t('News') },
    { value: 'case-studies', label: t('Case Studies') },
    { value: 'technical', label: t('Technical') },
    { value: 'industry', label: t('Industry') },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('Filter Articles')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('Search articles...')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('All Categories')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSearch}>
              {t('Search')}
            </Button>
            <Button variant="outline" onClick={onClear}>
              {t('Clear')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleFilter; 