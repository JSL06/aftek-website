import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  FileText, 
  Image, 
  Settings, 
  Users, 
  Building2, 
  Globe,
  ArrowRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useCompany } from '@/contexts/CompanyContext';
import CompanySelector from '@/components/admin/CompanySelector';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentCompany } = useCompany();
  const [showCompanySelector, setShowCompanySelector] = useState(false);

  const adminCards = [
    {
      title: '產品管理',
      description: '管理產品目錄、類別和特色產品',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
      stats: '150+ 產品'
    },
    {
      title: '類別管理',
      description: '管理產品類別和分類系統',
      icon: Package,
      href: '/admin/category-manager',
      color: 'bg-teal-500',
      stats: '管理類別'
    },
    {
      title: '過濾器管理',
      description: '管理產品和專案的過濾選項',
      icon: Settings,
      href: '/admin/filter-manager',
      color: 'bg-cyan-500',
      stats: '過濾選項'
    },
    {
      title: '專案管理',
      description: '管理案例研究和專案展示',
      icon: Building2,
      href: '/admin/projects',
      color: 'bg-green-500',
      stats: '25+ 專案'
    },
    {
      title: '文章管理',
      description: '管理部落格文章和技術內容',
      icon: FileText,
      href: '/admin/articles',
      color: 'bg-purple-500',
      stats: '45+ 文章'
    },
    {
      title: '媒體管理',
      description: '管理圖片、影片和文件',
      icon: Image,
      href: '/admin/media',
      color: 'bg-orange-500',
      stats: '200+ 媒體'
    },
    {
      title: '網站文字管理',
      description: '編輯網站上的所有文字內容',
      icon: Edit,
      href: '/admin/website-text-manager',
      color: 'bg-red-500',
      stats: '即時更新'
    },
    {
      title: '翻譯管理',
      description: '管理多語言翻譯和本地化',
      icon: Globe,
      href: '/admin/translation-dashboard',
      color: 'bg-indigo-500',
      stats: '7 種語言'
    }
  ];



  if (showCompanySelector) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowCompanySelector(false)}
            className="mb-4"
          >
            ← 返回儀表板
          </Button>
        </div>
        <CompanySelector />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">管理儀表板</h1>
            <p className="text-muted-foreground">
              歡迎回來！您正在管理 <strong>{currentCompany.displayName}</strong>
            </p>
          </div>
          <Button 
            onClick={() => setShowCompanySelector(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            切換公司
          </Button>
        </div>
        
        {/* Company Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${currentCompany.id === 'aftek' ? 'bg-red-100' : currentCompany.id === 'rla' ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center`}>
                  <Building2 className={`h-6 w-6 ${currentCompany.id === 'aftek' ? 'text-red-600' : currentCompany.id === 'rla' ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentCompany.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{currentCompany.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{currentCompany.domain}</Badge>
                <p className="text-sm text-muted-foreground mt-1">{currentCompany.contactInfo.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Main Admin Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">管理功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {card.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{card.description}</p>
                <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link to={card.href}>
                    管理 {card.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;