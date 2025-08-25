import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';
import articleService, { Article } from '@/services/articleService';
import InlineArticleEditor from '@/components/InlineArticleEditor';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language: currentLanguage } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Invalid article URL');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await articleService.getArticle(slug);
        if (data && data.is_published) {
          setArticle(data);
        } else {
          setError('Article not found or not published');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Article not found');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-red-400 mb-4">
              <Tag className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
            <Link to="/articles">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0">
          {article.featured_image && (
            <img 
              src={article.featured_image} 
              alt={getLocalizedText(article, 'titles', 'Article')}
              className="w-full h-full object-cover opacity-20"
            />
          )}
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center">
            <Link to="/articles">
              <Button variant="outline" className="mb-6 text-white border-white hover:bg-white hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {getLocalizedText(article, 'titles', 'Untitled Article')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              {getLocalizedText(article, 'excerpts', 'No excerpt available')}
            </p>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(article.published_at || article.created_at || '').toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.read_time || 5} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{getLocalizedText(article, 'authors_multilingual', 'Unknown Author')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{getLocalizedText(article, 'categories_multilingual', 'Uncategorized')}</span>
              </div>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {article.content_blocks && article.content_blocks.length > 0 ? (
              <div className="prose prose-lg max-w-none">
                <InlineArticleEditor
                  initialContent={article.content_blocks}
                  onContentChange={() => {}} // Read-only in detail view
                  readOnly={true}
                  relatedProducts={article.related_products}
                  relatedLinks={article.related_links}
                  customButtons={article.custom_buttons}
                />
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 italic">
                  {getLocalizedText(article, 'contents', 'No content available for this article.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 