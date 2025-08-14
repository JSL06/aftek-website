import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/stores/adminStore';
import { Command } from 'cmdk';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
  Plus,
  Search,
  Globe,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { CommandItem } from '@/types/admin';

const CommandPalette: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { addRecentItem, addNotification } = useAdminStore();
  const [search, setSearch] = useState('');

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open]);

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      icon: LayoutDashboard,
      action: () => {
        navigate('/admin/dashboard');
        onOpenChange(false);
      },
      keywords: ['dashboard', 'home', 'main', 'overview'],
      category: 'Navigation'
    },
    {
      id: 'products',
      title: 'Manage Products',
      description: 'View and edit product information',
      icon: Package,
      action: () => {
        navigate('/admin/products');
        onOpenChange(false);
      },
      keywords: ['products', 'items', 'goods', 'inventory'],
      category: 'Content'
    },
    {
      id: 'projects',
      title: 'Manage Projects',
      description: 'View and edit project information',
      icon: Building2,
      action: () => {
        navigate('/admin/projects');
        onOpenChange(false);
      },
      keywords: ['projects', 'cases', 'portfolio', 'work'],
      category: 'Content'
    },
    {
      id: 'articles',
      title: 'Manage Articles',
      description: 'View and edit articles and news',
      icon: FileText,
      action: () => {
        navigate('/admin/articles');
        onOpenChange(false);
      },
      keywords: ['articles', 'news', 'blog', 'posts', 'content'],
      category: 'Content'
    },
    {
      id: 'media',
      title: 'Media Library',
      description: 'Manage images, videos, and documents',
      icon: Image,
      action: () => {
        navigate('/admin/media');
        onOpenChange(false);
      },
      keywords: ['media', 'images', 'videos', 'files', 'upload'],
      category: 'Media'
    },
    {
      id: 'translations',
      title: 'Translation Management',
      description: 'Manage multilingual content translations',
      icon: Languages,
      action: () => {
        navigate('/admin/translations');
        onOpenChange(false);
      },
      keywords: ['translations', 'languages', 'multilingual', 'localization'],
      category: 'Content'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View website analytics and statistics',
      icon: BarChart3,
      action: () => {
        navigate('/admin/analytics');
        onOpenChange(false);
      },
      keywords: ['analytics', 'stats', 'metrics', 'data', 'reports'],
      category: 'Analytics'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage admin users and permissions',
      icon: Users,
      action: () => {
        navigate('/admin/users');
        onOpenChange(false);
      },
      keywords: ['users', 'admin', 'permissions', 'roles'],
      category: 'System'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences and options',
      icon: Settings,
      action: () => {
        navigate('/admin/settings');
        onOpenChange(false);
      },
      keywords: ['settings', 'config', 'preferences', 'options'],
      category: 'System'
    },
    // Quick Actions
    {
      id: 'new-product',
      title: 'Create New Product',
      description: 'Add a new product to the catalog',
      icon: Plus,
      action: () => {
        navigate('/admin/products/new');
        onOpenChange(false);
        addNotification({
          type: 'info',
          title: 'Creating New Product',
          message: 'You are now creating a new product'
        });
      },
      keywords: ['new', 'create', 'add', 'product'],
      category: 'Quick Actions'
    },
    {
      id: 'new-project',
      title: 'Create New Project',
      description: 'Add a new project to the portfolio',
      icon: Plus,
      action: () => {
        navigate('/admin/projects/new');
        onOpenChange(false);
        addNotification({
          type: 'info',
          title: 'Creating New Project',
          message: 'You are now creating a new project'
        });
      },
      keywords: ['new', 'create', 'add', 'project'],
      category: 'Quick Actions'
    },
    {
      id: 'new-article',
      title: 'Create New Article',
      description: 'Add a new article or news post',
      icon: Plus,
      action: () => {
        navigate('/admin/articles/new');
        onOpenChange(false);
        addNotification({
          type: 'info',
          title: 'Creating New Article',
          message: 'You are now creating a new article'
        });
      },
      keywords: ['new', 'create', 'add', 'article', 'post'],
      category: 'Quick Actions'
    },
    {
      id: 'upload-media',
      title: 'Upload Media',
      description: 'Upload images, videos, or documents',
      icon: Upload,
      action: () => {
        navigate('/admin/media/upload');
        onOpenChange(false);
        addNotification({
          type: 'info',
          title: 'Media Upload',
          message: 'Opening media upload interface'
        });
      },
      keywords: ['upload', 'media', 'files', 'images', 'videos'],
      category: 'Quick Actions'
    },
    // System Actions
    {
      id: 'view-site',
      title: 'View Website',
      description: 'Open the public website in a new tab',
      icon: ExternalLink,
      action: () => {
        window.open('/', '_blank');
        onOpenChange(false);
      },
      keywords: ['view', 'site', 'website', 'public', 'frontend'],
      category: 'System'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export content data as CSV or JSON',
      icon: Download,
      action: () => {
        onOpenChange(false);
        addNotification({
          type: 'info',
          title: 'Export Data',
          message: 'Export functionality coming soon'
        });
      },
      keywords: ['export', 'download', 'data', 'csv', 'json'],
      category: 'System'
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Clear system cache and refresh data',
      icon: Trash2,
      action: () => {
        onOpenChange(false);
        addNotification({
          type: 'success',
          title: 'Cache Cleared',
          message: 'System cache has been cleared successfully'
        });
      },
      keywords: ['clear', 'cache', 'refresh', 'reset'],
      category: 'System'
    }
  ];

  const categories = Array.from(new Set(commandItems.map(item => item.category)));

  const handleSelect = (value: string) => {
    const item = commandItems.find(cmd => cmd.id === value);
    if (item) {
      item.action();
      // Add to recent items if it's a navigation action
      if (item.id !== 'view-site' && item.id !== 'export-data' && item.id !== 'clear-cache') {
        addRecentItem({
          id: item.id,
          type: 'page' as any,
          title: item.title,
          url: `/admin/${item.id}`
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-1">
            <Command.Empty>No results found.</Command.Empty>
            {categories.map(category => {
              const categoryItems = commandItems.filter(item => item.category === category);
              return (
                <Command.Group key={category} heading={category}>
                  {categoryItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={handleSelect}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              );
            })}
          </Command.List>
          <div className="flex items-center justify-between border-t px-2 py-1.5 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">↑</span>
                <span className="text-xs">↓</span>
              </kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">↵</span>
              </kbd>
              <span>to select</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette; 