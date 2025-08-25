import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import InlineArticleEditor from '@/components/InlineArticleEditor';
import { ContentBlock } from '@/components/InlineArticleEditor';
import articleService, { Article, ArticleTag } from '@/services/articleService';
import TagSelector from '@/components/TagSelector';
import { Plus, Edit, Trash2, Eye, Upload, Image as ImageIcon } from 'lucide-react';

const articleTemplates = [
  { id: 'news', name: 'News', description: 'Company news and announcements', icon: '📰' },
  { id: 'technical', name: 'Technical', description: 'Technical articles and guides', icon: '🔧' },
  { id: 'case-study', name: 'Case Study', description: 'Project case studies and success stories', icon: '📊' },
  { id: 'industry', name: 'Industry', description: 'Industry insights and trends', icon: '🏭' },
  { id: 'product', name: 'Product', description: 'Product information and updates', icon: '📦' }
];

export default function AdminArticles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language: currentLanguage } = useAdminLanguage();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    loadArticles();
    loadTags();
    
    // Check if we're editing an existing article
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setArticleId(editId);
      setIsEditing(true);
      loadArticle(editId);
    }
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      console.log('Loading articles from database...');
      const data = await articleService.loadArticlesFromDatabase();
      console.log('Articles loaded:', data);
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      console.log('Loading tags from database...');
      const tags = await articleService.getAllTags();
      console.log('Tags loaded:', tags);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadArticle = async (id: string) => {
    try {
      const data = await articleService.getArticleById(id);
      if (data) {
        setArticle(data);
        setContentBlocks(data.content_blocks || []);
        setSelectedTags(data.tags || []);
        setUploadedImages(data.images?.map(img => img.image_url) || []);
        
        // Set template based on category
        const category = data.categories_multilingual?.en || '';
        const template = articleTemplates.find(t => 
          t.name.toLowerCase() === category.toLowerCase()
        );
        if (template) {
          setSelectedTemplate(template.id);
        }
      }
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive"
      });
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

      let savedArticle: Article | null;
      
      if (isEditing && article.id) {
        savedArticle = await articleService.updateArticle(article.id, articleData);
        
        // Update tags
        if (savedArticle) {
          await articleService.updateArticleTags(savedArticle.id, selectedTags.map(t => t.id));
        }
      } else {
        savedArticle = await articleService.addArticle(articleData);
        
        // Update tags and save images if new article
        if (savedArticle) {
          await articleService.updateArticleTags(savedArticle.id, selectedTags.map(t => t.id));
          
          // Save uploaded images
          for (const imageUrl of uploadedImages) {
            await articleService.saveImageRecord(savedArticle.id, imageUrl);
          }
        }
      }

      if (savedArticle) {
        toast({
          title: "Success",
          description: isEditing ? "Article updated successfully" : "Article created successfully"
        });
        
        if (!isEditing) {
          // Reset form for new article
          setArticle({
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
          setContentBlocks([]);
          setSelectedTags([]);
          setUploadedImages([]);
          setSelectedTemplate('news');
        }
        
        await loadArticles();
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const success = await articleService.deleteArticle(id);
        if (success) {
          toast({
            title: "Success",
            description: "Article deleted successfully"
          });
          await loadArticles();
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        toast({
          title: "Error",
          description: "Failed to delete article",
          variant: "destructive"
        });
      }
    }
  };

  const createTestArticle = async () => {
    const testBlocks: ContentBlock[] = [
      {
        id: '1',
        type: 'heading',
        content: 'Heading Component',
        alignment: 'center',
        fontSize: 'h1',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false
      },
      {
        id: '2',
        type: 'paragraph',
        content: 'Paragraph Component - This is a test paragraph to demonstrate the paragraph component functionality.',
        alignment: 'left',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false
      },
      {
        id: '3',
        type: 'image',
        content: 'https://via.placeholder.com/600x400?text=Test+Image',
        imageUrl: 'https://via.placeholder.com/600x400?text=Test+Image',
        imageAlt: 'Test Image',
        imageCaption: 'This is a test image component',
        alignment: 'center',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'medium',
        margin: 'normal',
        isSelected: false
      },
      {
        id: '4',
        type: 'list',
        content: 'List Component\n• First item\n• Second item\n• Third item',
        alignment: 'left',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false
      },
      {
        id: '5',
        type: 'row',
        content: 'Multi-column Row',
        alignment: 'left',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false,
        columns: 2,
        columnLayout: 'equal',
        children: [
          {
            id: '5a',
            type: 'image',
            content: 'https://via.placeholder.com/300x200?text=Left+Image',
            imageUrl: 'https://via.placeholder.com/300x200?text=Left+Image',
            imageAlt: 'Left Image',
            imageCaption: 'Left column image',
            alignment: 'center',
            fontSize: 'normal',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            width: 'full',
            margin: 'tight',
            isSelected: false
          },
          {
            id: '5b',
            type: 'paragraph',
            content: 'Right column text - This demonstrates a multi-column layout with image on the left and text on the right.',
            alignment: 'left',
            fontSize: 'normal',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            width: 'full',
            margin: 'tight',
            isSelected: false
          }
        ]
      }
    ];

    setContentBlocks(testBlocks);
    setArticle({
      slug: '',
      titles: { en: 'Test Article - All Components' },
      contents: { en: 'This is a test article to demonstrate all available components.' },
      excerpts: { en: 'A comprehensive test article showcasing all editor components.' },
      authors_multilingual: { en: 'Test Author' },
      categories_multilingual: { en: 'Technical' },
      read_time: 5,
      is_published: true,
      featured_image: '',
      content_blocks: testBlocks
    });
    setSelectedTemplate('technical');
    setSelectedTags(availableTags.filter(t => ['Technical', 'Test', 'Components'].includes(t.name)));
    setIsEditing(false);
    setArticleId(null);
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

  if (isEditing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <Button onClick={() => setIsEditing(false)} variant="outline">
            Back to Articles
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

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setIsEditing(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Articles Management</h1>
        <div className="space-x-2">
          <Button onClick={createTestArticle} variant="outline">
            Create Test Article
          </Button>
          <Button onClick={() => navigate('/admin/articles/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Article
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading articles...</div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {article.titles?.en || 'Untitled'}
                      {article.is_published && (
                        <Badge variant="secondary">Published</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {article.excerpts?.en || 'No excerpt available'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Author: {article.authors_multilingual?.en || 'Unknown'}</span>
                      <span>Category: {article.categories_multilingual?.en || 'Uncategorized'}</span>
                      <span>Read time: {article.read_time || 5} min</span>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {article.tags.map(tag => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => article.id && navigate(`/admin/articles?edit=${article.id}`)}
                      disabled={!article.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/articles/${article.slug}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => article.id && handleDelete(article.id)}
                      disabled={!article.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          
          {articles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No articles found. Create your first article!
            </div>
          )}
        </div>
      )}
    </div>
  );
}