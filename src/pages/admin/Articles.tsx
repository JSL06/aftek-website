import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import FeaturesChecklist from '@/components/FeaturesChecklist';
import { Plus, Edit, Trash2, Eye, Upload, Image as ImageIcon, Globe, Type, FileText, User, Check, Link, ExternalLink, Package, X } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

// Project categories (same as projects page)
const projectCategories = [
  'Infrastructure', 'Industrial', 'High-Tech', 'Commercial', 'Residential', 
  'Healthcare', 'Education', 'Transportation', 'Energy', 'Water Treatment', 
  'Manufacturing', 'General'
];

export default function AdminArticles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { language: adminLanguage } = useAdminLanguage();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
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
  
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Track current tab language
  
  // Related content state
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
  const [relatedLinks, setRelatedLinks] = useState<Array<{ title: string; url: string; description?: string }>>([]);
  const [customButtons, setCustomButtons] = useState<Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>>([]);
  


  useEffect(() => {
    loadArticles();
    loadTags();
  }, []);

  // Watch for URL changes to handle edit mode
  useEffect(() => {
    const editId = searchParams.get('edit');
    
    if (editId) {
      setArticleId(editId);
      setIsEditing(true);
      loadArticle(editId);
    } else {
      setIsEditing(false);
      setArticleId(null);
    }
  }, [searchParams]);

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
      // Convert ArticleTag objects to strings for FeaturesChecklist
      setAvailableTags(tags.map(tag => tag.name));
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
        setSelectedTags(data.tags?.map(tag => tag.name) || []);
        setUploadedImages(data.images?.map(img => img.image_url) || []);
        
        // Load new related content fields
        setRelatedProducts(data.related_products || []);
        setRelatedLinks(data.related_links || []);
        setCustomButtons(data.custom_buttons || []);
        
        // Set category from multilingual data
        const category = data.categories_multilingual?.en || 'General';
        setSelectedCategory(category);
        
        // Load translations for all languages
        const titles = data.titles || {};
        const contents = data.contents || {};
        const excerpts = data.excerpts || {};
        const authors = data.authors_multilingual || {};
        
        // Update article state with translations
        setArticle(prev => ({
          ...prev,
          titles: titles,
          contents: contents,
          excerpts: excerpts,
          authors_multilingual: authors,
          categories_multilingual: data.categories_multilingual || {}
        }));
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
          en: selectedCategory
        },
        related_products: relatedProducts,
        related_links: relatedLinks,
        custom_buttons: customButtons
      };

      let savedArticle: Article | null;
      
      if (isEditing && article.id) {
        savedArticle = await articleService.updateArticle(article.id, articleData);
        
        // Update tags
        if (savedArticle) {
          await articleService.updateArticleTags(savedArticle.id, selectedTags);
        }
      } else {
        savedArticle = await articleService.addArticle(articleData);
        
        // Update tags and save images if new article
        if (savedArticle) {
          await articleService.updateArticleTags(savedArticle.id, selectedTags);
          
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
        
        if (isEditing) {
          // Go back to articles list after editing
          setSearchParams({});
        } else {
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
          setSelectedCategory('General');
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
    setSelectedCategory('Technical');
    setSelectedTags(['Technical', 'Test', 'Components']);
    
    // Set test data for new related content fields
    setRelatedProducts(['Test Product A', 'Test Product B', 'Sample Product C']);
    setRelatedLinks([
      { title: 'External Documentation', url: 'https://example.com/docs', description: 'Comprehensive documentation for this topic' },
      { title: 'Related Research', url: 'https://example.com/research', description: 'Academic research and studies' }
    ]);
    setCustomButtons([
      { text: 'Download PDF', url: 'https://example.com/download', variant: 'default' },
      { text: 'View Demo', url: 'https://example.com/demo', variant: 'outline' },
      { text: 'Contact Sales', url: 'https://example.com/contact', variant: 'secondary' }
    ]);
    
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
        // Set as featured image
        setArticle(prev => ({
          ...prev,
          featured_image: imageUrl
        }));
        
        // Also add to uploaded images array
        setUploadedImages(prev => [...prev, imageUrl]);
        
        toast({
          title: "Success",
          description: "Featured image uploaded successfully"
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



  if (isEditing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <Button onClick={() => setSearchParams({})} variant="outline">
            Back to Articles
          </Button>
        </div>

        {/* Main Content Section - Two Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Language Content */}
          <div className="space-y-6">
            {/* Language Picker */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Multilingual Content
              </h2>
              <Tabs defaultValue="en" className="w-full" onValueChange={setCurrentLanguage}>
                <TabsList className="grid w-full grid-cols-7 h-14 mb-6">
                  {languages.map(lang => (
                    <TabsTrigger key={lang.code} value={lang.code} className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.nativeName} - {lang.name}
                      </h3>
                      <div className="space-y-6">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            <Type className="h-4 w-4 inline mr-2" />
                            Article Title ({lang.nativeName})
                          </label>
                          <Input
                            value={article.titles?.[lang.code] || ''}
                            onChange={(e) => updateTranslation('titles', lang.code, e.target.value)}
                            placeholder={`Enter title in ${lang.nativeName}`}
                            className="text-lg font-medium h-12"
                          />
                        </div>
                        
                        {/* Author */}
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            <User className="h-4 w-4 inline mr-2" />
                            Author ({lang.nativeName})
                          </label>
                          <Input
                            value={article.authors_multilingual?.[lang.code] || ''}
                            onChange={(e) => updateTranslation('authors_multilingual', lang.code, e.target.value)}
                            placeholder={`Enter author in ${lang.nativeName}`}
                            className="h-12"
                          />
                        </div>
                        
                        {/* Excerpt */}
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Article Excerpt ({lang.nativeName})
                          </label>
                          <Input
                            value={article.excerpts?.[lang.code] || ''}
                            onChange={(e) => updateTranslation('excerpts', lang.code, e.target.value)}
                            placeholder={`Enter excerpt in ${lang.nativeName}`}
                            className="h-12"
                          />
                        </div>
                        
                        {/* Content */}
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Article Content ({lang.nativeName})
                          </label>
                          <Input
                            value={article.contents?.[lang.code] || ''}
                            onChange={(e) => updateTranslation('contents', lang.code, e.target.value)}
                            placeholder={`Enter content in ${lang.nativeName}`}
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          {/* Right Column - Settings & Configuration */}
          <div className="space-y-6">
            {/* Article Settings */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Article Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-3 block">Article Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="read-time" className="text-sm font-medium mb-3 block">Read Time (minutes)</Label>
                  <Input
                    id="read-time"
                    type="number"
                    value={article.read_time || 5}
                    onChange={(e) => setArticle(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                    min="1"
                    max="60"
                    className="h-12"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    id="published"
                    checked={article.is_published || false}
                    onCheckedChange={(checked) => setArticle(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="published" className="text-sm font-medium">Published</Label>
                </div>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Article Tags</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className="h-8"
                    >
                      {tag}
                      {selectedTags.includes(tag) && <Check className="w-3 h-3 ml-1" />}
                    </Button>
                  ))}
                </div>
                                                    <div className="text-sm text-gray-500">
                    Selected: {selectedTags.length} tags
                  </div>
                </div>
              </div>



            {/* Featured Image */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Featured Image</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-sm font-medium mb-3 block">Upload Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="h-12"
                  />
                </div>
                
                {article.featured_image && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Current Featured Image</Label>
                    <div className="relative">
                      <img 
                        src={article.featured_image} 
                        alt="Featured" 
                        className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => {
                          setArticle(prev => ({ ...prev, featured_image: '' }));
                          toast({
                            title: "Success",
                            description: "Featured image removed"
                          });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Editor - Full Width at Bottom */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Article Content Editor</h2>
          
          {/* Related Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          </div>

          <div className="w-full">
                            <InlineArticleEditor
                  initialContent={contentBlocks}
                  onContentChange={setContentBlocks}
                  onSave={handleSave}
                  relatedProducts={relatedProducts}
                  onRelatedProductsChange={setRelatedProducts}
                  relatedLinks={relatedLinks}
                  onRelatedLinksChange={setRelatedLinks}
                  customButtons={customButtons}
                  onCustomButtonsChange={setCustomButtons}
                />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setSearchParams({})} variant="outline">
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
                      onClick={() => article.id && setSearchParams({ edit: article.id })}
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