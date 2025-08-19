import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Filter, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { categoryService, MultilingualCategory } from '@/services/categoryService';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

const MultilingualCategoryManager = () => {
  const { t } = useAdminLanguage();
  const [categories, setCategories] = useState<MultilingualCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, { name: string; description: string }>>({});
  const [newCategory, setNewCategory] = useState<Record<string, { name: string; description: string }>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories('en'); // Load with English as base
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setSaving(true);
      
      // Validate that at least English name is provided
      if (!newCategory['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      // Check if category already exists
      const exists = categories.some(
        cat => cat.names['en']?.toLowerCase() === newCategory['en'].name.toLowerCase()
      );
      
      if (exists) {
        toast.error('This category already exists');
        return;
      }

      // Prepare category data
      const categoryData = {
        name: newCategory['en'].name.trim(),
        description: newCategory['en'].description?.trim() || null,
        display_order: categories.length + 1,
        is_active: true
      };

      // Prepare translations
      const translations: Record<string, { name: string; description?: string }> = {};
      LANGUAGES.forEach(lang => {
        if (newCategory[lang.code]?.name?.trim()) {
          translations[lang.code] = {
            name: newCategory[lang.code].name.trim(),
            description: newCategory[lang.code].description?.trim() || undefined
          };
        }
      });

      // Create category with translations
      const newCategoryData = await categoryService.createCategory(categoryData, translations);
      
      setCategories(prev => [...prev, newCategoryData]);
      setNewCategory({});
      setShowAddForm(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    try {
      setSaving(true);
      
      // Validate that at least English name is provided
      if (!editingData['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      // Prepare translations
      const translations: Record<string, { name: string; description?: string }> = {};
      LANGUAGES.forEach(lang => {
        if (editingData[lang.code]?.name?.trim()) {
          translations[lang.code] = {
            name: editingData[lang.code].name.trim(),
            description: editingData[lang.code].description?.trim() || undefined
          };
        }
      });

      // Update category with translations
      const updatedCategory = await categoryService.updateCategory(id, {}, translations);
      
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );
      
      setEditingId(null);
      setEditingData({});
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove it from all products.`)) return;

    try {
      setSaving(true);
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await categoryService.toggleCategoryActive(id, !isActive);
      setCategories(prev => 
        prev.map(cat => 
          cat.id === id ? { ...cat, is_active: !isActive } : cat
        )
      );
      toast.success(`Category ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Failed to update category');
    }
  };

  const startEditing = (category: MultilingualCategory) => {
    setEditingId(category.id);
    
    // Initialize editing data with existing translations
    const initialData: Record<string, { name: string; description: string }> = {};
    LANGUAGES.forEach(lang => {
      initialData[lang.code] = {
        name: category.names[lang.code] || '',
        description: category.descriptions[lang.code] || ''
      };
    });
    
    setEditingData(initialData);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Button
            asChild
            variant="secondary"
            className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
          >
            <Link to="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Multilingual Category Manager</h1>
          <p className="text-primary-foreground/80 mt-2">
            Manage product categories in multiple languages
          </p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Add New Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Category
              </Button>
            ) : (
              <div className="space-y-4">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    {LANGUAGES.map(lang => (
                      <TabsTrigger key={lang.code} value={lang.code} className="text-xs">
                        {lang.flag} {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {LANGUAGES.map(lang => (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`categoryName_${lang.code}`}>
                            Category Name {lang.code === 'en' && '*'}
                          </Label>
                          <Input
                            id={`categoryName_${lang.code}`}
                            value={newCategory[lang.code]?.name || ''}
                            onChange={(e) => setNewCategory(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], name: e.target.value }
                            }))}
                            placeholder={`Enter category name in ${lang.name}`}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`categoryDescription_${lang.code}`}>Description</Label>
                          <Textarea
                            id={`categoryDescription_${lang.code}`}
                            value={newCategory[lang.code]?.description || ''}
                            onChange={(e) => setNewCategory(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], description: e.target.value }
                            }))}
                            placeholder={`Enter description in ${lang.name}`}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={saving || !newCategory['en']?.name?.trim()}
                  >
                    {saving ? 'Adding...' : 'Add Category'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Product Categories
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage product categories and their multilingual content
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadCategories}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No categories found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      category.is_active ? 'bg-background' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex-1">
                        {editingId === category.id ? (
                          <div className="space-y-4">
                            <Tabs defaultValue="en" className="w-full">
                              <TabsList className="grid w-full grid-cols-7">
                                {LANGUAGES.map(lang => (
                                  <TabsTrigger key={lang.code} value={lang.code} className="text-xs">
                                    {lang.flag} {lang.name}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                              
                              {LANGUAGES.map(lang => (
                                <TabsContent key={lang.code} value={lang.code} className="space-y-2">
                                  <Input
                                    value={editingData[lang.code]?.name || ''}
                                    onChange={(e) => setEditingData(prev => ({
                                      ...prev,
                                      [lang.code]: { ...prev[lang.code], name: e.target.value }
                                    }))}
                                    placeholder={`Name in ${lang.name}`}
                                    className="w-full"
                                    autoFocus={lang.code === 'en'}
                                  />
                                  <Textarea
                                    value={editingData[lang.code]?.description || ''}
                                    onChange={(e) => setEditingData(prev => ({
                                      ...prev,
                                      [lang.code]: { ...prev[lang.code], description: e.target.value }
                                    }))}
                                    placeholder={`Description in ${lang.name}`}
                                    className="w-full"
                                    rows={2}
                                  />
                                </TabsContent>
                              ))}
                            </Tabs>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-medium ${!category.is_active ? 'text-muted-foreground' : ''}`}>
                                {category.names['en'] || category.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {category.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.descriptions['en'] || category.description}
                            </div>
                            <div className="flex gap-1 mt-2">
                              {LANGUAGES.map(lang => (
                                <Badge key={lang.code} variant="secondary" className="text-xs">
                                  {lang.flag} {category.names[lang.code] ? '✓' : '✗'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Active toggle */}
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => handleToggleActive(category.id, category.is_active)}
                      />
                      
                      {/* Edit/Delete buttons */}
                      {editingId === category.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCategory(category.id)}
                            disabled={saving}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(category)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id, category.names['en'] || category.name)}
                            disabled={saving}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultilingualCategoryManager;
