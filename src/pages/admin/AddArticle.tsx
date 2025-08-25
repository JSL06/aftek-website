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
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';

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
  
  // Article form state
  const [article, setArticle] = useState<Article>({
    slug: '',
    titles: {},
    contents: {},
    excerpts: {},
    authors_multilingual: {},
    categories_multilingual: {},
    read_time: 5,
    is_published: false,
    featured_image: '',
    content_blocks: []
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('news');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedTags, setSelectedTags] = useState<ArticleTag[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
    if (!article.titles?.en) {
      toast({
        title: "Error",
        description: "Article title is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Generate slug from English title
      const slug = articleService.generateSlug(article.titles.en);
      
      const articleData = {
        ...article,
        slug,
        content_blocks: contentBlocks,
        categories_multilingual: {
          ...article.categories_multilingual,
          en: selectedTemplate
        }
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
      [field]: {
        ...prev[field as keyof Article] as Record<string, string>,
        [language]: value
      }
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await articleService.uploadImage(file);
      if (imageUrl) {
        setUploadedImages(prev => [...prev, imageUrl]);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-Hant', name: '繁體中文' },
    { code: 'zh-Hans', name: '简体中文' },
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
          <TabsList className="grid w-full grid-cols-7">
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
                    value={article.titles?.[lang.code] || ''}
                    onChange={(e) => updateTranslation('titles', lang.code, e.target.value)}
                    placeholder={`Enter title in ${lang.name}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`author-${lang.code}`}>Author ({lang.name})</Label>
                  <Input
                    id={`author-${lang.code}`}
                    value={article.authors_multilingual?.[lang.code] || ''}
                    onChange={(e) => updateTranslation('authors_multilingual', lang.code, e.target.value)}
                    placeholder={`Enter author in ${lang.name}`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor={`excerpt-${lang.code}`}>Article Excerpt ({lang.name})</Label>
                  <Input
                    id={`excerpt-${lang.code}`}
                    value={article.excerpts?.[lang.code] || ''}
                    onChange={(e) => updateTranslation('excerpts', lang.code, e.target.value)}
                    placeholder={`Enter excerpt in ${lang.name}`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor={`content-${lang.code}`}>Article Content ({lang.code})</Label>
                  <Input
                    id={`content-${lang.code}`}
                    value={article.contents?.[lang.code] || ''}
                    onChange={(e) => updateTranslation('contents', lang.code, e.target.value)}
                    placeholder={`Enter content in ${lang.code}`}
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
        <h2 className="text-lg font-semibold mb-4">Featured Image</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </div>
          
          {article.featured_image && (
            <div>
              <Label>Current Featured Image</Label>
              <img 
                src={article.featured_image} 
                alt="Featured" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
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
