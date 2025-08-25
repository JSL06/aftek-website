import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Eye, ArrowRight, FileText, Newspaper, TrendingUp, Lightbulb, BookOpen, BarChart3, Globe, Zap } from 'lucide-react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  image: string;
  images?: string[];
  isactive: boolean;
  is_published: boolean;
  displayorder: number;
  slug: string;
  featured_image?: string;
  read_time?: number;
  tags?: string[];
  // Multilingual fields
  titles?: Record<string, string>;
  contents?: Record<string, string>;
  excerpts?: Record<string, string>;
  authors_multilingual?: Record<string, string>;
  categories_multilingual?: Record<string, string>;
}

interface ArticleFilters {
  search: string;
  category: string[];
  template: string;
}

// Article Template Types
const articleTemplates = [
  { 
    id: 'news', 
    name: 'News Article', 
    icon: Newspaper,
    description: 'Standard news format with headline, lead, and body',
    className: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  { 
    id: 'feature', 
    name: 'Feature Story', 
    icon: FileText,
    description: 'In-depth feature with detailed analysis',
    className: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  { 
    id: 'technical', 
    name: 'Technical Article', 
    icon: Lightbulb,
    description: 'Technical content with diagrams and explanations',
    className: 'bg-green-50 border-green-200 text-green-800'
  },
  { 
    id: 'case-study', 
    name: 'Case Study', 
    icon: BookOpen,
    description: 'Real-world examples and success stories',
    className: 'bg-orange-50 border-orange-200 text-orange-800'
  },
  { 
    id: 'analysis', 
    name: 'Market Analysis', 
    icon: BarChart3,
    description: 'Data-driven market insights and trends',
    className: 'bg-red-50 border-red-200 text-red-800'
  },
  { 
    id: 'opinion', 
    name: 'Opinion Piece', 
    icon: Globe,
    description: 'Expert opinions and industry perspectives',
    className: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  }
];

// Article Card Component with Template-based Design
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const navigate = useNavigate();
  const { t, language: currentLanguage } = useTranslation();
  
  // Helper function to get localized text with fallback
  const getLocalizedText = (article: Article, field: keyof Article, fallback: string): string => {
    const multilingualField = `${field}_multilingual` as keyof Article;
    if (multilingualField in article && article[multilingualField]) {
      const multilingualData = article[multilingualField] as Record<string, string>;
      return multilingualData[currentLanguage] || multilingualData['en'] || fallback;
    }
    return fallback;
  };

  // Get template info based on category
  const getTemplateInfo = (category: string) => {
    const template = articleTemplates.find(t => t.id === category.toLowerCase().replace(/\s+/g, '-')) || 
                    articleTemplates.find(t => t.id === 'news');
    return template || articleTemplates[0];
  };

  const template = getTemplateInfo(article.category);
  const TemplateIcon = template.icon;

  // Ensure we have a valid slug or ID for navigation
  const getArticleUrl = (article: Article): string => {
    if (article.slug && article.slug !== 'null' && article.slug.trim() !== '') {
      return `/articles/${article.slug}`;
    }
    return `/articles/${article.id}`;
  };

  const handleArticleClick = () => {
    const url = getArticleUrl(article);
    console.log('Navigating to article:', url);
    navigate(url);
  };

  const title = getLocalizedText(article, 'title', article.title);
  const excerpt = getLocalizedText(article, 'excerpt', article.excerpt);
  const author = getLocalizedText(article, 'author', article.author);
  const category = getLocalizedText(article, 'category', article.category);

  return (
    <div onClick={handleArticleClick} className="block group cursor-pointer">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white hover:bg-gray-50 overflow-hidden rounded-xl cursor-pointer h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header with Template Badge */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <Badge 
                variant="outline" 
                className={`${template.className} border-2 font-medium text-xs px-3 py-1`}
              >
                <TemplateIcon className="h-3 w-3 mr-1" />
                {template.name}
              </Badge>
              <div className="text-xs text-gray-500">
                {article.read_time ? `${article.read_time} min read` : '5 min read'}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
              {title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
              {excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span className="font-medium">{author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                {category}
              </Badge>
              <div className="flex items-center text-red-600 group-hover:text-red-700 transition-colors">
                <span className="text-sm font-medium mr-1">Read More</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Featured Image (if available) */}
          {article.featured_image && (
            <div className="mt-auto">
              <div 
                className="w-full h-32 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${article.featured_image})`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Articles = () => {
  const { t, currentLanguage } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({ 
    search: '', 
    category: [],
    template: 'all'
  });

  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Articles page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      // FIX: Handle missing isactive column gracefully
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('displayorder', { ascending: true });
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        // Filter active articles in memory if isactive column exists
        const activeArticles = data?.filter(article => 
          article.isactive === true || article.isactive === undefined
        ) || [];
        setArticles(activeArticles);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  // Apply filters whenever articles or filters change
  useEffect(() => {
    let filtered = [...articles];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article => {
        // Search in multilingual fields first, then fallback to base fields
        const title = getLocalizedText(article, 'title', article.title);
        const excerpt = getLocalizedText(article, 'excerpt', article.excerpt);
        const author = getLocalizedText(article, 'author', article.author);
        
        return title.toLowerCase().includes(searchLower) ||
               excerpt.toLowerCase().includes(searchLower) ||
               article.content.toLowerCase().includes(searchLower) ||
               author.toLowerCase().includes(searchLower);
      });
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(article => {
        const category = getLocalizedText(article, 'category', article.category);
        return filters.category.includes(category);
      });
    }

    // Template filter
    if (filters.template !== 'all') {
      filtered = filtered.filter(article => {
        const category = getLocalizedText(article, 'category', article.category);
        const templateId = category.toLowerCase().replace(/\s+/g, '-');
        return templateId === filters.template;
      });
    }

    setFilteredArticles(filtered);
  }, [articles, filters, currentLanguage]);

  // Helper function to get localized text with fallback
  const getLocalizedText = (article: Article, field: keyof Article, fallback: string): string => {
    const multilingualField = `${field}_multilingual` as keyof Article;
    if (multilingualField in article && article[multilingualField]) {
      const multilingualData = article[multilingualField] as Record<string, string>;
      return multilingualData[currentLanguage] || multilingualData['en'] || fallback;
    }
    return fallback;
  };

  const displayArticles = filteredArticles;

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
          <p className="text-white/90 text-lg mt-4 max-w-2xl mx-auto">
            Discover industry insights, technical articles, and company updates from AFTEK
          </p>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-7xl">
        
        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Choose Article Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {articleTemplates.map((template) => {
              const TemplateIcon = template.icon;
              const isSelected = filters.template === template.id;
              
              return (
                <button
                  key={template.id}
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    template: isSelected ? 'all' : template.id 
                  }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                    isSelected 
                      ? `${template.className} scale-105 shadow-lg` 
                      : 'bg-white/90 border-gray-200 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <TemplateIcon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-current' : 'text-gray-600'}`} />
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                    {template.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 border border-border rounded-lg bg-white/90 backdrop-blur-sm shadow-elegant">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search articles by title, content, or author..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="bg-white/50 border-border focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={filters.category.length > 0 ? filters.category[0] : 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? [] : [value] }))}
              >
                <SelectTrigger className="bg-white/50 border-border focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Industry News">Industry News</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Sustainability">Sustainability</SelectItem>
                  <SelectItem value="Case Studies">Case Studies</SelectItem>
                  <SelectItem value="Product Updates">Product Updates</SelectItem>
                  <SelectItem value="Company News">Company News</SelectItem>
                  <SelectItem value="Technical Articles">Technical Articles</SelectItem>
                  <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={filters.template} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, template: value }))}
              >
                <SelectTrigger className="bg-white/50 border-border focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {articleTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 col-span-full">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search, category, or template filters</p>
              <Button 
                onClick={() => setFilters({ search: '', category: [], template: 'all' })} 
                variant="outline"
                className="bg-white/50 border-gray-200 hover:bg-white hover:border-red-300 hover:text-red-600"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {displayArticles.length > 0 && (
          <div className="text-center text-gray-500 mb-8">
            <p>
              Showing {displayArticles.length} of {articles.length} articles
              {filters.template !== 'all' && ` in ${articleTemplates.find(t => t.id === filters.template)?.name} format`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;