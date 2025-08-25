import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '@/stores/adminStore';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Save,
  ArrowLeft,
  Eye,
  Globe,
  Languages,
  Upload,
  Image as ImageIcon,
  FileText,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload as UploadIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ContentType, Language, ContentStatus, MediaItem } from '@/types/admin';
import UnsavedChangesWarning from './UnsavedChangesWarning';

const LANGUAGES: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
];

interface ContentFormData {
  basic: {
    status: ContentStatus;
    featured: boolean;
    order: number;
    tags: string[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  multilingual: Record<Language, {
    title: string;
    description: string;
    content: string;
    excerpt?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
  media: {
    images: MediaItem[];
    documents: MediaItem[];
  };
  specific: Record<string, any>;
}

interface UnifiedContentEditorProps {
  contentType: ContentType;
  contentId?: string;
}

const UnifiedContentEditor: React.FC<UnifiedContentEditorProps> = ({ 
  contentType, 
  contentId 
}) => {
  const navigate = useNavigate();
  const { language } = useAdminStore();
  const { categories, loading: categoriesLoading } = useCategories();
  const [formData, setFormData] = useState<ContentFormData>({
    basic: {
      status: 'draft',
      featured: false,
      order: 0,
      tags: []
    },
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    multilingual: {
      en: { title: '', description: '', content: '' },
      'zh-Hant': { title: '', description: '', content: '' },
      ja: { title: '', description: '', content: '' },
      ko: { title: '', description: '', content: '' },
      th: { title: '', description: '', content: '' },
      vi: { title: '', description: '', content: '' }
    },
    media: {
      images: [],
      documents: []
    },
    specific: {}
  });

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<Record<Language, number>>({
    en: 0, 'zh-Hant': 0, ja: 0, ko: 0, th: 0, vi: 0
  });

  // Track unsaved changes
  useEffect(() => {
    useAdminStore.getState().setHasUnsavedChanges(true);
  }, [formData]);

  // Import UnsavedChangesWarning component
  const { saveTracking } = useAdminStore();

  // Calculate translation progress
  useEffect(() => {
    const progress: Record<Language, number> = {} as Record<Language, number>;
    
    LANGUAGES.forEach(lang => {
      const content = formData.multilingual[lang.code];
      const fields = ['title', 'description', 'content'];
      const filledFields = fields.filter(field => 
        content[field as keyof typeof content] && 
        content[field as keyof typeof content].trim() !== ''
      );
      progress[lang.code] = Math.round((filledFields.length / fields.length) * 100);
    });

    setTranslationProgress(progress);
  }, [formData.multilingual]);

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStatus = publish ? 'published' : 'draft';
      setFormData(prev => ({
        ...prev,
        basic: { ...prev.basic, status: newStatus }
      }));

      // Update save tracking
      useAdminStore.getState().setLastSaved(new Date().toISOString());
      useAdminStore.getState().setHasUnsavedChanges(false);

      toast({
        title: "保存成功",
        description: publish ? "内容已发布" : "草稿已保存",
        variant: "default",
      });

      // Add to recent items
      useAdminStore.getState().addRecentItem({
        id: contentId || 'new',
        type: contentType,
        title: formData.multilingual[selectedLanguage].title || 'Untitled',
        url: `/admin/${contentType}/${contentId || 'new'}`
      });

    } catch (error) {
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };



  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const getContentTypeConfig = () => {
    switch (contentType) {
             case 'product':
         return {
           title: '产品编辑器',
           icon: '📦',
           specificFields: [
             { key: 'sku', label: 'SKU', type: 'text' },
             { key: 'price', label: '价格', type: 'number' },
             { key: 'inventory', label: '库存', type: 'number' },
             { key: 'category', label: '产品分类', type: 'select' },
             { key: 'features', label: '特性', type: 'tags' }
           ]
         };
      case 'project':
        return {
          title: '项目编辑器',
          icon: '🏗️',
          specificFields: [
            { key: 'client', label: '客户', type: 'text' },
            { key: 'location', label: '地点', type: 'text' },
            { key: 'startDate', label: '开始日期', type: 'date' },
            { key: 'endDate', label: '结束日期', type: 'date' },
            { key: 'budget', label: '预算', type: 'number' }
          ]
        };
      case 'article':
        return {
          title: '文章编辑器',
          icon: '📄',
          specificFields: [
            { key: 'author', label: '作者', type: 'text' },
            { key: 'category', label: '分类', type: 'select' },
            { key: 'readTime', label: '阅读时间', type: 'number' },
            { key: 'featuredImage', label: '特色图片', type: 'image' }
          ]
        };
      default:
        return {
          title: '内容编辑器',
          icon: '📝',
          specificFields: []
        };
    }
  };

  const config = getContentTypeConfig();

  return (
    <>
      <UnsavedChangesWarning 
        hasUnsavedChanges={saveTracking.hasUnsavedChanges}
        onSave={() => handleSave(false)}
      />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>{config.icon}</span>
              {config.title}
            </h1>
            <p className="text-muted-foreground">
              {contentId ? '编辑现有内容' : '创建新内容'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Save status indicator */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {saveTracking.lastSaved 
                ? `上次保存: ${new Date(saveTracking.lastSaved).toLocaleTimeString()}`
                : '未保存'
              }
            </span>
          </div>

          {/* Preview Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            预览
          </Button>

          {/* Save Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>

          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isSaving ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            语言选择
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center gap-2"
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <Badge variant="secondary" className="ml-1">
                  {translationProgress[lang.code]}%
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Source Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              源语言 (English)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="source-title">标题</Label>
                             <Input
                 id="source-title"
                 value={formData.multilingual.en.title}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     en: { ...prev.multilingual.en, title: e.target.value }
                   }
                 }))}
                 placeholder="输入英文标题..."
               />
            </div>
                         <div>
               <Label htmlFor="source-description">描述</Label>
               <textarea
                 id="source-description"
                 value={formData.multilingual.en.description}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     en: { ...prev.multilingual.en, description: e.target.value }
                   }
                 }))}
                 placeholder="输入英文描述..."
                 rows={3}
                 className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
               />
             </div>
                         <div>
               <Label htmlFor="source-content">内容</Label>
               <textarea
                 id="source-content"
                 value={formData.multilingual.en.content}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     en: { ...prev.multilingual.en, content: e.target.value }
                   }
                 }))}
                 placeholder="输入英文内容..."
                 rows={8}
                 className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
               />
             </div>
          </CardContent>
        </Card>

        {/* Right Panel - Target Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              目标语言 ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="target-title">标题</Label>
                             <Input
                 id="target-title"
                 value={formData.multilingual[selectedLanguage].title}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     [selectedLanguage]: { 
                       ...prev.multilingual[selectedLanguage], 
                       title: e.target.value
                     }
                   }
                 }))}
                 placeholder={`输入${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}标题...`}
               />
            </div>
                         <div>
               <Label htmlFor="target-description">描述</Label>
               <textarea
                 id="target-description"
                 value={formData.multilingual[selectedLanguage].description}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     [selectedLanguage]: { 
                       ...prev.multilingual[selectedLanguage], 
                       description: e.target.value
                     }
                   }
                 }))}
                 placeholder={`输入${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}描述...`}
                 rows={3}
                 className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
               />
             </div>
                         <div>
               <Label htmlFor="target-content">内容</Label>
               <textarea
                 id="target-content"
                 value={formData.multilingual[selectedLanguage].content}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   multilingual: {
                     ...prev.multilingual,
                     [selectedLanguage]: { 
                       ...prev.multilingual[selectedLanguage], 
                       content: e.target.value
                     }
                   }
                 }))}
                 placeholder={`输入${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}内容...`}
                 rows={8}
                 className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
               />
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="media">媒体</TabsTrigger>
          <TabsTrigger value="specific">特定字段</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.basic.status}
                    onValueChange={(value: ContentStatus) => setFormData(prev => ({
                      ...prev,
                      basic: { ...prev.basic, status: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="review">审核中</SelectItem>
                      <SelectItem value="published">已发布</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">排序</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.basic.order}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basic: { ...prev.basic, order: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.basic.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, featured: checked }
                  }))}
                />
                <Label htmlFor="featured">特色内容</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO 设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo-title">SEO 标题</Label>
                <Input
                  id="seo-title"
                  value={formData.seo.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value }
                  }))}
                  placeholder="SEO 标题..."
                />
              </div>
              <div>
                <Label htmlFor="seo-description">SEO 描述</Label>
                <textarea
                  id="seo-description"
                  value={formData.seo.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value }
                  }))}
                  placeholder="SEO 描述..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>媒体管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>图片</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <UploadIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      拖拽图片到此处或点击上传
                    </p>
                  </div>
                </div>
                <div>
                  <Label>文档</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      拖拽文档到此处或点击上传
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                 <TabsContent value="specific" className="space-y-4">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle>{config.title} 特定字段</CardTitle>
               {config.specificFields.some(field => field.type === 'select' && field.key === 'category') && (
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => window.location.reload()}
                     className="text-xs"
                   >
                     刷新分类
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => navigate('/admin/category-manager')}
                     className="text-xs"
                   >
                     管理分类
                   </Button>
                 </div>
               )}
             </CardHeader>
            <CardContent className="space-y-4">
              {config.specificFields.map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === 'text' && (
                    <Input
                      id={field.key}
                      value={formData.specific[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specific: { ...prev.specific, [field.key]: e.target.value }
                      }))}
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      id={field.key}
                      type="number"
                      value={formData.specific[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specific: { ...prev.specific, [field.key]: e.target.value }
                      }))}
                    />
                  )}
                                     {field.type === 'select' && field.key === 'category' && (
                     <Select
                       value={formData.specific[field.key] || ''}
                       onValueChange={(value) => setFormData(prev => ({
                         ...prev,
                         specific: { ...prev.specific, [field.key]: value }
                       }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={`选择${field.label}`} />
                       </SelectTrigger>
                       <SelectContent>
                         {categoriesLoading ? (
                           <SelectItem value="" disabled>加载中...</SelectItem>
                         ) : categories.length === 0 ? (
                           <SelectItem value="" disabled>暂无分类</SelectItem>
                         ) : (
                           categories.map(category => (
                             <SelectItem key={category.id} value={category.id}>
                               {category.name}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                     </Select>
                   )}
                   {field.type === 'select' && field.key !== 'category' && (
                     <Select
                       value={formData.specific[field.key] || ''}
                       onValueChange={(value) => setFormData(prev => ({
                         ...prev,
                         specific: { ...prev.specific, [field.key]: value }
                       }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={`选择${field.label}`} />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="option1">选项 1</SelectItem>
                         <SelectItem value="option2">选项 2</SelectItem>
                         <SelectItem value="select">选项 3</SelectItem>
                       </SelectContent>
                     </Select>
                   )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>内容预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">
                {formData.multilingual[selectedLanguage].title || '无标题'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {formData.multilingual[selectedLanguage].description}
              </p>
            </div>
            <Separator />
            <div className="prose max-w-none">
              {formData.multilingual[selectedLanguage].content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default UnifiedContentEditor; 