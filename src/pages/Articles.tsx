import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
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
  images?: string[]; // Array of image URLs for carousel
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
}

// Article Card Component with Image Carousel
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Get images array - fallback to single image if images array not available
  const getArticleImages = (article: Article): string[] => {
    if (article.images && article.images.length > 0) {
      return article.images;
    }
    // For demonstration, create mock images based on article
    // In production, you'd get this from your database
    const mockImages = [
      bgTitle, // Using existing image as fallback
    ];
    
    // Add more images for some articles for demo purposes
    if (article.id.includes('1') || article.id.includes('3')) {
      mockImages.push(bgMain);
    }
    if (article.id.includes('2') || article.id.includes('4')) {
      mockImages.push(bgTitle, bgMain);
    }
    
    return mockImages;
  };

  const images = getArticleImages(article);
  const hasMultipleImages = images.length > 1;

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Ensure we have a valid slug or ID for navigation
  const getArticleUrl = (article: Article): string => {
    if (article.slug && article.slug !== 'null' && article.slug.trim() !== '') {
      return `/articles/${article.slug}`;
    }
    // Fallback to ID if slug is not available
    return `/articles/${article.id}`;
  };

  const handleArticleClick = () => {
    const url = getArticleUrl(article);
    console.log('Navigating to article:', url);
    navigate(url);
  };

  return (
    <div onClick={handleArticleClick} className="block group cursor-pointer">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white hover:bg-gray-50 overflow-hidden rounded-xl cursor-pointer h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Carousel Section */}
          <div className="relative h-48 overflow-hidden">
            {/* Current Image */}
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url(${images[currentImageIndex] || bgTitle})`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
            </div>
            
            {/* Category Badge */}
            <span className="absolute top-4 left-4 text-white/80 text-xs font-medium px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm z-10">
              {getLocalizedText(article, 'category', article.category)}
            </span>

            {/* Image Navigation Dots */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleDotClick(index, e)}
                    className={`w-8 h-1 rounded-full transition-all duration-300 hover:opacity-80 ${
                      currentImageIndex === index 
                        ? 'bg-red-500' 
                        : 'bg-white/50'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Date */}
            <div className="absolute bottom-4 right-4 text-white/80 text-xs font-medium z-10">
              {new Date(article.published_at).toLocaleDateString()}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
              {getLocalizedText(article, 'title', article.title)}
            </h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3 flex-1">
              {getLocalizedText(article, 'excerpt', article.excerpt)}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
              <span className="font-medium">{getLocalizedText(article, 'author', article.author)}</span>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                  {getLocalizedText(article, 'category', article.category)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Articles = () => {
  const { t, currentLanguage } = useTranslation();
  
  // Helper function to get localized text with fallback
  const getLocalizedText = (article: Article, field: keyof Article, fallback: string): string => {
    const multilingualField = `${field}_multilingual` as keyof Article;
    if (multilingualField in article && article[multilingualField]) {
      const multilingualData = article[multilingualField] as Record<string, string>;
      return multilingualData[currentLanguage] || multilingualData['en'] || fallback;
    }
    return fallback;
  };
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({ 
    search: '', 
    category: []
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

    setFilteredArticles(filtered);
  }, [articles, filters, currentLanguage]);



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
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-6xl">
        
        {/* Filters */}
        <div className="mb-6 p-6 border border-border rounded-lg bg-white/90 backdrop-blur-sm shadow-elegant">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search articles..."
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
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="case-studies">Case Studies</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
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
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
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
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <Button 
                onClick={() => setFilters({ search: '', category: [] })} 
                variant="outline"
                className="bg-white/50 border-gray-200 hover:bg-white hover:border-red-300 hover:text-red-600"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        {/* Results Summary */}
        {!loading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                Showing <span className="text-red-600 font-semibold">{displayArticles.length}</span> of <span className="text-red-600 font-semibold">{articles.length}</span> articles
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;