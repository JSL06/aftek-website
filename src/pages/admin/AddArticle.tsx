import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import TagSelector from '@/components/TagSelector';
import { ArrowLeft, Save, Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { articleService, Article } from '@/services/articleService';

const articleTemplates = [
  { id: 'news', name: 'News', description: 'Company news and announcements', icon: '📰' },
  { id: 'technical', name: 'Technical', description: 'Technical articles and guides', icon: '🔧' },
  { id: 'case-study', name: 'Case Study', description: 'Project case studies and success stories', icon: '📊' },
  { id: 'industry', name: 'Industry', description: 'Industry insights and trends', icon: '🏭' },
  { id: 'product', name: 'Product', description: 'Product information and updates', icon: '📦' }
];

export default function AddArticle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language: currentLanguage } = useAdminLanguage();
  
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]); // Changed to any[] as ArticleTag is removed
  
  // Article form state - using the new language-specific structure
  const [article, setArticle] = useState<Article>({
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
    category_en: '',
    category_zh_hant: '',
    category_ja: '',
    category_ko: '',
    category_th: '',
    category_vi: '',
    read_time: 5,
    is_published: false,
    featured_image: '',
    title_background_image: '',
    card_image: '',
    content_blocks_en: [],
    content_blocks_zh_hant: [],
    content_blocks_ja: [],
    content_blocks_ko: [],
    content_blocks_th: [],
    content_blocks_vi: [],
    content_en: '',
    content_zh_hant: '',
    content_ja: '',
    content_ko: '',
    content_th: '',
    content_vi: ''
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('news');
  const [selectedTags, setSelectedTags] = useState<any[]>([]); // Changed to any[]
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Debounce timer for input updates
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle featured image upload - using exact same logic as projects page
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Use the same bucket logic as projects page
        const fileName = `article-featured-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('project-images') // Use the working bucket from projects
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
      
        setArticle(prev => ({ ...prev, featured_image: publicUrl }));
        toast({
          title: "Success",
          description: "Featured image uploaded successfully"
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle title background image upload - using exact same logic as projects page
  const handleTitleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Use the same bucket logic as projects page
        const fileName = `article-title-bg-${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('project-images') // Use the working bucket from projects
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
      
        setArticle(prev => ({ ...prev, title_background_image: publicUrl }));
        toast({
          title: "Success",
          description: "Title background image uploaded successfully"
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle card image upload - using exact same logic as projects page
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Use the same bucket logic as projects page
        const fileName = `article-card-${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('project-images') // Use the working bucket from projects
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
      
        setArticle(prev => ({ ...prev, card_image: publicUrl }));
        toast({
          title: "Success",
          description: "Card image uploaded successfully"
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Initialize article state with empty values for all languages
  useEffect(() => {
    const initialArticle: Article = {
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
      category_en: '',
      category_zh_hant: '',
      category_ja: '',
      category_ko: '',
      category_th: '',
      category_vi: '',
      read_time: 5,
      is_published: false,
      featured_image: '',
      title_background_image: '',
      card_image: '',
      content_blocks_en: [],
      content_blocks_zh_hant: [],
      content_blocks_ja: [],
      content_blocks_ko: [],
      content_blocks_th: [],
      content_blocks_vi: [],
      content_en: '',
      content_zh_hant: '',
      content_ja: '',
      content_ko: '',
      content_th: '',
      content_vi: ''
    };
    
    setArticle(initialArticle);
    console.log('Article state initialized');
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await articleService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSave = async () => {
    if (!article.title_en) {
      toast({
        title: "Error",
        description: "Article title in English is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Generate slug from English title
      const slug = articleService.generateSlug(article.title_en);
      
      const articleData = {
        ...article,
        slug,
        category_en: selectedTemplate,
        category_zh_hant: selectedTemplate,
        category_ja: selectedTemplate,
        category_ko: selectedTemplate,
        category_th: selectedTemplate,
        category_vi: selectedTemplate
      };

      const savedArticle = await articleService.addArticle(articleData);
      
      if (savedArticle) {
        // Update tags and save images
        await articleService.updateArticleTags(savedArticle.id, selectedTags.map(t => t.id));
        
        // Save uploaded images
        for (const imageUrl of uploadedImages) {
          await articleService.saveImageRecord(savedArticle.id, imageUrl);
        }

        toast({
          title: "Success",
          description: "Article created successfully"
        });
        
        // Navigate back to articles list
        navigate('/admin/articles');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTranslation = useCallback((field: string, language: string, value: string) => {
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the update to handle fast typing
    debounceTimer.current = setTimeout(() => {
      setArticle(prev => ({
        ...prev,
        [`${field}_${language}`]: value
      }));
    }, 100); // 100ms debounce delay
  }, []);

  // Helper function to get current field value
  const getFieldValue = useCallback((field: string, language: string): string => {
    const fieldKey = `${field}_${language}` as keyof Article;
    return (article[fieldKey] as string) || '';
  }, [article]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-Hant', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
          <h1 className="text-3xl font-bold">Add New Article</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>

      {/* Language Picker */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Language Selection</h2>
        <Tabs value={currentLanguage} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {languages.map(lang => (
              <TabsTrigger key={lang.code} value={lang.code}>
                {lang.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {languages.map(lang => (
            <TabsContent key={lang.code} value={lang.code} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${lang.code}`}>Article Title ({lang.name})</Label>
                  <Input
                    id={`title-${lang.code}`}
                    value={getFieldValue('title', lang.code)}
                    onChange={(e) => {
                      e.preventDefault();
                      const value = e.target.value;
                      console.log(`Title ${lang.code} input change:`, value);
                      updateTranslation('title', lang.code, value);
                    }}
                    onKeyDown={(e) => {
                      // Prevent any weird key handling
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder={`Enter title in ${lang.name}`}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`author-${lang.code}`}>Author ({lang.name})</Label>
                  <Input
                    id={`author-${lang.code}`}
                    value={getFieldValue('author', lang.code)}
                    onChange={(e) => {
                      e.preventDefault();
                      const value = e.target.value;
                      console.log(`Author ${lang.code} input change:`, value);
                      updateTranslation('author', lang.code, value);
                    }}
                    onKeyDown={(e) => {
                      // Prevent any weird key handling
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder={`Enter author in ${lang.name}`}
                    className="w-full"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor={`excerpt-${lang.code}`}>Article Excerpt ({lang.name})</Label>
                  <Input
                    id={`excerpt-${lang.code}`}
                    value={getFieldValue('excerpt', lang.code)}
                    onChange={(e) => {
                      e.preventDefault();
                      const value = e.target.value;
                      console.log(`Excerpt ${lang.code} input change:`, value);
                      updateTranslation('excerpt', lang.code, value);
                    }}
                    onKeyDown={(e) => {
                      // Prevent any weird key handling
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder={`Enter excerpt in ${lang.name}`}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Article Settings */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Article Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="template">Article Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {articleTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="read-time">Read Time (minutes)</Label>
            <Input
              id="read-time"
              type="number"
              value={article.read_time || 5}
              onChange={(e) => setArticle(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
              min="1"
              max="60"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={article.is_published || false}
              onCheckedChange={(checked) => setArticle(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </div>
      </div>

      {/* Tags Selection */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Article Tags</h2>
        <TagSelector
          selectedTags={selectedTags}
          availableTags={availableTags}
          onTagsChange={setSelectedTags}
          maxTags={10}
          placeholder="Select tags for this article..."
        />
      </div>

      {/* Image Upload */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Article Images</h2>
        
        {/* Featured Image */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-medium">Featured Image</h3>
            <Badge variant="secondary">Main article image</Badge>
          </div>
          
          {/* Current Featured Image Display */}
          {article.featured_image && (
            <div className="relative">
              <img
                src={article.featured_image}
                alt="Current featured image"
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => {
                  setArticle(prev => ({ ...prev, featured_image: '' }));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Featured Image Upload - Using Projects Page Logic */}
          <div className="space-y-3">
            {article.featured_image && (
              <img src={article.featured_image} alt="Featured" className="w-full h-32 object-cover rounded-lg border" />
            )}
            <div className="flex items-center gap-2">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFeaturedImageUpload} 
                className="flex-1" 
              />
              <Button variant="outline" size="sm" className="px-3">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Main image displayed in article cards and detail pages. Recommended: 1200x630px, JPG/PNG, max 10MB
          </p>
        </div>

        {/* Title Background Image */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-medium">Title Background Image</h3>
            <Badge variant="outline">Optional</Badge>
          </div>
          
          {/* Current Title Background Image Display */}
          {article.title_background_image && (
            <div className="relative">
              <img
                src={article.title_background_image}
                alt="Current title background image"
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => {
                  setArticle(prev => ({ ...prev, title_background_image: '' }));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Title Background Image Upload - Using Projects Page Logic */}
          <div className="space-y-3">
            {article.title_background_image && (
              <img src={article.title_background_image} alt="Title Background" className="w-full h-24 object-cover rounded-lg border" />
            )}
            <div className="flex items-center gap-2">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleTitleBackgroundImageUpload} 
                className="flex-1" 
              />
              <Button variant="outline" size="sm" className="px-3">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Background image for article title section. Recommended: 1920x400px, JPG/PNG, max 10MB
          </p>
        </div>

        {/* Card Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-medium">Card Image</h3>
            <Badge variant="outline">Optional</Badge>
          </div>
          
          {/* Current Card Image Display */}
          {article.card_image && (
            <div className="relative">
              <img
                src={article.card_image}
                alt="Current card image"
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => {
                  setArticle(prev => ({ ...prev, card_image: '' }));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Card Image Upload - Using Projects Page Logic */}
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleCardImageUpload} 
              className="flex-1" 
            />
            <Button variant="outline" size="sm" className="px-3">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Image displayed in article cards and lists. Recommended: 400x300px, JPG/PNG, max 10MB
          </p>
        </div>
      </div>

      {/* Content Editor - Full Width at Bottom */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Article Content Editor</h2>
        
        {/* Language Tabs for Content */}
        <Tabs value={currentLanguage} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {languages.map(lang => (
              <TabsTrigger key={lang.code} value={lang.code}>
                {lang.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {languages.map(lang => (
            <TabsContent key={lang.code} value={lang.code} className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`content-${lang.code}`}>Article Content ({lang.name})</Label>
                  <textarea
                    id={`content-${lang.code}`}
                    value={getFieldValue('content', lang.code)}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateTranslation('content', lang.code, value);
                    }}
                    placeholder={`Enter article content in ${lang.name}`}
                    className="w-full h-64 p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use plain text or basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
