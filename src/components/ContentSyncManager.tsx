import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Package, 
  Building, 
  Image, 
  Globe,
  RotateCcw,
  Database,
  Languages
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { productService } from '@/services/productService';
import { toast } from '@/hooks/use-toast';

interface ContentStatus {
  type: 'texts' | 'products' | 'projects' | 'articles' | 'media';
  total: number;
  translated: number;
  missing: string[];
  languages: string[];
}

interface SyncResult {
  success: boolean;
  message: string;
  details?: any;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

const ContentSyncManager = () => {
  const [contentStatus, setContentStatus] = useState<ContentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkContentStatus();
  }, []);

  const checkContentStatus = async () => {
    setLoading(true);
    try {
      const statuses: ContentStatus[] = [];

      // Check website texts
      const { data: texts } = await supabase
        .from('website_texts')
        .select('language, key');

      if (texts) {
        const textKeys = [...new Set(texts.map(t => t.key))];
        const textLanguages = [...new Set(texts.map(t => t.language))];
        const missingTexts = LANGUAGES.filter(lang => !textLanguages.includes(lang.code));
        
        statuses.push({
          type: 'texts',
          total: textKeys.length,
          translated: textLanguages.length,
          missing: missingTexts.map(l => l.name),
          languages: textLanguages
        });
      }

      // Check products
      const products = await productService.getAllProducts();
      const productLanguages = [...new Set(products.flatMap(p => 
        p.names ? Object.keys(p.names) : []
      ))];
      const missingProducts = LANGUAGES.filter(lang => !productLanguages.includes(lang.code));
      
      statuses.push({
        type: 'products',
        total: products.length,
        translated: productLanguages.length,
        missing: missingProducts.map(l => l.name),
        languages: productLanguages
      });

      // Check projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*');

      if (projects) {
        const projectLanguages = [...new Set(projects.flatMap(p => 
          p.translations ? Object.keys(p.translations) : []
        ))];
        const missingProjects = LANGUAGES.filter(lang => !projectLanguages.includes(lang.code));
        
        statuses.push({
          type: 'projects',
          total: projects.length,
          translated: projectLanguages.length,
          missing: missingProjects.map(l => l.name),
          languages: projectLanguages
        });
      }

      // Check articles
      const { data: articles } = await supabase
        .from('articles')
        .select('*');

      if (articles) {
        const articleLanguages = [...new Set(articles.flatMap(a => 
          a.translations ? Object.keys(a.translations) : []
        ))];
        const missingArticles = LANGUAGES.filter(lang => !articleLanguages.includes(lang.code));
        
        statuses.push({
          type: 'articles',
          total: articles.length,
          translated: articleLanguages.length,
          missing: missingArticles.map(l => l.name),
          languages: articleLanguages
        });
      }

      // Check media
      const { data: media } = await supabase
        .from('media')
        .select('*');

      if (media) {
        const mediaLanguages = [...new Set(media.flatMap(m => 
          m.translations ? Object.keys(m.translations) : []
        ))];
        const missingMedia = LANGUAGES.filter(lang => !mediaLanguages.includes(lang.code));
        
        statuses.push({
          type: 'media',
          total: media.length,
          translated: mediaLanguages.length,
          missing: missingMedia.map(l => l.name),
          languages: mediaLanguages
        });
      }

      setContentStatus(statuses);
    } catch (error) {
      console.error('Error checking content status:', error);
      toast({
        title: "错误",
        description: "检查内容状态时出错",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const syncContent = async () => {
    setSyncing(true);
    setProgress(0);
    
    try {
      const totalSteps = 5;
      let currentStep = 0;

      // Step 1: Sync website texts
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await syncWebsiteTexts();

      // Step 2: Sync products
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await syncProducts();

      // Step 3: Sync projects
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await syncProjects();

      // Step 4: Sync articles
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await syncArticles();

      // Step 5: Sync media
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await syncMedia();

      toast({
        title: "同步完成",
        description: "所有内容已成功同步",
      });

      // Refresh status
      await checkContentStatus();
    } catch (error) {
      console.error('Error syncing content:', error);
      toast({
        title: "同步错误",
        description: "同步内容时出错",
        variant: "destructive",
      });
    }
    
    setSyncing(false);
    setProgress(0);
  };

  const syncWebsiteTexts = async (): Promise<SyncResult> => {
    try {
      // Get all text keys
      const { data: texts } = await supabase
        .from('website_texts')
        .select('key, language, value');

      if (!texts) return { success: false, message: 'No texts found' };

      const textKeys = [...new Set(texts.map(t => t.key))];
      const existingLanguages = [...new Set(texts.map(t => t.language))];

      // Find missing languages
      const missingLanguages = LANGUAGES.filter(lang => !existingLanguages.includes(lang.code));

      // Create missing translations (copy from English as fallback)
      const englishTexts = texts.filter(t => t.language === 'en');
      
      for (const lang of missingLanguages) {
        const textsToInsert = englishTexts.map(text => ({
          key: text.key,
          language: lang.code,
          section: text.key.split('.')[0],
          value: text.value // Use English as fallback
        }));

        const { error } = await supabase
          .from('website_texts')
          .upsert(textsToInsert, { onConflict: 'key,language' });

        if (error) {
          console.error(`Error inserting ${lang.code} texts:`, error);
        }
      }

      return { success: true, message: `Synced ${missingLanguages.length} languages for website texts` };
    } catch (error) {
      return { success: false, message: 'Failed to sync website texts' };
    }
  };

  const syncProducts = async (): Promise<SyncResult> => {
    try {
      const products = await productService.getAllProducts();
      
      for (const product of products) {
        if (!product.names) {
          product.names = {};
        }

        // Ensure all languages have translations
        for (const lang of LANGUAGES) {
          if (!product.names[lang.code]) {
            product.names[lang.code] = product.name || '';
          }
        }

        // Update product with translations
        await productService.updateProduct(product.id, product);
      }

      return { success: true, message: `Synced ${products.length} products` };
    } catch (error) {
      return { success: false, message: 'Failed to sync products' };
    }
  };

  const syncProjects = async (): Promise<SyncResult> => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*');

      if (!projects) return { success: false, message: 'No projects found' };

      for (const project of projects) {
        if (!project.translations) {
          project.translations = {};
        }

        // Ensure all languages have translations
        for (const lang of LANGUAGES) {
          if (!project.translations[lang.code]) {
            project.translations[lang.code] = {
              title: project.title || '',
              description: project.description || '',
              location: project.location || ''
            };
          }
        }

        // Update project with translations
        const { error } = await supabase
          .from('projects')
          .update({ translations: project.translations })
          .eq('id', project.id);

        if (error) {
          console.error(`Error updating project ${project.id}:`, error);
        }
      }

      return { success: true, message: `Synced ${projects.length} projects` };
    } catch (error) {
      return { success: false, message: 'Failed to sync projects' };
    }
  };

  const syncArticles = async (): Promise<SyncResult> => {
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('*');

      if (!articles) return { success: false, message: 'No articles found' };

      for (const article of articles) {
        if (!article.translations) {
          article.translations = {};
        }

        // Ensure all languages have translations
        for (const lang of LANGUAGES) {
          if (!article.translations[lang.code]) {
            article.translations[lang.code] = {
              title: article.title || '',
              content: article.content || '',
              excerpt: article.excerpt || ''
            };
          }
        }

        // Update article with translations
        const { error } = await supabase
          .from('articles')
          .update({ translations: article.translations })
          .eq('id', article.id);

        if (error) {
          console.error(`Error updating article ${article.id}:`, error);
        }
      }

      return { success: true, message: `Synced ${articles.length} articles` };
    } catch (error) {
      return { success: false, message: 'Failed to sync articles' };
    }
  };

  const syncMedia = async (): Promise<SyncResult> => {
    try {
      const { data: media } = await supabase
        .from('media')
        .select('*');

      if (!media) return { success: false, message: 'No media found' };

      for (const item of media) {
        if (!item.translations) {
          item.translations = {};
        }

        // Ensure all languages have translations
        for (const lang of LANGUAGES) {
          if (!item.translations[lang.code]) {
            item.translations[lang.code] = {
              title: item.title || '',
              description: item.description || ''
            };
          }
        }

        // Update media with translations
        const { error } = await supabase
          .from('media')
          .update({ translations: item.translations })
          .eq('id', item.id);

        if (error) {
          console.error(`Error updating media ${item.id}:`, error);
        }
      }

      return { success: true, message: `Synced ${media.length} media items` };
    } catch (error) {
      return { success: false, message: 'Failed to sync media' };
    }
  };

  const getStatusIcon = (status: ContentStatus) => {
    const coverage = (status.translated / LANGUAGES.length) * 100;
    
    if (coverage === 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (coverage >= 50) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'texts': return <FileText className="h-5 w-5" />;
      case 'products': return <Package className="h-5 w-5" />;
      case 'projects': return <Building className="h-5 w-5" />;
      case 'articles': return <FileText className="h-5 w-5" />;
      case 'media': return <Image className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            内容同步管理器
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              检查和管理网站内容的多语言同步状态
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={checkContentStatus} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新状态
              </Button>
              <Button 
                onClick={syncContent} 
                disabled={syncing}
                size="sm"
              >
                                 <RotateCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                同步所有内容
              </Button>
            </div>
          </div>

          {syncing && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">同步进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="grid gap-4">
            {contentStatus.map((status) => (
              <Card key={status.type} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      {getContentTypeIcon(status.type)}
                      <div>
                        <h3 className="font-semibold capitalize">
                          {status.type === 'texts' && '网站文本'}
                          {status.type === 'products' && '产品'}
                          {status.type === 'projects' && '项目'}
                          {status.type === 'articles' && '文章'}
                          {status.type === 'media' && '媒体'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {status.total} 个项目，{status.translated}/{LANGUAGES.length} 种语言
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={status.translated === LANGUAGES.length ? "default" : "secondary"}>
                        {Math.round((status.translated / LANGUAGES.length) * 100)}% 完成
                      </Badge>
                    </div>
                  </div>

                  {status.missing.length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">缺少翻译的语言:</p>
                      <div className="flex flex-wrap gap-1">
                        {status.missing.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {status.languages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">已翻译的语言:</p>
                      <div className="flex flex-wrap gap-1">
                        {status.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {LANGUAGES.find(l => l.code === lang)?.flag} {LANGUAGES.find(l => l.code === lang)?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {contentStatus.length === 0 && !loading && (
            <div className="text-center py-8">
              <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">暂无内容状态信息</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSyncManager; 