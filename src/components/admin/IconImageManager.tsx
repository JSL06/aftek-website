import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Palette,
  Eye,
  EyeOff,
  RotateCw,
  Download,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IconImageItem {
  id: string;
  name: string;
  type: 'icon' | 'image' | 'logo';
  url: string;
  alt_text: string;
  category: string;
  location: string;
  isActive: boolean;
  order: number;
  width?: string;
  height?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface IconImageManagerProps {
  onClose?: () => void;
}

const IconImageManager: React.FC<IconImageManagerProps> = ({ onClose }) => {
  const [items, setItems] = useState<IconImageItem[]>([]);
  const [editingItem, setEditingItem] = useState<IconImageItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<IconImageItem>>({
    name: '',
    type: 'image',
    url: '',
    alt_text: '',
    category: '',
    location: '',
    isActive: true,
    order: 1,
    width: '',
    height: '',
    description: ''
  });

  const categories = [
    'Navigation',
    'Hero Section',
    'Services',
    'Products',
    'Footer',
    'Social Media',
    'Company',
    'General'
  ];

  const locations = [
    'Header',
    'Navigation',
    'Hero',
    'Services Section',
    'Products Section',
    'About Section',
    'Contact Section',
    'Footer',
    'Sidebar',
    'Modal',
    'Form',
    'Button'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('icon_images')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error('Error fetching icon/images:', error);
        // If table doesn't exist, create sample data
        setItems(getSampleItems());
      } else {
        setItems(data || getSampleItems());
      }
    } catch (error) {
      console.error('Error:', error);
      setItems(getSampleItems());
    }
  };

  const getSampleItems = (): IconImageItem[] => [
    {
      id: '1',
      name: 'Aftek Logo',
      type: 'logo',
      url: '/aftek-logo.png',
      alt_text: 'Aftek Company Logo',
      category: 'Company',
      location: 'Header',
      isActive: true,
      order: 1,
      width: '200px',
      height: 'auto'
    },
    {
      id: '2',
      name: 'Hero Construction Image',
      type: 'image',
      url: '/hero-aftek-construction.jpg',
      alt_text: 'Construction site with Aftek materials',
      category: 'Hero Section',
      location: 'Hero',
      isActive: true,
      order: 2,
      width: '100%',
      height: 'auto'
    },
    {
      id: '3',
      name: 'Waterproofing Icon',
      type: 'icon',
      url: '/icons/waterproofing.svg',
      alt_text: 'Waterproofing service icon',
      category: 'Services',
      location: 'Services Section',
      isActive: true,
      order: 3,
      width: '64px',
      height: '64px'
    }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, name: fileName }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const fileName = `icon-images/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('icon-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('icon-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, url: publicUrlData.publicUrl }));
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingItem && editingItem.id) {
        const { error } = await supabase
          .from('icon_images')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast.success('Item updated successfully!');
      } else {
        const { error } = await supabase
          .from('icon_images')
          .insert([{ ...formData, created_at: new Date().toISOString() }]);
        
        if (error) throw error;
        toast.success('Item added successfully!');
      }
      
      await fetchItems();
      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        type: 'image',
        url: '',
        alt_text: '',
        category: '',
        location: '',
        isActive: true,
        order: 1,
        width: '',
        height: '',
        description: ''
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item: IconImageItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('icon_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Item deleted successfully!');
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('icon_images')
        .update({ isActive: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchItems();
      toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Icon & Image Manager</h2>
          <p className="text-muted-foreground">Manage all icons, images, and logos on the website</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'icon' | 'image' | 'logo') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icon">Icon</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="logo">Logo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="alt_text">Alt Text *</Label>
              <Input
                id="alt_text"
                value={formData.alt_text}
                onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="e.g., 200px, 100%, auto"
                />
              </div>
              
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="e.g., 100px, auto"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,.svg,.ico"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Image URL or leave empty to use uploaded file"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Update' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({
                    name: '',
                    type: 'image',
                    url: '',
                    alt_text: '',
                    category: '',
                    location: '',
                    isActive: true,
                    order: 1,
                    width: '',
                    height: '',
                    description: ''
                  });
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="flex gap-2 mb-2">
                    <Badge variant={item.type === 'logo' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Category:</strong> {item.category}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Location:</strong> {item.location}
                  </p>
                  {item.width && (
                    <p className="text-xs text-muted-foreground">
                      Size: {item.width} × {item.height || 'auto'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(item.id, item.isActive)}
                  >
                    {item.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(item.url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Preview */}
              <div className="border rounded p-2 bg-muted/20">
                {item.type === 'icon' ? (
                  <div className="flex items-center justify-center h-16">
                    <img 
                      src={item.url} 
                      alt={item.alt_text}
                      className="max-w-full max-h-full object-contain"
                      style={{ 
                        width: item.width || '32px', 
                        height: item.height || '32px' 
                      }}
                    />
                  </div>
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.alt_text}
                    className="w-full h-24 object-cover rounded"
                  />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {item.description || item.alt_text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No icons or images found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first icon or image.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IconImageManager;
