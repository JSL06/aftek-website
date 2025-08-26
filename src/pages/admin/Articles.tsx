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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { ContentLanguage, contentLanguages } from '@/components/admin/ContentLanguageSelector';
import InlineArticleEditor from '@/components/InlineArticleEditor';
import { ContentBlock } from '@/components/InlineArticleEditor';
import articleService, { Article, ArticleTag } from '@/services/articleService';
import { productService, UnifiedProduct } from '@/services/productService';
import { Plus, Edit, Trash2, Eye, Upload, Image as ImageIcon, Globe, Type, FileText, User, Check, Link, ExternalLink, Package, X, Calendar, Clock, Tag as TagIcon } from 'lucide-react';

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
  const { language: adminLanguage, setLanguage } = useAdminLanguage();

  // Content editing language state (separate from admin interface language)
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('en');

  // Helper function to get language field suffix (identical to Thai pattern)
  const getLanguageFieldSuffix = (language: string): string => {
    switch (language) {
      case 'en': return 'en';
      case 'zh-Hant': return 'zh_hant';

      case 'ja': return 'ja';
      case 'ko': return 'ko';
      case 'th': return 'th';
      case 'vi': return 'vi';
      default: return 'en';
    }
  };

  // Helper function to get content blocks field name (identical to Thai pattern)
  const getContentBlocksField = (language: string): keyof Article => {
    return `content_blocks_${getLanguageFieldSuffix(language)}` as keyof Article;
  };

  // Helper function to get category field name (identical to Thai pattern)
  const getCategoryField = (language: string): keyof Article => {
    return `category_${getLanguageFieldSuffix(language)}` as keyof Article;
  };

  // Helper function to get title field name (identical to Thai pattern)
  const getTitleField = (language: string): keyof Article => {
    return `title_${getLanguageFieldSuffix(language)}` as keyof Article;
  };

  // Helper function to get excerpt field name (identical to Thai pattern)
  const getExcerptField = (language: string): keyof Article => {
    return `excerpt_${getLanguageFieldSuffix(language)}` as keyof Article;
  };

  // Helper function to get author field name (identical to Thai pattern)
  const getAuthorField = (language: string): keyof Article => {
    return `author_${getLanguageFieldSuffix(language)}` as keyof Article;
  };

  // Helper function to get default content for a block based on language
  const getDefaultContentForBlock = (block: ContentBlock, languageField: string): string => {
    const language = languageField.replace('content_blocks_', '');
    
    // Default content based on block type and language
    switch (block.type) {
      case 'heading':
        return language === 'en' ? 'New Heading' :
               language === 'zh-Hant' ? '新標題' :
               language === 'zh-Hant' ? '新標題' :
               language === 'ja' ? '新しい見出し' :
               language === 'ko' ? '새 제목' :
               language === 'th' ? 'หัวข้อใหม่' :
               language === 'vi' ? 'Tiêu đề mới' : 'New Heading';
      
      case 'paragraph':
        return language === 'en' ? 'Enter your content here...' :
               language === 'zh-Hant' ? '在此輸入您的內容...' :
               language === 'zh-Hant' ? '在此輸入您的內容...' :
               language === 'ja' ? 'ここにコンテンツを入力してください...' :
               language === 'ko' ? '여기에 내용을 입력하세요...' :
               language === 'th' ? 'ใส่เนื้อหาของคุณที่นี่...' :
               language === 'vi' ? 'Nhập nội dung của bạn tại đây...' : 'Enter your content here...';
      
      case 'text':
        return language === 'en' ? 'Enter text here...' :
               language === 'zh-Hant' ? '在此輸入文字...' :
               language === 'zh-Hant' ? '在此輸入文字...' :
               language === 'ja' ? 'ここにテキストを入力してください...' :
               language === 'ko' ? '여기에 텍스트를 입력하세요...' :
               language === 'th' ? 'ใส่ข้อความที่นี่...' :
               language === 'vi' ? 'Nhập văn bản tại đây...' : 'Enter text here...';
      
      case 'list':
        return language === 'en' ? '• List item 1\n• List item 2\n• List item 3' :
               language === 'zh-Hant' ? '• 列表項目 1\n• 列表項目 2\n• 列表項目 3' :
               language === 'zh-Hant' ? '• 列表項目 1\n• 列表項目 2\n• 列表項目 3' :
               language === 'ja' ? '• リスト項目 1\n• リスト項目 2\n• リスト項目 3' :
               language === 'ko' ? '• 목록 항목 1\n• 목록 항목 2\n• 목록 항목 3' :
               language === 'th' ? '• รายการ 1\n• รายการ 2\n• รายการ 3' :
               language === 'vi' ? '• Mục danh sách 1\n• Mục danh sách 2\n• Mục danh sách 3' : '• List item 1\n• List item 2\n• List item 3';
      
      case 'image':
        return language === 'en' ? 'Image description' :
               language === 'zh-Hant' ? '圖片描述' :
               language === 'zh-Hant' ? '圖片描述' :
               language === 'ja' ? '画像の説明' :
               language === 'ko' ? '이미지 설명' :
               language === 'th' ? 'คำอธิบายภาพ' :
               language === 'vi' ? 'Mô tả hình ảnh' : 'Image description';
      
      case 'row':
        return language === 'en' ? 'Row content' :
               language === 'zh-Hant' ? '行內容' :
               language === 'zh-Hant' ? '行內容' :
               language === 'ja' ? '行のコンテンツ' :
               language === 'ko' ? '행 내용' :
               language === 'th' ? 'เนื้อหาของแถว' :
               language === 'vi' ? 'Nội dung hàng' : 'Row content';
      
      default:
        return language === 'en' ? 'Content' :
               language === 'zh-Hant' ? '內容' :
               language === 'zh-Hant' ? '內容' :
               language === 'ja' ? 'コンテンツ' :
               language === 'ko' ? '내용' :
               language === 'th' ? 'เนื้อหา' :
               language === 'vi' ? 'Nội dung' : 'Content';
    }
  };
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<UnifiedProduct[]>([]);
  
  // Article form state
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
    content_blocks_en: [],
    content_blocks_zh_hant: [],
    content_blocks_ja: [],
    content_blocks_ko: [],
    content_blocks_th: [],
    content_blocks_vi: []
  });
  
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');
  // Remove duplicate language state - use only adminLanguage from context
  
  // Related content state
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
  const [relatedLinks, setRelatedLinks] = useState<Array<{ title: string; url: string; description?: string }>>([]);
  const [customButtons, setCustomButtons] = useState<Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>>([]);
  
  // New related content state
  const [newRelatedProduct, setNewRelatedProduct] = useState('');
  const [newRelatedLink, setNewRelatedLink] = useState({ title: '', url: '', description: '' });
  const [newCustomButton, setNewCustomButton] = useState({ text: '', url: '', variant: 'default' as const });

  // Filtered articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      (article.title_en && article.title_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.excerpt_en && article.excerpt_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.author_en && article.author_en.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || 
      (article.category_en && article.category_en === filterCategory);
    
    const matchesPublished = filterPublished === 'all' || 
      (filterPublished === 'published' && article.is_published) ||
      (filterPublished === 'draft' && !article.is_published);
    
    return matchesSearch && matchesCategory && matchesPublished;
  });

  // Load available tags and products
  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        // Load available tags (you might want to create a tags service)
        setAvailableTags(['Technical', 'Industry', 'Innovation', 'Sustainability', 'Quality', 'Safety', 'Performance', 'Research', 'Development', 'Case Study']);
        
        // Load available products
        const products = await productService.getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading available data:', error);
      }
    };
    
    loadAvailableData();
  }, []);

  // Load articles when component mounts
  useEffect(() => {
    loadArticles();
  }, []);

  // Check if we're in edit mode
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditing(true);
      setArticleId(editId);
      loadArticle(editId);
    } else {
      setIsEditing(false);
      setArticleId(null);
    }
  }, [searchParams]);

  // Update content blocks when content language changes
  useEffect(() => {
    if (isEditing && article.id) {
      // Get content blocks for the current content language (identical to Thai pattern)
      const contentBlocksField = getContentBlocksField(contentLanguage);
      
      const languageContentBlocks = article[contentBlocksField] as ContentBlock[] || [];
      console.log(`Loading content blocks from ${contentBlocksField} for language ${contentLanguage}:`, languageContentBlocks);
      
      setContentBlocks(languageContentBlocks);
    }
  }, [contentLanguage, isEditing, article.id, article]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await articleService.loadArticlesFromDatabase();
      if (data) {
        setArticles(data);
      }
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

  const loadArticle = async (id: string) => {
    try {
      const data = await articleService.getArticleById(id);
      if (data) {
        console.log('Loading article:', data);
        console.log('Admin language:', adminLanguage);
        
        setArticle(data);
        
        // Get content blocks for current content language (identical to Thai pattern)
        const contentBlocksField = getContentBlocksField(contentLanguage);
        
        const contentBlocks = data[contentBlocksField] as ContentBlock[] || [];
        console.log(`Loading content blocks from ${contentBlocksField}:`, contentBlocks);
        
        setContentBlocks(contentBlocks);
        
        setSelectedTags(data.tags?.map(tag => tag.name) || []);
        setUploadedImages(data.images?.map(img => img.image_url) || []);
        
        // Load new related content fields
        setRelatedProducts(data.related_products || []);
        setRelatedLinks(data.related_links || []);
        setCustomButtons(data.custom_buttons || []);
        
        // Set category from current content language (identical to Thai pattern)
        const categoryField = getCategoryField(contentLanguage);
        const category = data[categoryField] as string || 'General';
        setSelectedCategory(category);
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

  const handleEditorLanguageChange = (language: string) => {
    console.log(`Content language changing from ${contentLanguage} to ${language}`);
    console.log(`Current content blocks:`, contentBlocks);
    
    // Save current content blocks to the previous content language
    if (contentLanguage !== language && contentBlocks.length > 0) {
      const previousLanguageField = getContentBlocksField(contentLanguage);
      
      console.log(`Saving content blocks to ${previousLanguageField}:`, contentBlocks);
      
      // Update local state
      setArticle(prev => ({
        ...prev,
        [previousLanguageField]: contentBlocks
      }));
      
      // Auto-save to database if editing existing article
      if (isEditing && article.id) {
        autoSaveContentBlocksForLanguage(contentLanguage, contentBlocks);
      }
    }
    
    // Update the content language state
    setContentLanguage(language as ContentLanguage);
    
    // Load content blocks for the new language
    // This will automatically sync the structure if needed
    if (isEditing && article.id) {
      const newLanguageField = getContentBlocksField(language);
      const newLanguageBlocks = article[newLanguageField] as ContentBlock[] || [];
      
      // If the new language doesn't have the same structure, sync it
      if (newLanguageBlocks.length !== contentBlocks.length || 
          !newLanguageBlocks.every((block, index) => block.id === contentBlocks[index]?.id)) {
        
        // Sync the structure by creating blocks with the same IDs but preserving content where possible
        const syncedBlocks = contentBlocks.map((currentBlock, index) => {
          const existingBlock = newLanguageBlocks[index];
          
          if (existingBlock && existingBlock.id === currentBlock.id) {
            // Keep existing content but update structure
            return {
              ...currentBlock,
              content: existingBlock.content || currentBlock.content
            };
      } else {
            // New block - use default content for this language
            return {
              ...currentBlock,
              content: getDefaultContentForBlock(currentBlock, newLanguageField)
            };
          }
        });
        
        // Update the article state with synced blocks
        setArticle(prev => ({
          ...prev,
          [newLanguageField]: syncedBlocks
        }));
        
        // Set the content blocks to the synced version
        setContentBlocks(syncedBlocks);
        
        // Auto-save the synced blocks to database
        if (isEditing && article.id) {
          autoSaveContentBlocksForLanguage(language, syncedBlocks);
        }
      } else {
        // Structure is already the same, just load the content
        setContentBlocks(newLanguageBlocks);
      }
    }
  };

  // Auto-save content blocks for a specific language
  const autoSaveContentBlocksForLanguage = async (language: string, blocks: ContentBlock[]) => {
    try {
      const contentBlocksField = getContentBlocksField(language);
      const updateData = {
        [contentBlocksField]: blocks
      };
      
      console.log(`Auto-saving content blocks for ${language}:`, updateData);
      
      // Update the article in the database
      const updatedArticle = await articleService.updateArticle(article.id!, updateData);
      
      if (updatedArticle) {
        console.log(`Content blocks for ${language} auto-saved successfully`);
      }
    } catch (error) {
      console.error(`Error auto-saving content blocks for ${language}:`, error);
      // Don't show error toast for auto-save, just log it
    }
  };

  // Get current language information for display
  const getCurrentLanguageInfo = () => {
    const currentLang = contentLanguages.find(lang => lang.code === contentLanguage);
    return currentLang || contentLanguages[0];
  };

  // Unified language change handler for both content and editor
  const handleUnifiedLanguageChange = (language: string) => {
    console.log(`Unified language changing from ${contentLanguage} to ${language}`);
    
    // Save current content blocks to the previous content language
    if (contentLanguage !== language && contentBlocks.length > 0) {
      const previousLanguageField = getContentBlocksField(contentLanguage);
      
      console.log(`Saving content blocks to ${previousLanguageField}:`, contentBlocks);
      
      // Update local state
      setArticle(prev => ({
        ...prev,
        [previousLanguageField]: contentBlocks
      }));
      
      // Auto-save to database if editing existing article
      if (isEditing && article.id) {
        autoSaveContentBlocksForLanguage(contentLanguage, contentBlocks);
      }
    }
    
    // Update the content language state
    setContentLanguage(language as ContentLanguage);
    
    // Load content blocks for the new language
    if (isEditing && article.id) {
      const newLanguageField = getContentBlocksField(language);
      const newLanguageBlocks = article[newLanguageField] as ContentBlock[] || [];
      
      // If the new language doesn't have the same structure, sync it
      if (newLanguageBlocks.length !== contentBlocks.length || 
          !newLanguageBlocks.every((block, index) => block.id === contentBlocks[index]?.id)) {
        
        // Sync the structure by creating blocks with the same IDs but preserving content where possible
        const syncedBlocks = contentBlocks.map((currentBlock, index) => {
          const existingBlock = newLanguageBlocks[index];
          
          if (existingBlock && existingBlock.id === currentBlock.id) {
            // Keep existing content but update structure
            return {
              ...currentBlock,
              content: existingBlock.content || currentBlock.content
            };
          } else {
            // New block - use default content for this language
            return {
              ...currentBlock,
              content: getDefaultContentForBlock(currentBlock, newLanguageField)
            };
          }
        });
        
        // Update the article state with synced blocks
        setArticle(prev => ({
          ...prev,
          [newLanguageField]: syncedBlocks
        }));
        
        // Set the content blocks to the synced version
        setContentBlocks(syncedBlocks);
        
        // Auto-save the synced blocks to database
        if (isEditing && article.id) {
          autoSaveContentBlocksForLanguage(language, syncedBlocks);
        }
      } else {
        // Structure is already the same, just load the content
        setContentBlocks(newLanguageBlocks);
      }
    }
  };

  const handleContentChange = (newContentBlocks: ContentBlock[]) => {
    console.log(`Content changed for language ${contentLanguage}:`, newContentBlocks);
    
    setContentBlocks(newContentBlocks);
    
    // Update the article state with content blocks for the current content language
    const contentBlocksField = getContentBlocksField(contentLanguage);
    
    console.log(`Saving content blocks to ${contentBlocksField}:`, newContentBlocks);
    
    // Ensure structural consistency across all languages
    // If this is the first time setting content blocks, or if the structure has changed,
    // we need to sync the structure to all other languages
    setArticle(prev => {
      const updatedArticle = { ...prev, [contentBlocksField]: newContentBlocks };
      
      // Get all language fields
      const allLanguageFields = ['en', 'zh-Hant', 'ja', 'ko', 'th', 'vi'].map(lang => 
        getContentBlocksField(lang)
      );
      
      // For each language, ensure it has the same block structure
      allLanguageFields.forEach(field => {
        if (field !== contentBlocksField) {
          const existingBlocks = prev[field] as ContentBlock[] || [];
          
          // If the existing blocks don't match the new structure, update them
          if (existingBlocks.length !== newContentBlocks.length || 
              !existingBlocks.every((block, index) => block.id === newContentBlocks[index]?.id)) {
            
            // Create new blocks with the same structure but preserve existing content where possible
            const syncedBlocks = newContentBlocks.map((newBlock, index) => {
              const existingBlock = existingBlocks[index];
              
              if (existingBlock && existingBlock.id === newBlock.id) {
                // Keep existing content but update structure
                return {
                  ...newBlock,
                  content: existingBlock.content || newBlock.content
                };
              } else {
                // New block - use default content
                return {
                  ...newBlock,
                  content: getDefaultContentForBlock(newBlock, field as string)
                };
              }
            });
            
            (updatedArticle as any)[field] = syncedBlocks;
          }
        }
      });
      
      return updatedArticle;
    });

    // Auto-save content blocks to database if editing an existing article
    if (isEditing && article.id && newContentBlocks.length > 0) {
      autoSaveContentBlocks(newContentBlocks);
    }
  };

  // Auto-save content blocks to prevent data loss
  const autoSaveContentBlocks = async (blocks: ContentBlock[]) => {
    try {
      const contentBlocksField = getContentBlocksField(contentLanguage);
      const updateData = {
        [contentBlocksField]: blocks
      };
      
      console.log(`Auto-saving content blocks for ${contentLanguage}:`, updateData);
      
      // Update the article in the database
      const updatedArticle = await articleService.updateArticle(article.id!, updateData);
      
      if (updatedArticle) {
        console.log('Content blocks auto-saved successfully');
        // Update local state to ensure consistency
        setArticle(prev => ({
      ...prev,
          [contentBlocksField]: blocks
        }));
      }
    } catch (error) {
      console.error('Error auto-saving content blocks:', error);
      // Don't show error toast for auto-save, just log it
    }
  };

  const updateTranslation = (field: string, language: string, value: string) => {
    const languageSuffix = getLanguageFieldSuffix(language);
    
    const fieldName = `${field}_${languageSuffix}` as keyof Article;
    
    setArticle(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // For now, we'll use a placeholder URL. In production, you'd upload to Supabase
      const imageUrl = URL.createObjectURL(file);
      setArticle(prev => ({ ...prev, featured_image: imageUrl }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const removeFeaturedImage = () => {
    setArticle(prev => ({ ...prev, featured_image: '' }));
  };

  const addRelatedProduct = () => {
    if (newRelatedProduct.trim()) {
      setRelatedProducts(prev => [...prev, newRelatedProduct.trim()]);
      setNewRelatedProduct('');
    }
  };

  const removeRelatedProduct = (index: number) => {
    setRelatedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const addRelatedLink = () => {
    if (newRelatedLink.title.trim() && newRelatedLink.url.trim()) {
      setRelatedLinks(prev => [...prev, { ...newRelatedLink }]);
      setNewRelatedLink({ title: '', url: '', description: '' });
    }
  };

  const removeRelatedLink = (index: number) => {
    setRelatedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomButton = () => {
    if (newCustomButton.text.trim() && newCustomButton.url.trim()) {
      setCustomButtons(prev => [...prev, { ...newCustomButton }]);
      setNewCustomButton({ text: '', url: '', variant: 'default' });
    }
  };

  const removeCustomButton = (index: number) => {
    setCustomButtons(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!article.title_en) {
      toast({
        title: "Error",
        description: "Article title is required",
        variant: "destructive"
      });
      return;
    }

    // Save current content blocks to the current content language before saving
    if (contentBlocks.length > 0) {
      const contentBlocksField = getContentBlocksField(contentLanguage);
      
      console.log(`Saving final content blocks to ${contentBlocksField}:`, contentBlocks);
      
      // Update the article state with current content blocks
      setArticle(prev => ({
        ...prev,
        [contentBlocksField]: contentBlocks
      }));
    }

    // Wait for the state update to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    console.log('Saving article with all language content blocks:', {
              content_blocks_en: article.content_blocks_en,
        content_blocks_zh_hant: article.content_blocks_zh_hant,
        content_blocks_ja: article.content_blocks_ja,
        content_blocks_ko: article.content_blocks_ko,
        content_blocks_th: article.content_blocks_th,
        content_blocks_vi: article.content_blocks_vi
    });

    setIsSaving(true);
    try {
      // Generate slug from English title
      const slug = articleService.generateSlug(article.title_en);
      
      // Prepare the complete article data with all language content blocks
      const articleData = {
        ...article,
        slug,
        related_products: relatedProducts,
        related_links: relatedLinks,
        custom_buttons: customButtons,
        // Ensure all language content blocks are included
        content_blocks_en: article.content_blocks_en || [],
        content_blocks_zh_hant: article.content_blocks_zh_hant || [],
        content_blocks_ja: article.content_blocks_ja || [],
        content_blocks_ko: article.content_blocks_ko || [],
        content_blocks_th: article.content_blocks_th || [],
        content_blocks_vi: article.content_blocks_vi || []
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
            content_blocks_en: [],
            content_blocks_zh_hant: [],
            content_blocks_ja: [],
            content_blocks_ko: [],
            content_blocks_th: [],
            content_blocks_vi: []
          });
          setContentBlocks([]);
          setSelectedTags([]);
          setUploadedImages([]);
          setSelectedCategory('General');
          setRelatedProducts([]);
          setRelatedLinks([]);
          setCustomButtons([]);
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

  const createTestArticle = () => {
    const testBlocks: ContentBlock[] = [
      {
        id: '1',
        type: 'heading',
        content: 'Test Article - All Components',
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
        content: 'This is a comprehensive test article showcasing all editor components and features.',
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
        imageCaption: 'This is a test image caption',
        alignment: 'center',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false
      },
      {
        id: '4',
        type: 'list',
        content: 'Key Features:\n• Multilingual support\n• Rich text editing\n• Image management\n• Related content\n• Custom buttons',
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
      title_en: 'Test Article - All Components',
      title_zh_hant: '',

      title_ja: '',
      title_ko: '',
      title_th: '',
      title_vi: '',
      excerpt_en: 'A comprehensive test article showcasing all editor components.',
      excerpt_zh_hant: '',

      excerpt_ja: '',
      excerpt_ko: '',
      excerpt_th: '',
      excerpt_vi: '',
      author_en: 'Test Author',
      author_zh_hant: '',

      author_ja: '',
      author_ko: '',
      author_th: '',
      author_vi: '',
      category_en: 'Technical',
      category_zh_hant: '',

      category_ja: '',
      category_ko: '',
      category_th: '',
      category_vi: '',
      read_time: 5,
      is_published: true,
      featured_image: '',
      content_blocks_en: testBlocks,
      content_blocks_zh_hant: [],

      content_blocks_ja: [],
      content_blocks_ko: [],
      content_blocks_th: [],
      content_blocks_vi: []
    });
    setSelectedCategory('Technical');
    setSelectedTags(['Technical', 'Test', 'Components']);
    setRelatedProducts(['Product 1', 'Product 2']);
    setRelatedLinks([
      { title: 'External Resource', url: 'https://example.com', description: 'A helpful external link' }
    ]);
    setCustomButtons([
      { text: 'Learn More', url: 'https://example.com', variant: 'default' }
    ]);
  };

  // If editing, show the editor
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Edit Article</h1>
            <div className="flex space-x-2">
              <Button onClick={() => setSearchParams({})} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Article'}
            </Button>
          </div>
              </div>

          {/* Main Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Article Content Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Image */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Featured Image</h2>
                <div className="space-y-4">
                  {article.featured_image ? (
                    <div className="relative">
                      <img 
                        src={article.featured_image} 
                        alt="Featured" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        onClick={removeFeaturedImage}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload featured image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <Label htmlFor="featured-image-upload" className="cursor-pointer">
                        <Button variant="outline">Choose Image</Button>
                      </Label>
                    </div>
                  )}
                  {!article.featured_image && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="featured-image-upload"
                    />
                  )}
                </div>
              </div>

                             {/* Unified Multilingual Content & Editor */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Multilingual Content & Editor</h2>
                </div>
                
                {/* Language Tabs at the top */}
                <div className="mb-6">
                  <Tabs value={contentLanguage} onValueChange={handleUnifiedLanguageChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                      {contentLanguages.map(lang => (
                        <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Language-specific content editing */}
                <div className="space-y-4 mb-8">
                  {/* Title */}
                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      <Type className="h-4 w-4 inline mr-2" />
                      Article Title ({getCurrentLanguageInfo().nativeName})
                    </Label>
                    <Input
                      value={article[getTitleField(contentLanguage)] as string || ''}
                      onChange={(e) => updateTranslation('title', contentLanguage, e.target.value)}
                      placeholder={`Enter title in ${getCurrentLanguageInfo().nativeName}`}
                      className="h-12"
                    />
                  </div>
                  
                  {/* Excerpt */}
                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Article Excerpt ({getCurrentLanguageInfo().nativeName})
                    </Label>
                    <Textarea
                      value={article[getExcerptField(contentLanguage)] as string || ''}
                      onChange={(e) => updateTranslation('excerpt', contentLanguage, e.target.value)}
                      placeholder={`Enter excerpt in ${getCurrentLanguageInfo().nativeName}`}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  {/* Author */}
                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      <User className="h-4 w-4 inline mr-2" />
                      Author ({getCurrentLanguageInfo().nativeName})
                    </Label>
                    <Input
                      value={article[getAuthorField(contentLanguage)] as string || ''}
                      onChange={(e) => updateTranslation('author', contentLanguage, e.target.value)}
                      placeholder={`Enter author name in ${getCurrentLanguageInfo().nativeName}`}
                      className="h-12"
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      <TagIcon className="h-4 w-4 inline mr-2" />
                      Category ({getCurrentLanguageInfo().nativeName})
                    </Label>
                    <Input
                      value={article[getCategoryField(contentLanguage)] as string || ''}
                      onChange={(e) => updateTranslation('category', contentLanguage, e.target.value)}
                      placeholder={`Enter category in ${getCurrentLanguageInfo().nativeName}`}
                      className="h-12"
                    />
                </div>
              </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Article Content Editor */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Content Blocks</h3>
                    <span className="text-sm text-muted-foreground">
                      Currently editing: {getCurrentLanguageInfo().nativeName} ({getCurrentLanguageInfo().flag})
                    </span>
                  </div>
                  <InlineArticleEditor
                    key={`${contentLanguage}-${article.id || 'new'}`}
                    initialContent={contentBlocks}
                    onContentChange={handleContentChange}
                    onLanguageChange={handleUnifiedLanguageChange}
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
        </div>
      </div>

              {/* Related Products */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Related Products</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={newRelatedProduct} onValueChange={setNewRelatedProduct}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addRelatedProduct} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {relatedProducts.length > 0 && (
                    <div className="space-y-2">
                      {relatedProducts.map((productId, index) => {
                        const product = availableProducts.find(p => p.id === productId);
  return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{product?.name || productId}</span>
                            <Button
                              onClick={() => removeRelatedProduct(index)}
                              variant="ghost"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
        </div>
      </div>

              {/* Related Links */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Related Links</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Link title"
                      value={newRelatedLink.title}
                      onChange={(e) => setNewRelatedLink(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Input
                      placeholder="URL"
                      value={newRelatedLink.url}
                      onChange={(e) => setNewRelatedLink(prev => ({ ...prev, url: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newRelatedLink.description}
                      onChange={(e) => setNewRelatedLink(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                    <Button onClick={addRelatedLink} size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
            </div>
                  
                  {relatedLinks.length > 0 && (
                    <div className="space-y-2">
                      {relatedLinks.map((link, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{link.title}</span>
                <Button
                              onClick={() => removeRelatedLink(index)}
                              variant="ghost"
                  size="sm"
                >
                              <X className="h-4 w-4" />
                </Button>
            </div>
                          <p className="text-xs text-gray-600">{link.url}</p>
                          {link.description && (
                            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                          )}
          </div>
              ))}
            </div>
                  )}
          </div>
        </div>

              {/* Custom Buttons */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Custom Buttons</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Button text"
                      value={newCustomButton.text}
                      onChange={(e) => setNewCustomButton(prev => ({ ...prev, text: e.target.value }))}
                    />
                    <Input
                      placeholder="URL"
                      value={newCustomButton.url}
                      onChange={(e) => setNewCustomButton(prev => ({ ...prev, url: e.target.value }))}
                    />
                    <Select value={newCustomButton.variant} onValueChange={(value: any) => setNewCustomButton(prev => ({ ...prev, variant: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="destructive">Destructive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addCustomButton} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
                      Add Button
          </Button>
      </div>

                  {customButtons.length > 0 && (
                    <div className="space-y-2">
                      {customButtons.map((button, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{button.text}</span>
                            <Button
                              onClick={() => removeCustomButton(index)}
                              variant="ghost"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
          </div>
                          <p className="text-xs text-gray-600">{button.url}</p>
                          <Badge variant="outline" className="text-xs">{button.variant}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search Articles</Label>
            <Input
              id="search"
              placeholder="Search by title, excerpt, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {projectCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          
          {/* Published Status Filter */}
          <div>
            <Label htmlFor="published-filter" className="text-sm font-medium">Published Status</Label>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Articles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="draft">Draft Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading articles...</div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {article.title_en || 'Untitled'}
                      {article.is_published && (
                        <Badge variant="secondary">Published</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {article.excerpt_en || 'No excerpt available'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Author: {article.author_en || 'Unknown'}</span>
                      <span>Category: {article.category_en || 'Uncategorized'}</span>
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
          </div>
        )}
    </div>
  );
}