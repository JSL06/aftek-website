import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload, X, Image as ImageIcon, Plus, Save, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ModernRichTextEditor from '@/components/ModernRichTextEditor';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { articleService, Article } from '@/services/articleService';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

const articleCategories = [
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'technical', name: 'Technical', icon: '🔧' },
  { id: 'case-study', name: 'Case Study', icon: '📊' },
  { id: 'industry', name: 'Industry', icon: '🏭' },
  { id: 'product', name: 'Product', icon: '📦' },
  { id: 'sustainability', name: 'Sustainability', icon: '🌱' },
  { id: 'innovation', name: 'Innovation', icon: '🚀' }
];

export default function AddArticle() {
  const navigate = useNavigate();
  const { t, language: adminLanguage } = useAdminLanguage();

  const [article, setArticle] = useState<Article>({
    id: '',
    slug: '',
    title_en: '',
    title_zh_hant: '',
    title_ja: '',
    title_ko: '',
    title_th: '',
    title_vi: '',
    excerpt_en: '',
    excerpt_zh_hant: '',
    excerpt_ja: '',
    excerpt_ko: '',
    excerpt_th: '',
    excerpt_vi: '',
    author_en: '',
    author_zh_hant: '',
    author_ja: '',
    author_ko: '',
    author_th: '',
    author_vi: '',
    category_en: 'news',
    category_zh_hant: 'news',
    category_ja: 'news',
    category_ko: 'news',
    category_th: 'news',
    category_vi: 'news',
    read_time: 5,
    is_published: false,
    featured_image: '',
    title_background_image: '',
    card_image: '',
    content_en: '',
    content_zh_hant: '',
    content_ja: '',
    content_ko: '',
    content_th: '',
    content_vi: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const updateBasicField = (field: string, value: any) => {
    setArticle(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
    const fieldKey = `${field}_${languageCode}` as keyof Article;
    setArticle(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'featured' | 'title_background' | 'card') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        if (!file.type.startsWith('image/')) {
          toast.error('Please select a valid image file');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }

        const fileName = `article-${imageType}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const { data, error } = await supabase.storage
          .from('article-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(fileName);
        
        updateBasicField(`${imageType}_image`, publicUrl);
        toast.success(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image uploaded successfully`);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    }
  };

  const removeImage = (imageType: 'featured' | 'title_background' | 'card') => {
    updateBasicField(`${imageType}_image`, '');
    toast.success(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image removed`);
  };

  const handleSave = async () => {
    if (!article.title_en.trim()) {
      toast.error('Article title in English is required');
      return;
    }

    if (!article.excerpt_en.trim()) {
      toast.error('Article excerpt in English is required');
      return;
    }

    if (!article.author_en.trim()) {
      toast.error('Author name in English is required');
      return;
    }

    setSaving(true);
    try {
      // Generate slug from English title
      const slug = article.title_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const articleData = {
        ...article,
        slug,
        // Ensure all languages have the same category
        category_zh_hant: article.category_en,
        category_ja: article.category_en,
        category_ko: article.category_en,
        category_th: article.category_en,
        category_vi: article.category_en
      };

      const savedArticle = await articleService.addArticle(articleData);
      
      if (savedArticle) {
        toast.success('Article created successfully!');
        navigate('/admin/articles');
      } else {
        toast.error('Failed to create article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const getFieldValue = (field: string, language: string): string => {
    const fieldKey = `${field}_${language}` as keyof Article;
    return (article[fieldKey] as string) || '';
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Article</h1>
            <p className="text-muted-foreground">Add a new multilingual article to your website</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentLanguage} onValueChange={setCurrentLanguage} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              {languages.map(lang => (
                <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.nativeName}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Article Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Article Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={article.category_en} 
                onValueChange={(value) => {
                  setArticle(prev => ({ 
                    ...prev, 
                    category_en: value,
                    category_zh_hant: value,
                    category_ja: value,
                    category_ko: value,
                    category_th: value,
                    category_vi: value
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {articleCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Read Time (minutes)</label>
              <Input
                type="number"
                value={article.read_time || 5}
                onChange={(e) => updateBasicField('read_time', parseInt(e.target.value) || 5)}
                min="1"
                max="60"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={article.is_published || false}
                onCheckedChange={(checked) => updateBasicField('is_published', checked)}
              />
              <label className="text-sm font-medium">Published</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Article Content - {languages.find(l => l.code === currentLanguage)?.nativeName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Title ({languages.find(l => l.code === currentLanguage)?.nativeName})
              </label>
              <Input
                value={getFieldValue('title', currentLanguage)}
                onChange={(e) => updateTranslation(currentLanguage, 'title', e.target.value)}
                placeholder={`Enter title in ${languages.find(l => l.code === currentLanguage)?.nativeName}`}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Author ({languages.find(l => l.code === currentLanguage)?.nativeName})
              </label>
              <Input
                value={getFieldValue('author', currentLanguage)}
                onChange={(e) => updateTranslation(currentLanguage, 'author', e.target.value)}
                placeholder={`Enter author in ${languages.find(l => l.code === currentLanguage)?.nativeName}`}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Excerpt ({languages.find(l => l.code === currentLanguage)?.nativeName})
            </label>
            <Input
              value={getFieldValue('excerpt', currentLanguage)}
              onChange={(e) => updateTranslation(currentLanguage, 'excerpt', e.target.value)}
              placeholder={`Enter excerpt in ${languages.find(l => l.code === currentLanguage)?.nativeName}`}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Brief summary of the article (displayed in article cards)
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Content ({languages.find(l => l.code === currentLanguage)?.nativeName})
            </label>
            <ModernRichTextEditor
              value={getFieldValue('content', currentLanguage)}
              onChange={(value) => updateTranslation(currentLanguage, 'content', value)}
              placeholder={`Enter article content in ${languages.find(l => l.code === currentLanguage)?.nativeName}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use the rich text editor to format your content with headings, lists, links, and more
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Article Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Image */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-medium">Featured Image</h3>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Main article image</span>
            </div>
            
            {article.featured_image && (
              <div className="relative">
                <img
                  src={article.featured_image}
                  alt="Featured image"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeImage('featured')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'featured')}
                disabled={loading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="px-3"
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Main image displayed in article cards and detail pages. Recommended: 1200x630px, JPG/PNG, max 10MB
            </p>
          </div>

          {/* Title Background Image */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-medium">Title Background Image</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Optional</span>
            </div>
            
            {article.title_background_image && (
              <div className="relative">
                <img
                  src={article.title_background_image}
                  alt="Title background image"
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeImage('title_background')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'title_background')}
                disabled={loading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="px-3"
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Background image for article title section. Recommended: 1920x400px, JPG/PNG, max 10MB
            </p>
          </div>

          {/* Card Image */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-medium">Card Image</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Optional</span>
            </div>
            
            {article.card_image && (
              <div className="relative">
                <img
                  src={article.card_image}
                  alt="Card image"
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeImage('card')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'card')}
                disabled={loading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="px-3"
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Image displayed in article cards and lists. Recommended: 400x300px, JPG/PNG, max 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-center pt-6">
        <Button onClick={handleSave} disabled={saving} size="lg" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
    </div>
  );
}
