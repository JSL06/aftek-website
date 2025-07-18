import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, ArrowLeft, FileText, Calendar, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import ArticleFilter, { ArticleFilters } from '@/components/ArticleFilter';
import RichTextEditor from '@/components/RichTextEditor';
import LanguageSelector, { Language, LANGUAGES } from '@/components/LanguageSelector';
import MultilingualFormField from '@/components/MultilingualFormField';
import TranslationStatus from '@/components/TranslationStatus';
import { useTranslation } from '@/hooks/useTranslation';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  category?: string;
  published_at?: string;
  is_published?: boolean;
  created_at?: string;
  // Multilingual fields
  titles?: Record<string, string>;
  contents?: Record<string, string>;
  excerpts?: Record<string, string>;
}

const Articles = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant' as Language);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({ 
    search: '', 
    category: []
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    is_published: true,
    // Multilingual content
    translations: {} as Record<string, any>
  });

  // Article categories
  const categories = [
    { value: 'Industry News', label: 'Industry News' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Sustainability', label: 'Sustainability' },
    { value: 'Case Studies', label: 'Case Studies' },
    { value: 'Product Updates', label: 'Product Updates' },
    { value: 'Company News', label: 'Company News' }
  ];

  // Fetch articles from Supabase
  useEffect(() => {
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
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
        article.content.toLowerCase().includes(searchLower) ||
        (article.author && article.author.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(article =>
        article.category && filters.category.includes(article.category)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, filters]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (newFilters: ArticleFilters) => {
    setFilters(newFilters);
  };

  const handleAddNew = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      is_published: true,
      translations: {}
    });
    setShowForm(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    
    // Prepare translations data
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        title: lang.code === 'en' ? article.title : (article.titles?.[lang.code] || ''),
        content: lang.code === 'en' ? article.content : (article.contents?.[lang.code] || ''),
        excerpt: lang.code === 'en' ? article.excerpt : (article.excerpts?.[lang.code] || ''),
        author: article.author || '',
        category: article.category || ''
      };
    });

    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      author: article.author || '',
      category: article.category || '',
      is_published: article.is_published !== false,
      translations
    });
    setShowForm(true);
  };

  const handleTranslationChange = (language: Language, fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: {
          ...prev.translations[language],
          [fieldName]: value
        }
      }
    }));
  };



  const handleSave = async () => {
    setLoading(true);
    
    // Validate required fields for current language
    const currentLangData = formData.translations[selectedLanguage] || {};
    if (!currentLangData.title && !formData.title) {
      alert(t('admin.articles.titleRequired'));
      setLoading(false);
      return;
    }

    try {
      // Generate slug from title
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };

      const slug = generateSlug(formData.title || currentLangData.title);

      // Prepare article data with multilingual content
      const articleData: Partial<Article> = {
        title: formData.title || currentLangData.title,
        content: formData.content || currentLangData.content,
        excerpt: formData.excerpt || currentLangData.excerpt,
        author: formData.author,
        category: formData.category,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        titles: {},
        contents: {},
        excerpts: {}
      };

      // Add multilingual content
      LANGUAGES.forEach(lang => {
        const langData = formData.translations[lang.code];
        if (langData?.title) {
          articleData.titles![lang.code] = langData.title;
        }
        if (langData?.content) {
          articleData.contents![lang.code] = langData.content;
        }
        if (langData?.excerpt) {
          articleData.excerpts![lang.code] = langData.excerpt;
        }
      });

      if (editingArticle && editingArticle.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update({
            ...articleData,
            slug: slug
          })
          .eq('id', editingArticle.id);
        if (error) {
          console.error('Supabase update error:', error);
                  alert(t('admin.articles.updateError') + ': ' + error.message);
      } else {
        alert(t('admin.articles.updateSuccess'));
      }
      } else {
        // Add new article
        const { error } = await supabase
          .from('articles')
          .insert([{
            ...articleData,
            slug: slug
          }]);
        if (error) {
          console.error('Supabase insert error:', error);
                  alert(t('admin.articles.addError') + ': ' + error.message);
      } else {
        alert(t('admin.articles.addSuccess'));
      }
      }
      await fetchArticles();
      setShowForm(false);
      setEditingArticle(null);
    } catch (error) {
      alert(t('admin.articles.saveError'));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) {
        alert(t('admin.articles.deleteError'));
      } else {
        alert(t('admin.articles.deleteSuccess'));
        await fetchArticles();
      }
    } catch (error) {
      alert(t('admin.articles.deleteError'));
    }
    setLoading(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingArticle ? t('admin.articles.edit') : t('admin.articles.addNew')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="bg-background border-b border-border pb-4 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              {/* Translation Status */}
              <div className="bg-muted p-4 rounded-lg">
                <TranslationStatus
                  translations={formData.translations}
                  requiredFields={['title', 'content']}
                />
              </div>



              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  {t('admin.dashboard.currentSelection')}: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                <div className="space-y-6">
                  <MultilingualFormField
                    label={t('admin.articles.articleTitle')}
                    fieldName="title"
                    type="text"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <MultilingualFormField
                    label={t('admin.articles.excerpt')}
                    fieldName="excerpt"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />

                  <div>
                    <Label htmlFor="content">{t('admin.articles.content')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                    <RichTextEditor
                      value={formData.translations[selectedLanguage]?.content || ''}
                      onChange={(value) => handleTranslationChange(selectedLanguage, 'content', value)}
                      placeholder={`${t('admin.articles.contentPlaceholder')} (${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})`}
                    />
                  </div>
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="author">{t('admin.articles.author')}</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder={t('admin.articles.authorPlaceholder')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">{t('admin.articles.category')}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.articles.selectCategory')} />
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">{t('admin.articles.published')}</Label>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t('admin.articles.saving') : t('admin.articles.save')}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  {t('admin.products.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayArticles = filteredArticles;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('admin.products.backToProducts')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('admin.articles.title')}</h1>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.selectLanguage')}:</span>
            </div>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.code as Language)}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.articles.title')}</h1>
            <p className="text-muted-foreground">{t('admin.articles.manageArticles')}</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.articles.addNew')}
          </Button>
        </div>

        {/* Article Filter */}
        <ArticleFilter onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('admin.articles.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      <Badge variant={article.is_published ? "default" : "secondary"}>
                        {article.is_published ? t('admin.articles.published') : t('admin.articles.draft')}
                      </Badge>
                      {article.category && (
                        <Badge variant="outline" className="ml-2">
                          {article.category}
                        </Badge>
                      )}
                      <p className="text-muted-foreground text-sm mb-2 mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('admin.articles.author')}: {article.author}</p>
                      <p className="text-xs text-muted-foreground">{article.published_at ? `${t('admin.articles.published')}: ${new Date(article.published_at).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={article.is_published ? "destructive" : "default"}
                        className={article.is_published ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}
                        onClick={async () => {
                          setLoading(true);
                          await supabase
                            .from('articles')
                            .update({ is_published: !article.is_published, published_at: !article.is_published ? new Date().toISOString() : null })
                            .eq('id', article.id);
                          await fetchArticles();
                          setLoading(false);
                        }}
                      >
                        {article.is_published ? (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {displayArticles.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first article.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Article
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Showing {displayArticles.length} of {articles.length} articles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Articles;