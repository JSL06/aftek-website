import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import ArticleFilter, { ArticleFilters } from '@/components/ArticleFilter';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  image: string;
  isActive: boolean;
  order: number;
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
        .eq('isActive', true)
        .order('order', { ascending: true });
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
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-24">
        <div className="title-container">
          <h1 className="uniform-page-title">{t('articles.title') || 'Articles'}</h1>
        </div>
        
        {/* Article Filter */}
        <ArticleFilter onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            <p>Loading articles...</p>
          ) : displayArticles.map((article) => (
            <Card key={article.id} className="border-0 shadow-card hover:shadow-elegant transition-smooth group bg-card/80 backdrop-blur-sm hover:bg-card">
              <CardContent className="p-0 overflow-hidden rounded-xl">
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
                      {article.publishDate}
                    </span>
                  </div>
                  {/* You can add a 'Read More' button or modal here if you want */}
                </div>
              </CardContent>
            </Card>
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