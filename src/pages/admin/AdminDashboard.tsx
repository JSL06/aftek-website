import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  FileText, 
  Image, 
  Users,
  Settings,
  Plus,
  Database,
  Trash2,
  RefreshCw,
  Building2,
  Filter,
  Globe,
  Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ProductMigrationTool } from '@/components/ProductMigrationTool';
import ContentSyncManager from '@/components/ContentSyncManager';
import { productService } from '@/services/productService';
import ProductSyncTester from '@/components/ProductSyncTester';

interface DashboardStats {
  totalProducts: number;
  totalProjects: number;
  totalArticles: number;
  totalTranslations: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
];

const AdminDashboard = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalProjects: 0,
    totalArticles: 0,
    totalTranslations: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-Hant');

  // Force Traditional Chinese for admin pages
  useEffect(() => {
    if (currentLanguage !== 'zh-Hant') {
      console.log('Forcing Traditional Chinese for admin dashboard');
      changeLanguage('zh-Hant');
    }
  }, [currentLanguage, changeLanguage]);

  // Simple test to verify translation function
  console.log('AdminDashboard - Translation test:', {
    testKey: t('admin.dashboard.title'),
    testNav: t('nav.home'),
    currentLanguage: currentLanguage,
    selectedLanguage: selectedLanguage
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Use productService for products count (same as other admin pages)
        const products = await productService.getAllProducts();
        
        // Fetch counts from other tables
        const [articlesResult, projectsResult, translationsResult] = await Promise.all([
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('website_texts').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalProducts: products.length,
          totalProjects: projectsResult.count || 0,
          totalArticles: articlesResult.count || 0,
          totalTranslations: translationsResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to direct database call if productService fails
        try {
          const productsResult = await supabase.from('products').select('*', { count: 'exact', head: true });
          setStats(prev => ({
            ...prev,
            totalProducts: productsResult.count || 0
          }));
        } catch (dbError) {
          console.error('Database fallback also failed:', dbError);
        }
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color = "primary" }: {
    title: string;
    value: number;
    icon: any;
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, link, color = "primary" }: {
    title: string;
    description: string;
    icon: any;
    link: string;
    color?: string;
  }) => (
    <Link to={link}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6 text-center">
          <Icon className={`h-8 w-8 text-${color} mx-auto mb-3`} />
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );

  const LanguageCard = ({ language }: { language: typeof LANGUAGES[0] }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4 text-center">
        <div className="text-2xl mb-2">{language.flag}</div>
        <h3 className="font-semibold text-sm">{language.nativeName}</h3>
        <p className="text-xs text-muted-foreground">{language.name}</p>
      </CardContent>
    </Card>
  );

  // Test language selection
  const handleLanguageSelect = (languageCode: string) => {
    console.log('Language selected:', languageCode);
    setSelectedLanguage(languageCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('admin.dashboard.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('admin.dashboard.title')}</h1>
              <p className="text-primary-foreground/80 mt-2">{t('admin.dashboard.subtitle')}</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin.dashboard.refreshStats')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Language Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{t('admin.dashboard.selectLanguage')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {LANGUAGES.map(language => (
              <div key={language.code} onClick={() => handleLanguageSelect(language.code)}>
                <LanguageCard language={language} />
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('admin.dashboard.currentSelection')}: <span className="font-medium">{LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin.dashboard.languageDescription')}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title={t('admin.stats.totalProducts')}
            value={stats.totalProducts}
            icon={Package}
          />
          <StatCard
            title={t('admin.stats.totalProjects')}
            value={stats.totalProjects}
            icon={Building2}
          />
          <StatCard
            title={t('admin.stats.totalArticles')}
            value={stats.totalArticles}
            icon={FileText}
          />

          <StatCard
            title={t('admin.stats.totalTranslations')}
            value={stats.totalTranslations}
            icon={Languages}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title={t('admin.actions.translationManagement')}
            description={t('admin.actions.translationDescription')}
            icon={Languages}
            link="/admin/translation-dashboard"
            color="purple"
          />
          <QuickActionCard
            title={t('admin.actions.websiteTextManagement')}
            description={t('admin.actions.websiteTextDescription')}
            icon={FileText}
            link="/admin/website-text-editor"
            color="blue"
          />
          <QuickActionCard
            title={t('admin.actions.productManagement')}
            description={t('admin.actions.productDescription')}
            icon={Package}
            link="/admin/products"
            color="green"
          />
          <QuickActionCard
            title={t('admin.actions.projectManagement')}
            description={t('admin.actions.projectDescription')}
            icon={Building2}
            link="/admin/projects"
            color="orange"
          />
          <QuickActionCard
            title={t('admin.actions.articleManagement')}
            description={t('admin.actions.articleDescription')}
            icon={FileText}
            link="/admin/articles"
            color="purple"
          />

          <QuickActionCard
            title={t('admin.actions.featuredProducts')}
            description={t('admin.actions.featuredProductsDescription')}
            icon={Filter}
            link="/admin/featured-products"
            color="red"
          />
        </div>



                 {/* Content Synchronization */}
         <div className="mb-8">
           <ContentSyncManager />
         </div>

         {/* System Tools */}
         <div className="mb-8">
           <h2 className="text-xl font-semibold mb-4">{t('admin.tools.systemTools')}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Database className="h-5 w-5" />
                   {t('admin.tools.databaseTools')}
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <ProductMigrationTool />
               </CardContent>
             </Card>
             
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Settings className="h-5 w-5" />
                   {t('admin.tools.systemSettings')}
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm">{t('admin.tools.maintenanceMode')}</span>
                   <Badge variant="secondary">{t('admin.tools.statusOff')}</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm">{t('admin.tools.cacheStatus')}</span>
                   <Badge variant="outline">{t('admin.tools.statusNormal')}</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm">{t('admin.tools.databaseConnection')}</span>
                   <Badge variant="outline">{t('admin.tools.statusNormal')}</Badge>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;