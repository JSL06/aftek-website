import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Package, 
  Building2, 
  FileText, 
  Image,
  Users,
  Globe,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Plus,
  Activity,
  BarChart3,
  Settings,
  Languages,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { ContentType, Language } from '@/types/admin';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  totalProjects: number;
  totalArticles: number;
  totalMedia: number;
  totalUsers: number;
  totalTranslations: number;
  recentActivity: number;
  pendingReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'publish';
  contentType: ContentType;
  title: string;
  user: string;
  timestamp: string;
  language?: Language;
}

const NewAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    language, 
    recentItems, 
    notifications, 
    addNotification,
    addRecentItem 
  } = useAdminStore();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 12,
    totalProjects: 8,
    totalArticles: 24,
    totalMedia: 156,
    totalUsers: 3,
    totalTranslations: 5,
    recentActivity: 15,
    pendingReviews: 3
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'create',
      contentType: 'product',
      title: 'New Product: FlexPro PU',
      user: 'Admin',
      timestamp: '2024-01-15T10:30:00Z',
      language: 'en'
    },
    {
      id: '2',
      type: 'update',
      contentType: 'article',
      title: 'Updated: Construction Trends 2024',
      user: 'Editor',
      timestamp: '2024-01-15T09:15:00Z',
      language: 'zh-Hans'
    },
    {
      id: '3',
      type: 'publish',
      contentType: 'project',
      title: 'Published: Taipei Office Complex',
      user: 'Admin',
      timestamp: '2024-01-15T08:45:00Z'
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = "primary",
    onClick 
  }: {
    title: string;
    value: number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
    onClick?: () => void;
  }) => (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  trend === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            `bg-${color}/10 text-${color}`
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color = "primary",
    onClick 
  }: {
    title: string;
    description: string;
    icon: any;
    color?: string;
    onClick: () => void;
  }) => (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center mx-auto mb-4",
          `bg-${color}/10 text-${color}`
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'create':
          return <Plus className="h-4 w-4 text-green-500" />;
        case 'update':
          return <Clock className="h-4 w-4 text-blue-500" />;
        case 'delete':
          return <XCircle className="h-4 w-4 text-red-500" />;
        case 'publish':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        default:
          return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    const getContentTypeIcon = () => {
      switch (activity.contentType) {
        case 'product':
          return <Package className="h-4 w-4" />;
        case 'project':
          return <Building2 className="h-4 w-4" />;
        case 'article':
          return <FileText className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {activity.user.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {getActivityIcon()}
            <p className="text-sm font-medium truncate">{activity.title}</p>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            {getContentTypeIcon()}
            <span className="text-xs text-muted-foreground">
              {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
            </span>
            {activity.language && (
              <Badge variant="outline" className="text-xs">
                {activity.language}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-product':
        navigate('/admin/products/new');
        addNotification({
          type: 'info',
          title: '创建新产品',
          message: '正在打开产品创建界面'
        });
        break;
      case 'new-project':
        navigate('/admin/projects/new');
        addNotification({
          type: 'info',
          title: '创建新项目',
          message: '正在打开项目创建界面'
        });
        break;
      case 'new-article':
        navigate('/admin/articles/new');
        addNotification({
          type: 'info',
          title: '创建新文章',
          message: '正在打开文章创建界面'
        });
        break;
      case 'upload-media':
        navigate('/admin/media/upload');
        addNotification({
          type: 'info',
          title: '上传媒体',
          message: '正在打开媒体上传界面'
        });
        break;
      case 'translations':
        navigate('/admin/translations');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载仪表板...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">欢迎回来，管理员！</h1>
            <p className="text-purple-100 mt-1">
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">当前语言</p>
            <p className="font-semibold">{language.current}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="产品总数"
          value={stats.totalProducts}
          icon={Package}
          trend="up"
          trendValue="+12%"
          color="blue"
          onClick={() => navigate('/admin/products')}
        />
        <StatCard
          title="项目总数"
          value={stats.totalProjects}
          icon={Building2}
          trend="up"
          trendValue="+8%"
          color="green"
          onClick={() => navigate('/admin/projects')}
        />
        <StatCard
          title="文章总数"
          value={stats.totalArticles}
          icon={FileText}
          trend="down"
          trendValue="-3%"
          color="orange"
          onClick={() => navigate('/admin/articles')}
        />
        <StatCard
          title="媒体文件"
          value={stats.totalMedia}
          icon={Image}
          trend="up"
          trendValue="+25%"
          color="purple"
          onClick={() => navigate('/admin/media')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                title="新产品"
                description="添加新产品到目录"
                icon={Package}
                color="blue"
                onClick={() => handleQuickAction('new-product')}
              />
              <QuickActionCard
                title="新项目"
                description="添加新项目到作品集"
                icon={Building2}
                color="green"
                onClick={() => handleQuickAction('new-project')}
              />
              <QuickActionCard
                title="新文章"
                description="创建新的文章或新闻"
                icon={FileText}
                color="orange"
                onClick={() => handleQuickAction('new-article')}
              />
              <QuickActionCard
                title="上传媒体"
                description="上传图片、视频或文档"
                icon={Upload}
                color="purple"
                onClick={() => handleQuickAction('upload-media')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/activity')}>
              查看所有活动
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">翻译进度</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">待审核内容</span>
                <Badge variant="destructive">{stats.pendingReviews}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">活跃用户</span>
                <span className="text-sm font-medium">{stats.totalUsers}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => handleQuickAction('translations')}>
                <Languages className="mr-2 h-4 w-4" />
                管理翻译
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              最近访问
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentItems.slice(0, 6).map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(item.url)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        {item.type === 'product' && <Package className="h-4 w-4" />}
                        {item.type === 'project' && <Building2 className="h-4 w-4" />}
                        {item.type === 'article' && <FileText className="h-4 w-4" />}
                        {item.type === 'page' && <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            数据分析预览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,234</div>
              <p className="text-sm text-muted-foreground">今日访问量</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">567</div>
              <p className="text-sm text-muted-foreground">本周新增用户</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <p className="text-sm text-muted-foreground">内容完成度</p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={() => handleQuickAction('analytics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              查看详细分析
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAdminDashboard; 