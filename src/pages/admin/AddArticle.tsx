import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import InlineArticleEditor, { ContentBlock } from '@/components/InlineArticleEditor';
import articleService, { Article } from '@/services/articleService';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus
} from 'lucide-react';

const articleTemplates = [
  { id: 'news', name: 'News', description: 'Company updates and announcements' },
  { id: 'feature', name: 'Feature', description: 'In-depth articles and stories' },
  { id: 'technical', name: 'Technical', description: 'Technical guides and specifications' },
  { id: 'case-study', name: 'Case Study', description: 'Project showcases and success stories' },
  { id: 'market-analysis', name: 'Market Analysis', description: 'Industry insights and trends' },
  { id: 'opinion-piece', name: 'Opinion Piece', description: 'Expert opinions and commentary' }
];

export default function AddArticle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language: currentLanguage } = useAdminLanguage();
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('news');

  // Article form state
  const [article, setArticle] = useState<Article>({
    slug: '',
    titles: {},
    contents: {},
    excerpts: {},
    authors_multilingual: {},
    categories_multilingual: {},
    featured_image: '',
    read_time: 5,
    tags: [],
    content_blocks: [],
    is_published: false
  });

  const handleSave = async () => {
    if (!article.slug.trim()) {
      toast({
        title: "Error",
        description: "Article slug is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const articleData = {
        ...article,
        content_blocks: contentBlocks,
        categories_multilingual: {
          ...article.categories_multilingual,
          en: selectedTemplate
        }
      };

      const savedArticle = await articleService.addArticle(articleData);

      if (savedArticle) {
        toast({
          title: "Success",
          description: "Article created successfully!",
        });
        
        // Reset form for new article
        setArticle({
          slug: '',
          titles: {},
          contents: {},
          excerpts: {},
          authors_multilingual: {},
          categories_multilingual: {},
          featured_image: '',
          read_time: 5,
          tags: [],
          content_blocks: [],
          is_published: false
        });
        setContentBlocks([]);
        setSelectedTemplate('news');
        
        // Navigate back to articles list
        navigate('/admin/articles');
      } else {
        throw new Error('Failed to save article');
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <h1 className="text-3xl font-bold">Add New Article</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Article Settings */}
        <div className="xl:col-span-1 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Article Slug</label>
                <Input
                  value={article.slug}
                  onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-slug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {articleTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                <Input
                  value={article.featured_image || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Read Time (minutes)</label>
                <Input
                  type="number"
                  value={article.read_time || 5}
                  onChange={(e) => setArticle(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  value={article.tags?.join(', ') || ''}
                  onChange={(e) => setArticle(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="news, company, update"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={article.is_published || false}
                  onCheckedChange={(checked) => setArticle(prev => ({ ...prev, is_published: checked }))}
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish Article
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Multilingual Content */}
          <Card>
            <CardHeader>
              <CardTitle>Multilingual Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentLanguage} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="en">EN</TabsTrigger>
                  <TabsTrigger value="zh-Hant">繁</TabsTrigger>
                  <TabsTrigger value="zh-Hans">简</TabsTrigger>
                  <TabsTrigger value="ja">JP</TabsTrigger>
                  <TabsTrigger value="ko">KR</TabsTrigger>
                  <TabsTrigger value="th">TH</TabsTrigger>
                  <TabsTrigger value="vi">VN</TabsTrigger>
                </TabsList>
                
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={article.titles?.en || ''}
                      onChange={(e) => updateTranslation('titles', 'en', e.target.value)}
                      placeholder="Enter article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Excerpt</label>
                    <Textarea
                      value={article.excerpts?.en || ''}
                      onChange={(e) => updateTranslation('excerpts', 'en', e.target.value)}
                      placeholder="Enter article excerpt"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <Input
                      value={article.authors_multilingual?.en || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'en', e.target.value)}
                      placeholder="Enter author name"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="zh-Hant" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">標題</label>
                    <Input
                      value={article.titles?.['zh-Hant'] || ''}
                      onChange={(e) => updateTranslation('titles', 'zh-Hant', e.target.value)}
                      placeholder="輸入文章標題"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">摘要</label>
                    <Textarea
                      value={article.excerpts?.['zh-Hant'] || ''}
                      onChange={(e) => updateTranslation('excerpts', 'zh-Hant', e.target.value)}
                      placeholder="輸入文章摘要"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">作者</label>
                    <Input
                      value={article.authors_multilingual?.['zh-Hant'] || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'zh-Hant', e.target.value)}
                      placeholder="輸入作者姓名"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="zh-Hans" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">标题</label>
                    <Input
                      value={article.titles?.['zh-Hans'] || ''}
                      onChange={(e) => updateTranslation('titles', 'zh-Hans', e.target.value)}
                      placeholder="输入文章标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">摘要</label>
                    <Textarea
                      value={article.excerpts?.['zh-Hans'] || ''}
                      onChange={(e) => updateTranslation('excerpts', 'zh-Hans', e.target.value)}
                      placeholder="输入文章摘要"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">作者</label>
                    <Input
                      value={article.authors_multilingual?.['zh-Hans'] || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'zh-Hans', e.target.value)}
                      placeholder="输入作者姓名"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ja" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">タイトル</label>
                    <Input
                      value={article.titles?.ja || ''}
                      onChange={(e) => updateTranslation('titles', 'ja', e.target.value)}
                      placeholder="記事のタイトルを入力"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">要約</label>
                    <Textarea
                      value={article.excerpts?.ja || ''}
                      onChange={(e) => updateTranslation('excerpts', 'ja', e.target.value)}
                      placeholder="記事の要約を入力"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">著者</label>
                    <Input
                      value={article.authors_multilingual?.ja || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'ja', e.target.value)}
                      placeholder="著者名を入力"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ko" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">제목</label>
                    <Input
                      value={article.titles?.ko || ''}
                      onChange={(e) => updateTranslation('titles', 'ko', e.target.value)}
                      placeholder="기사 제목 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">요약</label>
                    <Textarea
                      value={article.excerpts?.ko || ''}
                      onChange={(e) => updateTranslation('excerpts', 'ko', e.target.value)}
                      placeholder="기사 요약 입력"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">작가</label>
                    <Input
                      value={article.authors_multilingual?.ko || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'ko', e.target.value)}
                      placeholder="작가 이름 입력"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="th" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">หัวข้อ</label>
                    <Input
                      value={article.titles?.th || ''}
                      onChange={(e) => updateTranslation('titles', 'th', e.target.value)}
                      placeholder="ใส่หัวข้อบทความ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">บทคัดย่อ</label>
                    <Textarea
                      value={article.excerpts?.th || ''}
                      onChange={(e) => updateTranslation('excerpts', 'th', e.target.value)}
                      placeholder="ใส่บทคัดย่อบทความ"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ผู้เขียน</label>
                    <Input
                      value={article.authors_multilingual?.th || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'th', e.target.value)}
                      placeholder="ใส่ชื่อผู้เขียน"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="vi" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                    <Input
                      value={article.titles?.vi || ''}
                      onChange={(e) => updateTranslation('titles', 'vi', e.target.value)}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tóm tắt</label>
                    <Textarea
                      value={article.excerpts?.vi || ''}
                      onChange={(e) => updateTranslation('excerpts', 'vi', e.target.value)}
                      placeholder="Nhập tóm tắt bài viết"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tác giả</label>
                    <Input
                      value={article.authors_multilingual?.vi || ''}
                      onChange={(e) => updateTranslation('authors_multilingual', 'vi', e.target.value)}
                      placeholder="Nhập tên tác giả"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Content Editor */}
        <div className="xl:col-span-2">
          <InlineArticleEditor 
            initialContent={contentBlocks}
            onContentChange={setContentBlocks}
            onPreview={() => {
              // TODO: Implement preview functionality
              console.log('Preview article with blocks:', contentBlocks);
            }}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
