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
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardStats {
  totalProducts: number;
  totalArticles: number;
  totalMedia: number;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalArticles: 0,
    totalMedia: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Fetch counts from all tables
        const [productsResult, articlesResult, mediaResult] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('media').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalProducts: productsResult.count || 0,
          totalArticles: articlesResult.count || 0,
          totalMedia: mediaResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-primary-foreground/80 mt-2">Manage your website content and settings</p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
          />
          <StatCard
            title="Total Articles"
            value={stats.totalArticles}
            icon={FileText}
          />
          <StatCard
            title="Media Items"
            value={stats.totalMedia}
            icon={Image}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Manage Products"
            description={`${stats.totalProducts} products in database`}
            icon={Package}
            link="/admin/products"
          />
          <QuickActionCard
            title="Manage Articles"
            description={`${stats.totalArticles} articles published`}
            icon={FileText}
            link="/admin/articles"
          />
          <QuickActionCard
            title="Media Manager"
            description={`${stats.totalMedia} media items`}
            icon={Image}
            link="/admin/media"
          />
          <QuickActionCard
            title="Website Text Manager"
            description="Edit all website text (titles, captions, filters, etc)"
            icon={Database}
            link="/admin/website-text-manager"
          />
        </div>

        {/* Database Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-semibold">Products Database</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalProducts} products currently stored
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/products">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-semibold">Articles Database</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalArticles} articles currently stored
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/articles">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Article
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                <Link to="/admin/products">
                  <Package className="h-6 w-6 mb-2" />
                  <span>View Products</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                <Link to="/admin/articles">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>View Articles</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                <Link to="/admin/media">
                  <Image className="h-6 w-6 mb-2" />
                  <span>Media Library</span>
                </Link>
              </Button>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;