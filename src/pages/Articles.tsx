import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Eye, ArrowRight, FileText, TrendingUp, BookOpen, BarChart3, Building, Home, Heart, Truck, Droplets, Settings } from 'lucide-react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';
import articleService, { Article, ArticleTag } from '@/services/articleService';

interface ArticleFilters {
  search: string;
  category: string[];
}

// Project categories (same as projects page)
const projectCategories = [
  'Infrastructure', 'Industrial', 'High-Tech', 'Commercial', 'Residential', 
  'Healthcare', 'Education', 'Transportation', 'Energy', 'Water Treatment', 
  'Manufacturing', 'General'
];

// Article Card Component with Template-based Design
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const navigate = useNavigate();
  const { t, language: currentLanguage } = useTranslation();
  
  // Helper function to get localized text with fallback
  const getLocalizedText = (article: Article, field: 'titles' | 'excerpts' | 'authors_multilingual' | 'categories_multilingual', fallback: string): string => {
    if (article[field] && article[field][currentLanguage]) {
      return article[field][currentLanguage];
    }
    // Fallback to English
    if (article[field] && article[field]['en']) {
      return article[field]['en'];
    }
    return fallback;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {article.featured_image && (
          <img 
            src={article.featured_image} 
            alt={getLocalizedText(article, 'titles', 'Article')}
            className="w-full h-48 object-cover"
          />
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.published_at || article.created_at || '').toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.read_time || 5} min read
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {getLocalizedText(article, 'authors_multilingual', 'Unknown Author')}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {getLocalizedText(article, 'titles', 'Untitled Article')}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {getLocalizedText(article, 'excerpts', 'No excerpt available')}
        </p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map(tag => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/articles/${article.slug}`)}
            className="flex items-center gap-2"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>View</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Articles() {
  const { t, language: currentLanguage } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>({
    search: '',
    category: ['all']
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await articleService.getPublishedArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = articles;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article => {
        const title = article.titles?.[currentLanguage] || article.titles?.['en'] || '';
        const excerpt = article.excerpts?.[currentLanguage] || article.excerpts?.['en'] || '';
        const author = article.authors_multilingual?.[currentLanguage] || article.authors_multilingual?.['en'] || '';
        
        return title.toLowerCase().includes(searchLower) ||
               excerpt.toLowerCase().includes(searchLower) ||
               author.toLowerCase().includes(searchLower);
      });
    }

    // Apply category filter
    if (filters.category.length > 0 && filters.category[0] !== 'all') {
      filtered = filtered.filter(article => 
        filters.category.includes(article.categories_multilingual?.[currentLanguage] || article.categories_multilingual?.['en'] || '')
      );
    }



    setFilteredArticles(filtered);
  }, [articles, filters, currentLanguage]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, category: value }));
  };



  const clearFilters = () => {
    setFilters({
      search: '',
      category: ['all']
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: `url(${bgMain})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      {/* Title Section with Special Background */}
      <div 
        className="relative py-16 mb-12"
        style={{
          backgroundImage: `url(${bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {t('articles.title') || 'Articles'}
          </h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Articles
              </label>
              <Input
                placeholder="Search by title, content, or author..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={filters.category[0] || 'all'} onValueChange={(value) => handleCategoryChange([value])}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {projectCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredArticles.length} of {articles.length} articles
          </p>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <FileText className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {filters.search || filters.category.length > 0 || filters.template
                ? 'Try adjusting your filters or search terms.'
                : 'No articles have been published yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}