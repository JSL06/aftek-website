import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload, Image as ImageIcon, Building2, Calendar, MapPin, User, DollarSign, Clock, Star, Trash2, Save, Plus, Filter, SortAsc, SortDesc, Eye, EyeOff, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import ModernRichTextEditor from '@/components/ModernRichTextEditor';

// Language configuration
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

// Article categories with template mapping
const categories = [
  { value: 'Industry News', label: 'Industry News', template: 'news', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'Technology', label: 'Technology', template: 'technical', color: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'Sustainability', label: 'Sustainability', template: 'feature', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 'Case Studies', label: 'Case Studies', template: 'case-study', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { value: 'Product Updates', label: 'Product Updates', template: 'news', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'Company News', label: 'Company News', template: 'news', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'Technical Articles', label: 'Technical Articles', template: 'technical', color: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'Market Analysis', label: 'Market Analysis', template: 'analysis', color: 'bg-red-50 text-red-800 border-red-200' }
];

// Article templates for easy selection
const articleTemplates = [
  { 
    id: 'news', 
    name: 'News Article', 
    description: 'Standard news format with headline, lead, and body',
    icon: '📰',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  { 
    id: 'feature', 
    name: 'Feature Story', 
    description: 'In-depth feature with detailed analysis',
    icon: '📝',
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  { 
    id: 'technical', 
    name: 'Technical Article', 
    description: 'Technical content with diagrams and explanations',
    icon: '💡',
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  { 
    id: 'case-study', 
    name: 'Case Study', 
    description: 'Real-world examples and success stories',
    icon: '📚',
    color: 'bg-orange-50 border-orange-200 text-orange-800'
  },
  { 
    id: 'analysis', 
    name: 'Market Analysis', 
    description: 'Data-driven market insights and trends',
    icon: '📊',
    color: 'bg-red-50 border-red-200 text-red-800'
  },
  { 
    id: 'opinion', 
    name: 'Opinion Piece', 
    description: 'Expert opinions and industry perspectives',
    icon: '🌐',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  }
];

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
  updated_at?: string;
  slug?: string;
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

export default function AdminArticles() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Track current tab language

  // Load articles list function
  const loadArticles = async () => {
    try {
      console.log('🔄 Loading articles from database...');
      setListLoading(true);
      setListError(null);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('🔄 Articles loaded:', data?.length || 0, 'articles');
      setArticles(data || []);
    } catch (err: any) {
      console.error('Error loading articles list:', err);
      setListError(err?.message || 'Failed to load articles');
    } finally {
      setListLoading(false);
    }
  };

  // Load article when articleId changes
  useEffect(() => {
    if (articleId) {
      loadArticle(articleId);
    } else {
      loadArticles();
    }
  }, [articleId]);

  const loadArticle = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error: any) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBasicField = (field: string, value: any) => {
    if (article) {
      setArticle({
        ...article,
        [field]: value
      });
    }
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
    if (article) {
      const fieldMap: Record<string, keyof Article> = {
        'title': 'titles',
        'content': 'contents',
        'excerpt': 'excerpts',
        'author': 'authors_multilingual',
        'category': 'categories_multilingual'
      };
      
      const multilingualField = fieldMap[field];
      if (multilingualField) {
        const currentValue = article[multilingualField] as Record<string, string> || {};
        setArticle({
          ...article,
          [multilingualField]: {
            ...currentValue,
            [languageCode]: value
          }
        });
      }
    }
  };

  const handleSave = async () => {
    if (!article) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('articles')
        .upsert(article);

      if (error) throw error;
      
      toast.success('Article saved successfully!');
      if (!articleId) {
        navigate('/admin/articles');
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Article deleted successfully');
      loadArticles();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article: ' + error.message);
    }
  };

  // Index page: show list when no articleId
  if (!articleId) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Articles</h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/admin/articles/new')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Article
            </Button>
          </div>
        </div>

        {/* Article Management Controls */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value="all" onValueChange={(value) => console.log('Filter:', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Articles</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="draft">Draft Only</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-slate-500" />
              <Select value="newest" onValueChange={(value) => console.log('Sort:', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Bulk actions')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk Delete
            </Button>
          </div>
        </div>

        {listLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : listError ? (
          <div className="p-4 border rounded text-red-700 bg-red-50">{listError}</div>
        ) : articles.length === 0 ? (
          <div className="p-6 border rounded text-muted-foreground">No articles found.</div>
        ) : (
          <div className="grid gap-4">
            {articles.map(a => (
              <Card key={a.id} className={`${!a.is_published ? 'opacity-60 bg-slate-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-lg font-semibold truncate">
                          {a.titles?.['en'] || a.title}
                        </div>
                        <div className="flex items-center gap-2">
                          {a.is_published ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">Draft</Badge>
                          )}
                          {a.category && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              {a.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {a.excerpt || 'No excerpt available'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        ID: {a.id} • Created: {new Date(a.created_at || Date.now()).toLocaleDateString()}
                        {a.author && ` • Author: ${a.author}`}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Toggle article visibility
                          const updatedArticle = { ...a, is_published: !a.is_published };
                          supabase
                            .from('articles')
                            .update({ is_published: !a.is_published })
                            .eq('id', a.id)
                            .then(() => loadArticles());
                        }}
                        title={a.is_published ? 'Unpublish Article' : 'Publish Article'}
                      >
                        {a.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/articles/edit/${a.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${a.titles?.['en'] || a.title}"? This action cannot be undone.`)) {
                            try {
                              console.log('🗑️ Deleting article:', a.id, a.titles?.['en'] || a.title);
                              await deleteArticle(a.id);
                              console.log('🗑️ Delete result: success');
                            } catch (error) {
                              console.error('🗑️ Delete error:', error);
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Article Not Found</h2>
          <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/admin/articles')}>
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {articleId ? 'Edit Article' : 'Add New Article'}
            </h1>
            {articleId && (
              <p className="text-muted-foreground">ID: {article.id}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Article
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select 
                  value={article.category || ''} 
                  onValueChange={(value) => updateBasicField('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.label}</span>
                          <Badge variant="outline" className={`${category.color} text-xs`}>
                            {articleTemplates.find(t => t.id === category.template)?.icon} {articleTemplates.find(t => t.id === category.template)?.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Preview */}
              {article.category && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Template Preview</label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedCategory = categories.find(c => c.value === article.category);
                      const template = selectedCategory ? articleTemplates.find(t => t.id === selectedCategory.template) : null;
                      if (template) {
                        return (
                          <>
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{template.name}</div>
                              <div className="text-sm text-gray-600">{template.description}</div>
                            </div>
                          </>
                        );
                      }
                      return <span className="text-gray-500">Select a category to see template</span>;
                    })()}
                  </div>
                </div>
              )}

              {/* Author */}
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <Input 
                  value={article.author || ''} 
                  onChange={(e) => updateBasicField('author', e.target.value)} 
                  placeholder="Author name"
                />
              </div>

              {/* Published Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Published Date</label>
                <Input 
                  type="date" 
                  value={article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : ''} 
                  onChange={(e) => updateBasicField('published_at', e.target.value)} 
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-sm font-medium mb-2">Read Time (minutes)</label>
                <Input 
                  type="number" 
                  value={article.read_time || ''} 
                  onChange={(e) => updateBasicField('read_time', parseInt(e.target.value) || 0)} 
                  placeholder="5"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                <Input 
                  value={article.featured_image || ''} 
                  onChange={(e) => updateBasicField('featured_image', e.target.value)} 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Flags */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Published</label>
                    <p className="text-xs text-muted-foreground">Show this article on the website</p>
                  </div>
                  <Switch 
                    checked={article.is_published || false} 
                    onCheckedChange={(checked) => updateBasicField('is_published', checked)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multilingual Content */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multilingual Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full" onValueChange={setCurrentLanguage}>
                <TabsList className="grid w-full grid-cols-7 h-12 mb-6">
                  {languages.map(lang => (
                    <TabsTrigger key={lang.code} value={lang.code} className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.nativeName} - {lang.name}
                      </h3>
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Type className="h-4 w-4 inline mr-2" />
                            Article Title ({lang.nativeName})
                          </label>
                          <Input 
                            value={article.titles?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)} 
                            placeholder="Enter article title" 
                            className="text-lg font-medium" 
                          />
                        </div>
                        
                        {/* Excerpt */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Article Excerpt ({lang.nativeName})
                          </label>
                          <textarea
                            value={article.excerpts?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'excerpt', e.target.value)} 
                            placeholder="Enter article excerpt..." 
                            className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        
                        {/* Content */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Article Content ({lang.nativeName})
                          </label>
                          <ModernRichTextEditor 
                            value={article.contents?.[lang.code] || ''} 
                            onChange={(v) => updateTranslation(lang.code, 'content', v)} 
                            placeholder="Enter article content..." 
                            height="200px" 
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}