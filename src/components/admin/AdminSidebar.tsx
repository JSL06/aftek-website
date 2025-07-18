import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Building2,
  FileText,
  Image,
  Languages,
  BarChart3,
  Settings,
  Users,
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  children?: Omit<SidebarItem, 'children'>[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    title: '仪表板',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    id: 'content',
    title: '内容管理',
    icon: FileText,
    children: [
      {
        id: 'products',
        title: '产品管理',
        icon: Package,
        href: '/admin/products',
        badge: '12'
      },
      {
        id: 'projects',
        title: '项目管理',
        icon: Building2,
        href: '/admin/projects',
        badge: '8'
      },
      {
        id: 'articles',
        title: '文章管理',
        icon: FileText,
        href: '/admin/articles',
        badge: '24'
      }
    ]
  },
  {
    id: 'media',
    title: '媒体库',
    icon: Image,
    href: '/admin/media',
    badge: '156'
  },
  {
    id: 'translations',
    title: '翻译管理',
    icon: Languages,
    href: '/admin/translations',
    badge: '5'
  },
  {
    id: 'analytics',
    title: '数据分析',
    icon: BarChart3,
    href: '/admin/analytics'
  },
  {
    id: 'users',
    title: '用户管理',
    icon: Users,
    href: '/admin/users'
  },
  {
    id: 'settings',
    title: '系统设置',
    icon: Settings,
    href: '/admin/settings'
  }
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { sidebar, setActiveSection } = useAdminStore();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['content']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const isItemActive = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      const isExpanded = expandedSections.includes(item.id);
      const hasActiveChild = item.children?.some(child => isActive(child.href));

      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleSection(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between h-10 px-3",
                hasActiveChild && "bg-muted"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4" />
                {!sidebar.collapsed && <span>{item.title}</span>}
              </div>
              {!sidebar.collapsed && (
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-4 space-y-1">
              {item.children?.map(child => {
                const ChildIcon = child.icon;
                const isChildActive = isActive(child.href);

                return (
                  <Link key={child.id} to={child.href || '#'}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-9 px-3",
                        isChildActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <ChildIcon className="h-4 w-4" />
                        {!sidebar.collapsed && <span>{child.title}</span>}
                      </div>
                      {!sidebar.collapsed && child.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {child.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.id} to={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between h-10 px-3",
            isItemActive && "bg-primary/10 text-primary"
          )}
          onClick={() => setActiveSection(item.id)}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-4 w-4" />
            {!sidebar.collapsed && <span>{item.title}</span>}
          </div>
          {!sidebar.collapsed && item.badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-all duration-300",
        sidebar.collapsed && "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {sidebarItems.map(renderSidebarItem)}
        </nav>

        {/* Quick Actions */}
        {!sidebar.collapsed && (
          <div className="border-t p-2">
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {/* TODO: Open content creation modal */}}
              >
                <Plus className="mr-2 h-4 w-4" />
                创建内容
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {/* TODO: Open media upload modal */}}
              >
                <Image className="mr-2 h-4 w-4" />
                上传媒体
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed Quick Actions */}
        {sidebar.collapsed && (
          <div className="border-t p-2">
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 p-0"
                onClick={() => {/* TODO: Open content creation modal */}}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 p-0"
                onClick={() => {/* TODO: Open media upload modal */}}
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar; 