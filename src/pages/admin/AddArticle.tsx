import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArticleImageManager, { ArticleImageBlock } from '@/components/ArticleImageManager';

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
  content_blocks?: ArticleImageBlock[];
  // Multilingual fields
  titles?: Record<string, string>;
  contents?: Record<string, string>;
  excerpts?: Record<string, string>;
  authors_multilingual?: Record<string, string>;
  categories_multilingual?: Record<string, string>;
}

export default function AddArticle() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [article, setArticle] = useState<Article>({
    id: '',
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    published_at: '',
    is_published: false,
    created_at: '',
    updated_at: '',
    slug: '',
    featured_image: '',
    read_time: 0,
    tags: [],
    titles: {},
    contents: {},
    excerpts: {},
    authors_multilingual: {},
    categories_multilingual: {}
  });
  const [saving, setSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Track current tab language
  const [contentBlocks, setContentBlocks] = useState<ArticleImageBlock[]>([]);

  const updateBasicField = (field: string, value: any) => {
    setArticle({
      ...article,
      [field]: value
    });
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
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
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Generate unique ID and timestamps
      const newArticle = {
        ...article,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: article.titles?.['en']?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'new-article'
      };
      
      const { error } = await supabase
        .from('articles')
        .insert([newArticle]);

      if (error) throw error;
      
      toast.success('Article created successfully!');
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold">Add New Article</h1>
            <p className="text-muted-foreground">Create a new article for your website</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Article
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
                  value={article.published_at || ''} 
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

        {/* Content Blocks */}
        <div className="xl:col-span-2">
          <ArticleImageManager 
            blocks={contentBlocks}
            onBlocksChange={setContentBlocks}
            onPreview={() => {
              // TODO: Implement preview functionality
              console.log('Preview article with blocks:', contentBlocks);
            }}
            articleTitle={article.titles?.[currentLanguage] || article.title || ''}
            articleExcerpt={article.excerpts?.[currentLanguage] || article.excerpt || ''}
            articleContent={article.contents?.[currentLanguage] || article.content || ''}
            featuredImage={article.featured_image}
            author={article.authors_multilingual?.[currentLanguage] || article.author}
            category={article.categories_multilingual?.[currentLanguage] || article.category}
            publishedAt={article.published_at}
            readTime={article.read_time}
          />
        </div>
      </div>
    </div>
  );
}
