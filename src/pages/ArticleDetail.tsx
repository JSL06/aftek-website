import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  image: string;
  published_at: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  view_count: number;
  created_at: string;
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug || slug === 'null') {
        setError('Invalid article URL');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // First try to fetch by slug
        let { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('isactive', true)
          .eq('is_published', true)
          .single();

        // If slug not found, try to fetch by ID (fallback)
        if (error && error.code === 'PGRST116') {
          console.log('Slug not found, trying to fetch by ID...');
          const { data: dataById, error: errorById } = await supabase
            .from('articles')
            .select('*')
            .eq('id', slug)
            .eq('isactive', true)
            .eq('is_published', true)
            .single();
          
          if (errorById) {
            console.error('Error fetching article by ID:', errorById);
            setError('Article not found');
          } else {
            data = dataById;
            error = null;
          }
        }

        if (error) {
          console.error('Error fetching article:', error);
          setError('Article not found');
        } else {
          setArticle(data);
          // Increment view count
          if (data) {
            await supabase.rpc('increment_article_view_count', { article_id: data.id });
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The article you are looking for does not exist.'}</p>
            <Link to="/articles">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-24">


        {/* Article Header */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{article.category}</span>
              </div>
            </div>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Article Image */}
          {article.image && (
            <div className="mb-8">
              <div className="aspect-video bg-gradient-accent rounded-xl overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {article.tags && article.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Back to Articles */}
          <div className="mt-12 text-center">
            <Link to="/articles">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 