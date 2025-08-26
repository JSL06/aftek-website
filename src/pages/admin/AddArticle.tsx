import React, { useState, useEffect } from 'react';
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
import InlineArticleEditor from '@/components/InlineArticleEditor';
import { ContentBlock } from '@/components/InlineArticleEditor';
import articleService, { Article, ArticleTag } from '@/services/articleService';
import TagSelector from '@/components/TagSelector';
import { ArrowLeft, Save, Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
  const [availableTags, setAvailableTags] = useState<ArticleTag[]>([]);
  
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
    content_blocks_vi: []
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('news');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedTags, setSelectedTags] = useState<ArticleTag[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
        content_blocks_en: contentBlocks,
        content_blocks_zh_hant: contentBlocks,
        content_blocks_ja: contentBlocks,
        content_blocks_ko: contentBlocks,
        content_blocks_th: contentBlocks,
        content_blocks_vi: contentBlocks,
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

  const updateTranslation = (field: string, language: string, value: string) => {
    setArticle(prev => ({
      ...prev,
      [`${field}_${language}`]: value
    }));
  };

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
                    value={article[`title_${lang.code}` as keyof Article] as string || ''}
                    onChange={(e) => updateTranslation('title', lang.code, e.target.value)}
                    placeholder={`Enter title in ${lang.name}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`author-${lang.code}`}>Author ({lang.name})</Label>
                  <Input
                    id={`author-${lang.code}`}
                    value={article[`author_${lang.code}` as keyof Article] as string || ''}
                    onChange={(e) => updateTranslation('author', lang.code, e.target.value)}
                    placeholder={`Enter author in ${lang.name}`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor={`excerpt-${lang.code}`}>Article Excerpt ({lang.name})</Label>
                  <Input
                    id={`excerpt-${lang.code}`}
                    value={article[`excerpt_${lang.code}` as keyof Article] as string || ''}
                    onChange={(e) => updateTranslation('excerpt', lang.code, e.target.value)}
                    placeholder={`Enter excerpt in ${lang.name}`}
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
                  setUploadedImages(prev => prev.filter(img => img !== article.featured_image));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Featured Image Upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setIsUploading(true);
                    console.log('Starting featured image upload:', file.name, file.size, file.type);
                    
                    // First, check if the article-images bucket exists
                    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
                    if (bucketsError) {
                      console.error('Error listing buckets:', bucketsError);
                      throw new Error('Failed to check storage buckets');
                    }
                    
                    // Find a suitable bucket for images
                    let targetBucket = 'article-images';
                    const availableBuckets = buckets || [];
                    
                    if (!availableBuckets.some(b => b.name === 'article-images')) {
                      console.warn('article-images bucket not found, looking for alternatives...');
                      
                      // Try to find any existing image bucket
                      const imageBucket = availableBuckets.find(b => 
                        b.name.includes('image') || 
                        b.name.includes('media') || 
                        b.name.includes('upload') ||
                        b.name.includes('product') // fallback to product-images if it exists
                      );
                      
                      if (imageBucket) {
                        targetBucket = imageBucket.name;
                        console.log(`Using fallback bucket: ${targetBucket}`);
                      } else {
                        throw new Error('No suitable storage bucket found. Please create an article-images bucket in Supabase.');
                      }
                    }
                    
                    // EXACT same upload logic as working projects
                    const fileName = `article-featured-${Date.now()}-${file.name}`;
                    console.log(`Uploading to bucket: ${targetBucket}, path: ${fileName}`);
                    
                    const { data, error } = await supabase.storage
                      .from(targetBucket)
                      .upload(fileName, file);
                    
                    if (error) {
                      console.error('Supabase upload error:', error);
                      throw error;
                    }
                    
                    // Get public URL - same as projects
                    const { data: { publicUrl } } = supabase.storage
                      .from(targetBucket)
                      .getPublicUrl(fileName);
                    
                    console.log('Featured image upload successful:', publicUrl);
                    
                    // Update article state
                    setArticle(prev => ({ ...prev, featured_image: publicUrl }));
                    setUploadedImages(prev => [...prev, publicUrl]);
                    
                    toast({
                      title: "Success",
                      description: "Featured image uploaded successfully"
                    });
                    
                  } catch (error) {
                    console.error('Error uploading featured image:', error);
                    toast({
                      title: "Error",
                      description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: "destructive"
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }
              }}
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
            </Button>
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
                  setUploadedImages(prev => prev.filter(img => img !== article.title_background_image));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Title Background Image Upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setIsUploading(true);
                    console.log('Starting title background image upload:', file.name, file.size, file.type);
                    
                    // Check buckets and find suitable one
                    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
                    if (bucketsError) {
                      console.error('Error listing buckets:', bucketsError);
                      throw new Error('Failed to check storage buckets');
                    }
                    
                    let targetBucket = 'article-images';
                    const availableBuckets = buckets || [];
                    
                    if (!availableBuckets.some(b => b.name === 'article-images')) {
                      const imageBucket = availableBuckets.find(b => 
                        b.name.includes('image') || b.name.includes('media') || b.name.includes('upload') || b.name.includes('product')
                      );
                      
                      if (imageBucket) {
                        targetBucket = imageBucket.name;
                        console.log(`Using fallback bucket: ${targetBucket}`);
                      } else {
                        throw new Error('No suitable storage bucket found. Please create an article-images bucket in Supabase.');
                      }
                    }
                    
                    const fileName = `article-title-bg-${Date.now()}-${file.name}`;
                    console.log(`Uploading to bucket: ${targetBucket}, path: ${fileName}`);
                    
                    const { data, error } = await supabase.storage
                      .from(targetBucket)
                      .upload(fileName, file);
                    
                    if (error) {
                      console.error('Supabase upload error:', error);
                      throw error;
                    }
                    
                    const { data: { publicUrl } } = supabase.storage
                      .from(targetBucket)
                      .getPublicUrl(fileName);
                    
                    console.log('Title background image upload successful:', publicUrl);
                    
                    setArticle(prev => ({ ...prev, title_background_image: publicUrl }));
                    setUploadedImages(prev => [...prev, publicUrl]);
                    
                    toast({
                      title: "Success",
                      description: "Title background image uploaded successfully"
                    });
                    
                  } catch (error) {
                    console.error('Error uploading title background image:', error);
                    toast({
                      title: "Error",
                      description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: "destructive"
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }
              }}
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3"
              disabled={isUploading}
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
                  setUploadedImages(prev => prev.filter(img => img !== article.card_image));
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          {/* Card Image Upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setIsUploading(true);
                    console.log('Starting card image upload:', file.name, file.size, file.type);
                    
                    // Check buckets and find suitable one
                    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
                    if (bucketsError) {
                      console.error('Error listing buckets:', bucketsError);
                      throw new Error('Failed to check storage buckets');
                    }
                    
                    let targetBucket = 'article-images';
                    const availableBuckets = buckets || [];
                    
                    if (!availableBuckets.some(b => b.name === 'article-images')) {
                      const imageBucket = availableBuckets.find(b => 
                        b.name.includes('image') || b.name.includes('media') || b.name.includes('upload') || b.name.includes('product')
                      );
                      
                      if (imageBucket) {
                        targetBucket = imageBucket.name;
                        console.log(`Using fallback bucket: ${targetBucket}`);
                      } else {
                        throw new Error('No suitable storage bucket found. Please create an article-images bucket in Supabase.');
                      }
                    }
                    
                    const fileName = `article-card-${Date.now()}-${file.name}`;
                    console.log(`Uploading to bucket: ${targetBucket}, path: ${fileName}`);
                    
                    const { data, error } = await supabase.storage
                      .from(targetBucket)
                      .upload(fileName, file);
                    
                    if (error) {
                      console.error('Supabase upload error:', error);
                      throw error;
                    }
                    
                    const { data: { publicUrl } } = supabase.storage
                      .from(targetBucket)
                      .getPublicUrl(fileName);
                    
                    console.log('Card image upload successful:', publicUrl);
                    
                    setArticle(prev => ({ ...prev, card_image: publicUrl }));
                    setUploadedImages(prev => [...prev, publicUrl]);
                    
                    toast({
                      title: "Success",
                      description: "Card image uploaded successfully"
                    });
                    
                  } catch (error) {
                    console.error('Error uploading card image:', error);
                    toast({
                      title: "Error",
                      description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: "destructive"
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }
              }}
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3"
              disabled={isUploading}
            >
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
        <div className="w-full">
          <InlineArticleEditor
            initialContent={contentBlocks}
            onContentChange={setContentBlocks}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
