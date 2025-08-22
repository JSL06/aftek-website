import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  FileText, 
  Image, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Globe,
  Building2,
  BarChart3,
  Palette,
  Database,
  Shield,
  Bell,
  Mail,
  HelpCircle,
  Info
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminCounts } from '@/hooks/useAdminCounts';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import AdminSidebar from './AdminSidebar';
import AdminLanguageSwitcher from './AdminLanguageSwitcher';
import CommandPalette from './CommandPalette';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAdminLanguage();
  const {
    sidebar,
    notifications,
    toggleSidebar,
    setActiveSection,
    addNotification,
    markNotificationAsRead,
    clearNotifications
  } = useAdminStore();

  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard')) {
      setActiveSection('dashboard');
    } else if (path.startsWith('/admin/products')) {
      setActiveSection('products');
    } else if (path.startsWith('/admin/projects')) {
      setActiveSection('projects');
    } else if (path.startsWith('/admin/articles')) {
      setActiveSection('articles');
    } else if (path.startsWith('/admin/media')) {
      setActiveSection('media');
    } else if (path.startsWith('/admin/translations')) {
      setActiveSection('translations');
    } else if (path.startsWith('/admin/analytics')) {
      setActiveSection('analytics');
    } else if (path.startsWith('/admin/settings')) {
      setActiveSection('settings');
    }
  }, [location.pathname, setActiveSection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      

    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette 
        open={showCommandPalette} 
        onOpenChange={setShowCommandPalette} 
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="mr-2 h-8 w-8 p-0"
          >
            {sidebar.collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2 mr-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">Aftek Admin</span>
          </div>



          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <AdminLanguageSwitcher />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <h4 className="font-medium">{t('admin.notifications.title')}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-6 px-2 text-xs"
                  >
                    {t('admin.notifications.clearAll')}
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {t('admin.notifications.noNotifications')}
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={cn(
                          "p-3 cursor-pointer",
                          !notification.read && "bg-muted/50"
                        )}
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">A</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>{t('admin.user.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('admin.user.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content Area */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebar.collapsed ? "ml-16" : "ml-64"
        )}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 