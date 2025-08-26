import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock, FileText } from 'lucide-react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';
import articleService, { Article } from '@/services/articleService';
import InlineArticleEditor, { ContentBlock } from '@/components/InlineArticleEditor';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useTranslation();
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
        console.log('Fetching article with slug:', slug);
        const data = await articleService.getArticle(slug);
        console.log('Article service response:', data);
        
        if (data) {
          if (data.is_published) {
            console.log('Article loaded successfully:', data);
            console.log('Current language:', currentLanguage);
            
            // Get content blocks for the current language
            const languageSuffix = currentLanguage === 'en' ? '_en' : 
                                   currentLanguage === 'zh-Hant' ? '_zh_hant' :
                                   currentLanguage === 'ja' ? '_ja' :
                                   currentLanguage === 'ko' ? '_ko' :
                                   currentLanguage === 'th' ? '_th' :
                                   currentLanguage === 'vi' ? '_vi' : '_en';
            
            const contentBlocksField = `content_blocks${languageSuffix}` as keyof Article;
            const contentBlocks = data[contentBlocksField] as any[];
            
            console.log(`Content blocks for language ${currentLanguage} (${contentBlocksField}):`, contentBlocks);
            setArticle(data);
          } else {
            console.log('Article found but not published:', data);
            setError('This article is not published yet');
          }
        } else {
          console.log('No article found with slug:', slug);
          setError('Article not found');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 'PGRST116') {
            setError('Article not found - this article may have been deleted or moved');
          } else {
            setError(`Database error: ${error.code}`);
          }
        } else {
          setError('Failed to load article');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, currentLanguage]); // Re-fetch when language changes

  // Helper function to get localized text with fallback
  const getLocalizedText = (article: Article, field: 'title' | 'excerpt' | 'author' | 'category', fallback: string): string => {
    const languageSuffix = currentLanguage === 'en' ? '_en' : 
                           currentLanguage === 'zh-Hant' ? '_zh_hant' :
                           currentLanguage === 'ja' ? '_ja' :
                           currentLanguage === 'ko' ? '_ko' :
                           currentLanguage === 'th' ? '_th' :
                           currentLanguage === 'vi' ? '_vi' : '_en';
    
    const fieldName = `${field}${languageSuffix}` as keyof Article;
    const value = article[fieldName];
    
    if (value && typeof value === 'string' && value.trim()) {
      return value;
    }
    
    // Fallback to English
    const englishFieldName = `${field}_en` as keyof Article;
    const englishValue = article[englishFieldName];
    if (englishValue && typeof englishValue === 'string' && englishValue.trim()) {
      return englishValue;
    }
    
    return fallback;
  };

  // Helper function to get block CSS classes
  const getBlockClasses = (block: any) => {
    const classes = [];
    
    // Width classes
    switch (block.width) {
      case 'small': classes.push('w-1/4'); break;
      case 'medium': classes.push('w-1/2'); break;
      case 'large': classes.push('w-3/4'); break;
      case 'full': classes.push('w-full'); break;
      default: classes.push('w-full');
    }
    
    // Alignment classes
    switch (block.alignment) {
      case 'left': classes.push('text-left'); break;
      case 'center': classes.push('text-center'); break;
      case 'right': classes.push('text-right'); break;
      case 'justify': classes.push('text-justify'); break;
      default: classes.push('text-left');
    }
    
    // Margin classes
    switch (block.margin) {
      case 'tight': classes.push('my-2'); break;
      case 'normal': classes.push('my-4'); break;
      case 'loose': classes.push('my-8'); break;
      default: classes.push('my-4');
    }
    
    return classes.join(' ');
  };

  // Helper function to render content blocks
  const renderContentBlock = (block: any) => {
    // Get localized content for the current language
    const getLocalizedBlockContent = (block: any) => {
      console.log('Rendering block:', block);
      console.log('Current language:', currentLanguage);
      
      // Since we're now using separate language columns, we just return the block content
      // The parent component will handle switching between different language content arrays
      return block.content;
    };

    const localizedContent = getLocalizedBlockContent(block);
    
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.fontSize === 'h1' ? '1' : block.fontSize === 'h2' ? '2' : '3'}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag className={`font-${block.fontWeight} ${block.fontStyle === 'italic' ? 'italic' : ''} ${block.textDecoration === 'underline' ? 'underline' : ''}`}>
            {localizedContent}
          </HeadingTag>
        );
      
      case 'paragraph':
        return (
          <p className={`font-${block.fontWeight} ${block.fontStyle === 'italic' ? 'italic' : ''} ${block.textDecoration === 'underline' ? 'underline' : ''}`}>
            {localizedContent}
          </p>
        );
      
      case 'image':
        return (
          <div className="text-center">
            <img 
              src={block.imageUrl || block.content} 
              alt={block.imageAlt || 'Article image'} 
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {block.imageCaption && (
              <p className="text-sm text-gray-600 mt-2 italic">{block.imageCaption}</p>
            )}
          </div>
        );
      
      case 'list':
        const lines = localizedContent.split('\n');
        const title = lines[0];
        const items = lines.slice(1).filter(line => line.trim());
        
        return (
          <div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <ul className="list-disc list-inside space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-gray-700">{item.replace(/^[•\-\*]\s*/, '')}</li>
              ))}
            </ul>
          </div>
        );
      
      case 'row':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <h4 className="font-semibold mb-2">{localizedContent}</h4>
              <p className="text-gray-600">Left column content</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Right Column</h4>
              <p className="text-gray-600">Right column content</p>
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-700">{localizedContent}</p>;
    }
  };

  // Helper function to render related content
  const renderRelatedContent = () => {
    return (
      <div className="mt-8 space-y-6">
        {/* Related Products */}
        {article.related_products && article.related_products.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Related Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.related_products.map((productId, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">Product ID: {productId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Links */}
        {article.related_links && article.related_links.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Related Links</h3>
            <div className="space-y-2">
              {article.related_links.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <h4 className="font-medium text-blue-900">{link.title}</h4>
                  {link.description && (
                    <p className="text-sm text-blue-700 mt-1">{link.description}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Custom Buttons */}
        {article.custom_buttons && article.custom_buttons.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
            <div className="flex flex-wrap gap-3">
              {article.custom_buttons.map((button, index) => (
                <a 
                  key={index} 
                  href={button.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    button.variant === 'outline' 
                      ? 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' 
                      : button.variant === 'secondary'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : button.variant === 'destructive'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {button.text}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
              <FileText className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The article you are looking for does not exist.'}</p>
            {slug && (
              <p className="text-sm text-gray-500 mb-6">
                Requested slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
              </p>
            )}
            <div className="space-y-3">
              <Link to="/articles">
                <Button variant="outline" className="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-white bg-transparent text-white hover:bg-white hover:text-red-600 h-9 px-3 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Articles
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <p>This could happen if:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The article was deleted or moved</li>
                  <li>The URL is incorrect</li>
                  <li>The article hasn't been published yet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative py-16 mb-12 mt-20" style={{
        backgroundImage: article.title_background_image 
          ? `url(${article.title_background_image})`
          : 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Dimming overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px'}}>
            {getLocalizedText(article, 'title', 'Untitled Article')}
          </h1>
          
          {/* Back Button - Positioned below the title */}
          <div className="mt-8">
            <Link to="/articles">
              <Button variant="outline" className="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-white bg-transparent text-white hover:bg-white hover:text-red-600 h-9 px-3 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Remove the old top-left positioned button */}
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
                 <span>{getLocalizedText(article, 'author', 'Unknown Author')}</span>
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
             {(() => {
               // Get content blocks for the current language
               const languageSuffix = currentLanguage === 'en' ? '_en' : 
                                     currentLanguage === 'zh-Hant' ? '_zh_hant' :
                                     currentLanguage === 'ja' ? '_ja' :
                                     currentLanguage === 'ko' ? '_ko' :
                                     currentLanguage === 'th' ? '_th' :
                                     currentLanguage === 'vi' ? '_vi' : '_en';
               
               const contentBlocksField = `content_blocks${languageSuffix}` as keyof Article;
               const contentBlocks = article[contentBlocksField] as ContentBlock[];
               
               console.log(`Rendering content blocks for language ${currentLanguage} (${contentBlocksField}):`, contentBlocks);
               
               if (contentBlocks && contentBlocks.length > 0) {
                 return (
                   <div className="prose prose-lg max-w-none">
                     {/* Display content blocks in read-only mode */}
                     {contentBlocks.map((block, index) => (
                       <div key={block.id || index} className={`mb-4 ${getBlockClasses(block)}`}>
                         {renderContentBlock(block)}
                       </div>
                     ))}
                     
                     {/* Display related content */}
                     {renderRelatedContent()}
                   </div>
                 );
               } else {
                 return (
                   <div className="prose prose-lg max-w-none">
                     <p className="text-gray-600 italic">
                       {getLocalizedText(article, 'excerpt', 'No content available for this article.')}
                     </p>
                   </div>
                 );
               }
             })()}
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default ArticleDetail;