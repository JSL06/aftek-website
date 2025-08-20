import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Filter, GripVertical, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

interface FeatureCategory {
  id: string;
  category_key: string;
  display_order: number;
  is_active: boolean;
  translations: Record<string, { name: string; description?: string }>;
}

interface MasterFeature {
  id: string;
  feature_key: string;
  category_id: string;
  display_order: number;
  is_active: boolean;
  translations: Record<string, { name: string; description?: string }>;
}

const FeaturesEditor = () => {
  const { t } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<'categories' | 'features'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [savingCategories, setSavingCategories] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryData, setEditingCategoryData] = useState<Record<string, { name: string; description: string }>>({});
  const [newCategory, setNewCategory] = useState<Record<string, { name: string; description: string }>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  // Features state
  const [features, setFeatures] = useState<MasterFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureData, setEditingFeatureData] = useState<Record<string, { name: string; description: string }>>({});
  const [newFeature, setNewFeature] = useState<Record<string, { name: string; description: string }>>({});
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    loadCategories();
    loadFeatures();
  }, []);

  // =====================================================
  // CATEGORIES MANAGEMENT
  // =====================================================

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      
      console.log('Loading categories...');
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('feature_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) {
        console.error('Categories error:', categoriesError);
        throw categoriesError;
      }

      console.log('Categories loaded:', categoriesData);

      // Fetch translations for all categories
      const { data: translationsData, error: translationsError } = await supabase
        .from('category_translations')
        .select('*');

      if (translationsError) {
        console.error('Translations error:', translationsError);
        throw translationsError;
      }

      console.log('Translations loaded:', translationsData);

      // Combine categories with translations
      const categoriesWithTranslations = categoriesData?.map(category => {
        const translations: Record<string, { name: string; description?: string }> = {};
        translationsData?.forEach(translation => {
          if (translation.category_id === category.id) {
            translations[translation.language_code] = {
              name: translation.display_name,
              description: translation.description || ''
            };
          }
        });

        return {
          ...category,
          translations
        };
      }) || [];

      console.log('Combined categories:', categoriesWithTranslations);
      setCategories(categoriesWithTranslations);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setSavingCategories(true);
      
      // Validate that at least English name is provided
      if (!newCategory['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      // Check if category already exists
      const exists = categories.some(
        cat => cat.category_key.toLowerCase() === newCategory['en'].name.toLowerCase().replace(/\s+/g, '-')
      );
      
      if (exists) {
        toast.error('This category already exists');
        return;
      }

      // Prepare category data
      const categoryKey = newCategory['en'].name.toLowerCase().replace(/\s+/g, '-');
      const categoryData = {
        category_key: categoryKey,
        description: newCategory['en'].description?.trim() || null,
        display_order: categories.length + 1,
        is_active: true
      };

      // Create category
      const { data: newCategoryData, error: categoryError } = await supabase
        .from('feature_categories')
        .insert(categoryData)
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Create translations
      const translations = [];
      for (const [langCode, langData] of Object.entries(newCategory)) {
        if (langData.name?.trim()) {
          translations.push({
            category_id: newCategoryData.id,
            language_code: langCode,
            display_name: langData.name.trim(),
            description: langData.description?.trim() || null
          });
        }
      }

      if (translations.length > 0) {
        const { error: translationsError } = await supabase
          .from('category_translations')
          .insert(translations);

        if (translationsError) throw translationsError;
      }

      // Reload categories
      await loadCategories();
      
      setNewCategory({});
      setShowAddCategory(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setSavingCategories(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    try {
      setSavingCategories(true);
      
      // Validate that at least English name is provided
      if (!editingCategoryData['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      // Update translations
      for (const [langCode, langData] of Object.entries(editingCategoryData)) {
        if (langData.name?.trim()) {
          const { error } = await supabase
            .from('category_translations')
            .upsert({
              category_id: id,
              language_code: langCode,
              display_name: langData.name.trim(),
              description: langData.description?.trim() || null
            }, {
              onConflict: 'category_id,language_code'
            });

          if (error) throw error;
        }
      }

      // Reload categories
      await loadCategories();
      
      setEditingCategoryId(null);
      setEditingCategoryData({});
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSavingCategories(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove all features in this category.`)) return;

    try {
      setSavingCategories(true);
      
      // Delete category (cascades to features and translations)
      const { error } = await supabase
        .from('feature_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload categories
      await loadCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setSavingCategories(false);
    }
  };

  const handleToggleCategoryActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_categories')
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

  const startEditingCategory = (category: FeatureCategory) => {
    setEditingCategoryId(category.id);
    
    // Initialize editing data with existing translations
    const initialData: Record<string, { name: string; description: string }> = {};
    LANGUAGES.forEach(lang => {
      initialData[lang.code] = {
        name: category.translations[lang.code]?.name || '',
        description: category.translations[lang.code]?.description || ''
      };
    });
    
    setEditingCategoryData(initialData);
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryData({});
  };

  // =====================================================
  // FEATURES MANAGEMENT
  // =====================================================

  const loadFeatures = async () => {
    try {
      setLoadingFeatures(true);
      
      console.log('Loading features...');
      
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('master_features')
        .select('*')
        .order('display_order', { ascending: true });

      if (featuresError) {
        console.error('Features error:', featuresError);
        throw featuresError;
      }

      console.log('Features loaded:', featuresData);

      // Fetch translations for all features
      const { data: translationsData, error: translationsError } = await supabase
        .from('feature_translations')
        .select('*');

      if (translationsError) {
        console.error('Feature translations error:', translationsError);
        throw translationsError;
      }

      console.log('Feature translations loaded:', translationsData);

      // Combine features with translations
      const featuresWithTranslations = featuresData?.map(feature => {
        const translations: Record<string, { name: string; description?: string }> = {};
        translationsData?.forEach(translation => {
          if (translation.feature_id === feature.id) {
            translations[translation.language_code] = {
              name: translation.display_name,
              description: translation.description || ''
            };
          }
        });

        return {
          ...feature,
          translations
        };
      }) || [];

      console.log('Combined features:', featuresWithTranslations);
      setFeatures(featuresWithTranslations);
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Failed to load features');
      setFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const handleAddFeature = async () => {
    try {
      setSavingFeatures(true);
      
      // Validate that at least English name is provided
      if (!newFeature['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      if (!selectedCategoryId) {
        toast.error('Please select a category');
        return;
      }

      // Check if feature already exists
      const exists = features.some(
        feat => feat.feature_key.toLowerCase() === newFeature['en'].name.toLowerCase().replace(/\s+/g, '-')
      );
      
      if (exists) {
        toast.error('This feature already exists');
        return;
      }

      // Prepare feature data
      const featureKey = newFeature['en'].name.toLowerCase().replace(/\s+/g, '-');
      const featureData = {
        feature_key: featureKey,
        category_id: selectedCategoryId,
        display_order: features.length + 1,
        is_active: true
      };

      // Create feature
      const { data: newFeatureData, error: featureError } = await supabase
        .from('master_features')
        .insert(featureData)
        .select()
        .single();

      if (featureError) throw featureError;

      // Create translations
      const translations = [];
      for (const [langCode, langData] of Object.entries(newFeature)) {
        if (langData.name?.trim()) {
          translations.push({
            feature_id: newFeatureData.id,
            language_code: langCode,
            display_name: langData.name.trim(),
            description: langData.description?.trim() || null
          });
        }
      }

      if (translations.length > 0) {
        const { error: translationsError } = await supabase
          .from('feature_translations')
          .insert(translations);

        if (translationsError) throw translationsError;
      }

      // Reload features
      await loadFeatures();
      
      setNewFeature({});
      setShowAddFeature(false);
      setSelectedCategoryId('');
      toast.success('Feature added successfully');
    } catch (error) {
      console.error('Error adding feature:', error);
      toast.error('Failed to add feature');
    } finally {
      setSavingFeatures(false);
    }
  };

  const handleEditFeature = async (id: string) => {
    try {
      setSavingFeatures(true);
      
      // Validate that at least English name is provided
      if (!editingFeatureData['en']?.name?.trim()) {
        toast.error('Please provide at least an English name');
        return;
      }

      // Update translations
      for (const [langCode, langData] of Object.entries(editingFeatureData)) {
        if (langData.name?.trim()) {
          const { error } = await supabase
            .from('feature_translations')
            .upsert({
              feature_id: id,
              language_code: langCode,
              display_name: langData.name.trim(),
              description: langData.description?.trim() || null
            }, {
              onConflict: 'feature_id,language_code'
            });

          if (error) throw error;
        }
      }

      // Reload features
      await loadFeatures();
      
      setEditingFeatureId(null);
      setEditingFeatureData({});
      toast.success('Feature updated successfully');
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error('Failed to update feature');
    } finally {
      setSavingFeatures(false);
    }
  };

  const handleDeleteFeature = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove it from all products.`)) return;

    try {
      setSavingFeatures(true);
      
      // Delete feature (cascades to translations)
      const { error } = await supabase
        .from('master_features')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload features
      await loadFeatures();
      toast.success('Feature deleted successfully');
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    } finally {
      setSavingFeatures(false);
    }
  };

  const handleToggleFeatureActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('master_features')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      setFeatures(prev => 
        prev.map(feat => 
          feat.id === id ? { ...feat, is_active: !isActive } : feat
        )
      );
      toast.success(`Feature ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature');
    }
  };

  const startEditingFeature = (feature: MasterFeature) => {
    setEditingFeatureId(feature.id);
    
    // Initialize editing data with existing translations
    const initialData: Record<string, { name: string; description: string }> = {};
    LANGUAGES.forEach(lang => {
      initialData[lang.code] = {
        name: feature.translations[lang.code]?.name || '',
        description: feature.translations[lang.code]?.description || ''
      };
    });
    
    setEditingFeatureData(initialData);
  };

  const cancelEditingFeature = () => {
    setEditingFeatureId(null);
    setEditingFeatureData({});
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.translations['en']?.name || 'Unknown Category';
  };

  if (loadingCategories && loadingFeatures) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading features system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Features Management</h1>
          <p className="text-primary-foreground/80">Manage product features and categories with multilingual support</p>
        </div>
      </div>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Features Editor</h1>
            <p className="text-muted-foreground">Manage product features and categories</p>
          </div>
        </div>

        {/* Database Setup Notice */}
        {!loadingCategories && !loadingFeatures && categories.length === 0 && features.length === 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-orange-600">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">Database Setup Required</h3>
                  <p className="text-orange-700 mb-4">
                    The features system hasn't been set up yet. You need to run the database setup script first.
                  </p>
                  <div className="bg-orange-100 p-3 rounded-md">
                    <p className="text-sm text-orange-800 font-mono mb-2">
                      Run this SQL script in your Supabase SQL Editor:
                    </p>
                    <p className="text-sm text-orange-800 font-mono">
                      COMPLETE_FEATURES_SETUP.sql
                    </p>
                  </div>
                  <p className="text-sm text-orange-700 mt-3">
                    After running the script, refresh this page to see your features and categories.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Database Connection Test */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Database Connection Status</h3>
                <p className="text-sm text-blue-700">
                  Categories: {loadingCategories ? 'Loading...' : categories.length} | 
                  Features: {loadingFeatures ? 'Loading...' : features.length}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  loadCategories();
                  loadFeatures();
                }}
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'categories' | 'features')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Feature Categories</CardTitle>
                <Button onClick={() => setShowAddCategory(true)} disabled={showAddCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Loading categories...</p>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No categories found. Add your first category to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showAddCategory && (
                      <Card className="mb-6 border-dashed">
                        <CardHeader>
                          <CardTitle className="text-lg">Add New Category</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Tabs defaultValue="en" className="w-full">
                            <TabsList className="grid w-full grid-cols-7">
                              {LANGUAGES.map((lang) => (
                                <TabsTrigger key={lang.code} value={lang.code}>
                                  {lang.flag} {lang.code.toUpperCase()}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {LANGUAGES.map((lang) => (
                              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                                <div>
                                  <Label htmlFor={`category-name-${lang.code}`}>Category Name ({lang.name})</Label>
                                  <Input
                                    id={`category-name-${lang.code}`}
                                    value={newCategory[lang.code]?.name || ''}
                                    onChange={(e) => setNewCategory(prev => ({
                                      ...prev,
                                      [lang.code]: { ...prev[lang.code], name: e.target.value }
                                    }))}
                                    placeholder={`Enter category name in ${lang.name}`}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`category-desc-${lang.code}`}>Description ({lang.name})</Label>
                                  <Textarea
                                    id={`category-desc-${lang.code}`}
                                    value={newCategory[lang.code]?.description || ''}
                                    onChange={(e) => setNewCategory(prev => ({
                                      ...prev,
                                      [lang.code]: { ...prev[lang.code], description: e.target.value }
                                    }))}
                                    placeholder={`Enter description in ${lang.name}`}
                                    rows={3}
                                  />
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                          <div className="flex gap-2">
                            <Button onClick={handleAddCategory} disabled={savingCategories}>
                              {savingCategories ? 'Adding...' : 'Add Category'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-4">
                      {categories.map((category) => (
                        <Card key={category.id}>
                          <CardContent className="p-4">
                            {editingCategoryId === category.id ? (
                              <div className="space-y-4">
                                <Tabs defaultValue="en" className="w-full">
                                  <TabsList className="grid w-full grid-cols-7">
                                    {LANGUAGES.map((lang) => (
                                      <TabsTrigger key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.code.toUpperCase()}
                                      </TabsTrigger>
                                    ))}
                                  </TabsList>
                                  {LANGUAGES.map((lang) => (
                                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                                      <div>
                                        <Label htmlFor={`edit-category-name-${lang.code}`}>Category Name ({lang.name})</Label>
                                        <Input
                                          id={`edit-category-name-${lang.code}`}
                                          value={editingCategoryData[lang.code]?.name || ''}
                                          onChange={(e) => setEditingCategoryData(prev => ({
                                            ...prev,
                                            [lang.code]: { ...prev[lang.code], name: e.target.value }
                                          }))}
                                          placeholder={`Enter category name in ${lang.name}`}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`edit-category-desc-${lang.code}`}>Description ({lang.name})</Label>
                                        <Textarea
                                          id={`edit-category-desc-${lang.code}`}
                                          value={editingCategoryData[lang.code]?.description || ''}
                                          onChange={(e) => setEditingCategoryData(prev => ({
                                            ...prev,
                                            [lang.code]: { ...prev[lang.code], description: e.target.value }
                                          }))}
                                          placeholder={`Enter description in ${lang.name}`}
                                          rows={3}
                                        />
                                      </div>
                                    </TabsContent>
                                  ))}
                                </Tabs>
                                <div className="flex gap-2">
                                  <Button onClick={() => handleEditCategory(category.id)} disabled={savingCategories}>
                                    {savingCategories ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                  <Button variant="outline" onClick={cancelEditingCategory}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{category.translations['en']?.name || 'Unnamed Category'}</h3>
                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                      {category.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline">Order: {category.display_order}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {category.translations['en']?.description || 'No description'}
                                  </p>
                                  <div className="flex gap-1 mt-2">
                                    {LANGUAGES.map((lang) => (
                                      <Badge key={lang.code} variant="outline" className="text-xs">
                                        {lang.flag} {category.translations[lang.code]?.name ? '✓' : '✗'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={category.is_active}
                                    onCheckedChange={() => handleToggleCategoryActive(category.id, category.is_active)}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditingCategory(category)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteCategory(category.id, category.translations['en']?.name || 'Unknown')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Features</CardTitle>
                <Button onClick={() => setShowAddFeature(true)} disabled={showAddFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent>
                {showAddFeature && (
                  <Card className="mb-6 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Feature</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="feature-category">Category</Label>
                        <select
                          id="feature-category"
                          className="w-full border rounded-md p-2"
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                        >
                          <option value="">Select a category</option>
                          {categories.filter(cat => cat.is_active).map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.translations['en']?.name || cat.category_key}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Tabs defaultValue="en" className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                          {LANGUAGES.map((lang) => (
                            <TabsTrigger key={lang.code} value={lang.code}>
                              {lang.flag} {lang.code.toUpperCase()}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {LANGUAGES.map((lang) => (
                          <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                            <div>
                              <Label htmlFor={`feature-name-${lang.code}`}>Feature Name ({lang.name})</Label>
                              <Input
                                id={`feature-name-${lang.code}`}
                                value={newFeature[lang.code]?.name || ''}
                                onChange={(e) => setNewFeature(prev => ({
                                  ...prev,
                                  [lang.code]: { ...prev[lang.code], name: e.target.value }
                                }))}
                                placeholder={`Enter feature name in ${lang.name}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`feature-desc-${lang.code}`}>Description ({lang.name})</Label>
                              <Textarea
                                id={`feature-desc-${lang.code}`}
                                value={newFeature[lang.code]?.description || ''}
                                onChange={(e) => setNewFeature(prev => ({
                                  ...prev,
                                  [lang.code]: { ...prev[lang.code], description: e.target.value }
                                }))}
                                placeholder={`Enter description in ${lang.name}`}
                                rows={3}
                              />
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                      <div className="flex gap-2">
                        <Button onClick={handleAddFeature} disabled={savingFeatures}>
                          {savingFeatures ? 'Adding...' : 'Add Feature'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddFeature(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {loadingFeatures ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading features...</p>
                      </div>
                    </div>
                  ) : features.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No features found. Add your first feature to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {features.map((feature) => (
                        <Card key={feature.id}>
                          <CardContent className="p-4">
                            {editingFeatureId === feature.id ? (
                              <div className="space-y-4">
                                <Tabs defaultValue="en" className="w-full">
                                  <TabsList className="grid w-full grid-cols-7">
                                    {LANGUAGES.map((lang) => (
                                      <TabsTrigger key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.code.toUpperCase()}
                                      </TabsTrigger>
                                    ))}
                                  </TabsList>
                                  {LANGUAGES.map((lang) => (
                                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                                      <div>
                                        <Label htmlFor={`edit-feature-name-${lang.code}`}>Feature Name ({lang.name})</Label>
                                        <Input
                                          id={`edit-feature-name-${lang.code}`}
                                          value={editingFeatureData[lang.code]?.name || ''}
                                          onChange={(e) => setEditingFeatureData(prev => ({
                                            ...prev,
                                            [lang.code]: { ...prev[lang.code], name: e.target.value }
                                          }))}
                                          placeholder={`Enter feature name in ${lang.name}`}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`edit-feature-desc-${lang.code}`}>Description ({lang.name})</Label>
                                        <Textarea
                                          id={`edit-feature-desc-${lang.code}`}
                                          value={editingFeatureData[lang.code]?.description || ''}
                                          onChange={(e) => setEditingFeatureData(prev => ({
                                            ...prev,
                                            [lang.code]: { ...prev[lang.code], description: e.target.value }
                                          }))}
                                          placeholder={`Enter description in ${lang.name}`}
                                          rows={3}
                                        />
                                      </div>
                                    </TabsContent>
                                  ))}
                                </Tabs>
                                <div className="flex gap-2">
                                  <Button onClick={() => handleEditFeature(feature.id)} disabled={savingFeatures}>
                                    {savingFeatures ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                  <Button variant="outline" onClick={cancelEditingFeature}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{feature.translations['en']?.name || 'Unnamed Feature'}</h3>
                                    <Badge variant={feature.is_active ? 'default' : 'secondary'}>
                                      {feature.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline">Order: {feature.display_order}</Badge>
                                    <Badge variant="outline">{getCategoryName(feature.category_id)}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {feature.translations['en']?.description || 'No description'}
                                  </p>
                                  <div className="flex gap-1 mt-2">
                                    {LANGUAGES.map((lang) => (
                                      <Badge key={lang.code} variant="outline" className="text-xs">
                                        {lang.flag} {feature.translations[lang.code]?.name ? '✓' : '✗'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={feature.is_active}
                                    onCheckedChange={() => handleToggleFeatureActive(feature.id, feature.is_active)}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditingFeature(feature)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteFeature(feature.id, feature.translations['en']?.name || 'Unknown')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturesEditor;
