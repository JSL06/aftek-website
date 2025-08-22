import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Filter, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({ name: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parent_id: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Loading categories from database...');
      
      // Simple, direct query without HEAD requests
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error loading categories:', error);
        // Don't show error toast - just load empty state
        setCategories([]);
        return;
      }
      
      console.log('📊 Categories loaded from database:', data);
      setCategories(data || []);
      
      if (data && data.length === 0) {
        toast.info('No categories found. Add your first category to get started.');
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setSaving(true);
      
      console.log('🔄 Adding category:', newCategory);
      
      // Check if category already exists
      const exists = categories.some(
        cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
      );
      
      if (exists) {
        toast.error('This category already exists');
        return;
      }

      const insertData = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null,
        parent_id: newCategory.parent_id || null,
        display_order: categories.length + 1,
        is_active: true
      };

      console.log('📝 Inserting category data:', insertData);

      const { data, error } = await supabase
        .from('product_categories')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }

      console.log('✅ Category inserted successfully:', data);

      setCategories(prev => [...prev, data]);
      setNewCategory({ name: '', description: '', parent_id: '' });
      setShowAddForm(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('❌ Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setSaving(true);
      
      console.log('🔄 Editing category ID:', id, 'with data:', editingData);
      
      const updateData = { 
        name: editingData.name.trim(),
        description: editingData.description.trim() || null
      };

      console.log('📝 Updating category with data:', updateData);

      const { error } = await supabase
        .from('product_categories')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Category updated successfully');

      setCategories(prev => 
        prev.map(cat => 
          cat.id === id ? { 
            ...cat, 
            name: editingData.name.trim(),
            description: editingData.description.trim() || null
          } : cat
        )
      );
      
      setEditingId(null);
      setEditingData({ name: '', description: '' });
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('❌ Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove it from all products.`)) return;

    try {
      setSaving(true);
      
      // First, remove category from all products
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', id);

      if (updateError) {
        console.warn('Warning: Could not update products category references:', updateError);
      }

      // Then delete the category
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('product_categories')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

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

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(cat => cat.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    try {
      setSaving(true);
      
      // Swap display_order values
      const currentCategory = categories[currentIndex];
      const targetCategory = categories[newIndex];
      
      const { error: error1 } = await supabase
        .from('product_categories')
        .update({ display_order: targetCategory.display_order })
        .eq('id', currentCategory.id);

      const { error: error2 } = await supabase
        .from('product_categories')
        .update({ display_order: currentCategory.display_order })
        .eq('id', targetCategory.id);

      if (error1 || error2) throw error1 || error2;

      // Update local state
      const newCategories = [...categories];
      [newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]];
      setCategories(newCategories);
      
      toast.success('Category order updated successfully');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Failed to reorder categories');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category: ProductCategory) => {
    console.log('🔄 Starting edit for category:', category);
    setEditingId(category.id);
    setEditingData({ 
      name: category.name || '', 
      description: category.description || '' 
    });
    console.log('📝 Set editing data:', { 
      name: category.name || '', 
      description: category.description || '' 
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({ name: '', description: '' });
  };

  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return 'None';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
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
          <h1 className="text-3xl font-bold">Product Category Manager</h1>
          <p className="text-primary-foreground/80 mt-2">
            Manage product categories and their organization
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parentCategory">Parent Category</Label>
                    <select
                      id="parentCategory"
                      value={newCategory.parent_id}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, parent_id: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">No Parent (Top Level)</option>
                      {categories
                        .filter(cat => cat.is_active)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description (optional)"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={saving || !newCategory.name.trim()}
                  >
                    {saving ? 'Adding...' : 'Add Category'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ name: '', description: '', parent_id: '' });
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
                  Manage product categories and their display order
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-amber-800 mb-2">Setup Required</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    The product categories table needs to be set up in Supabase first.
                  </p>
                  <div className="text-xs text-amber-600 space-y-1">
                    <p>1. Run the setup script: <code className="bg-amber-100 px-1 rounded">setup-product-categories.sql</code></p>
                    <p>2. Or add your first category manually</p>
                  </div>
                </div>
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
                          <div className="space-y-2">
                            <Input
                              value={editingData.name}
                              onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full"
                              autoFocus
                            />
                            <Textarea
                              value={editingData.description}
                              onChange={(e) => setEditingData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Description (optional)"
                              className="w-full"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${!category.is_active ? 'text-muted-foreground' : ''}`}>
                                {category.name}
                              </span>
                              {category.parent_id && (
                                <Badge variant="outline" className="text-xs">
                                  {getParentCategoryName(category.parent_id)}
                                </Badge>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(category.id, 'up')}
                          disabled={index === 0 || saving}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(category.id, 'down')}
                          disabled={index === categories.length - 1 || saving}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
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
                            onClick={() => handleDeleteCategory(category.id, category.name)}
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

export default CategoryManager;
