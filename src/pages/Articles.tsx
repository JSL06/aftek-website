import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import ArticleFilter, { ArticleFilters } from '@/components/ArticleFilter';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  image: string;
  isactive: boolean;
  is_published: boolean;
  displayorder: number;
  slug: string;
}

const Articles = () => {
  const { t, currentLanguage } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({ 
    search: '', 
    category: []
  });

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('isactive', true)
        .eq('is_published', true)
        .order('displayorder', { ascending: true });
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
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
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.author.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(article =>
        filters.category.includes(article.category)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, filters, currentLanguage]);

  const handleFilterChange = (newFilters: ArticleFilters) => {
    setFilters(newFilters);
  };

  const displayArticles = filteredArticles;

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center mb-12">
          <h1 className="uniform-page-title">{t('articles.title') || 'Articles'}</h1>
        </div>
        
        {/* Article Filter */}
        <ArticleFilter onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            <p>Loading articles...</p>
          ) : displayArticles.map((article) => (
            <Link key={article.id} to={`/articles/${article.slug && article.slug !== 'null' ? article.slug : article.id}`} className="block">
              <Card className="border-0 shadow-card hover:shadow-elegant transition-smooth group bg-white hover:bg-gray-50 overflow-hidden rounded-xl cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-56 bg-gradient-accent flex items-center justify-center group-hover:scale-105 transition-smooth relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-elegant opacity-20"></div>
                    {/* You can add an image here if you want */}
                    <span className="absolute bottom-4 left-4 text-white/60 text-sm font-medium z-10">
                      {article.image}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-smooth">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium hover:bg-primary/20 transition-smooth">
                        {article.category}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium hover:bg-primary/20 transition-smooth">
                        {article.author}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium hover:bg-primary/20 transition-smooth">
                        {article.published_at}
                      </span>
                    </div>
                    {/* You can add a 'Read More' button or modal here if you want */}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            Showing {displayArticles.length} of {articles.length} articles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Articles;