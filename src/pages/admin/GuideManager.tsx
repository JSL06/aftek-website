import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Edit, Trash2, Save, ArrowLeft, Building2, MapPin, Package, 
  Image as ImageIcon, Move, Settings, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import LanguageSelector, { Language, LANGUAGES } from '@/components/LanguageSelector';
import MultilingualFormField from '@/components/MultilingualFormField';
import TranslationStatus from '@/components/TranslationStatus';
import { useTranslation } from '@/hooks/useTranslation';
import ImageUpload from '@/components/ui/ImageUpload';

interface BuildingType {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  icon: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

interface Hotspot {
  id: string;
  building_type_id: string;
  label: Record<string, string>;
  description?: Record<string, string>;
  category: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_active: boolean;
  display_order: number;
  product_ids?: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
}

const GuideManager = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('building-types');
  
  // Building Types
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [editingBuildingType, setEditingBuildingType] = useState<BuildingType | null>(null);
  const [showBuildingTypeForm, setShowBuildingTypeForm] = useState(false);
  
  // Hotspots
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [showHotspotForm, setShowHotspotForm] = useState(false);
  
  // Products
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form Data
  const [buildingTypeForm, setBuildingTypeForm] = useState<Partial<BuildingType> & { translations: Record<string, any> }>({
    name: {},
    description: {},
    icon: 'Building2',
    image_url: '',
    is_active: true,
    display_order: 0,
    translations: {}
  });
  
  const [hotspotForm, setHotspotForm] = useState<Partial<Hotspot> & { translations: Record<string, any> }>({
    building_type_id: '',
    label: {},
    description: {},
    category: '',
    x_position: 50,
    y_position: 50,
    width: 40,
    height: 40,
    is_active: true,
    display_order: 0,
    translations: {}
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load data in parallel but handle each function independently
      await Promise.allSettled([
        loadBuildingTypes(),
        loadHotspots(),
        loadProducts()
      ]);
    } catch (error) {
      console.error('Error in loadData:', error);
      // Don't show toast error here since individual functions handle their own errors
    }
    setLoading(false);
  };

  const loadBuildingTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_building_types')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error loading building types:', error);
        setBuildingTypes([]);
        return;
      }
      
      console.log('Building types loaded successfully:', data?.length || 0, 'building types');
      setBuildingTypes(data || []);
    } catch (error) {
      console.error('Error loading building types:', error);
      setBuildingTypes([]);
    }
  };

  const loadHotspots = async () => {
    try {
      // Load hotspots first
      const { data: hotspotsData, error: hotspotsError } = await supabase
        .from('guide_hotspots')
        .select('*')
        .order('display_order');
      
      if (hotspotsError) {
        console.error('Error loading hotspots:', hotspotsError);
        setHotspots([]);
        return;
      }
      
      // Load product associations separately
      const { data: associationsData, error: associationsError } = await supabase
        .from('guide_hotspot_products')
        .select('hotspot_id, product_id');
      
      if (associationsError) {
        console.error('Error loading associations:', associationsError);
        // Continue with hotspots even if associations fail
      }
      
      // Transform data to include product_ids
      const transformedHotspots = (hotspotsData || []).map(hotspot => ({
        ...hotspot,
        product_ids: associationsData
          ?.filter(assoc => assoc.hotspot_id === hotspot.id)
          ?.map(assoc => assoc.product_id) || []
      }));
      
      console.log('Hotspots loaded successfully:', transformedHotspots.length, 'hotspots');
      setHotspots(transformedHotspots);
    } catch (error) {
      console.error('Error loading hotspots:', error);
      setHotspots([]);
    }
  };

  const loadProducts = async () => {
    try {
      // First try to get all products without any filters
      let { data, error } = await supabase
        .from('products')
        .select('id, name, description, category, image');
      
      if (error) {
        console.error('Error loading products (first attempt):', error);
        
        // If that fails, try with just the basic columns
        const { data: basicData, error: basicError } = await supabase
          .from('products')
          .select('id, name');
        
        if (basicError) {
          console.error('Error loading products (basic attempt):', basicError);
          setProducts([]);
          return;
        }
        
        // Transform basic data to match expected format
        data = basicData?.map(p => ({
          id: p.id,
          name: p.name,
          description: '',
          category: '',
          image: ''
        })) || [];
      }
      
      // Sort by name if we have data
      if (data && data.length > 0) {
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
      
      console.log('Products loaded successfully:', data?.length || 0, 'products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  // Building Type Management
  const handleAddBuildingType = () => {
    setEditingBuildingType(null);
    setBuildingTypeForm({
      name: {},
      description: {},
      icon: 'Building2',
      image_url: '',
      is_active: true,
      display_order: buildingTypes.length + 1,
      translations: {}
    });
    setShowBuildingTypeForm(true);
  };

  const handleEditBuildingType = (buildingType: BuildingType) => {
    setEditingBuildingType(buildingType);
    
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        name: buildingType.name[lang.code] || '',
        description: buildingType.description?.[lang.code] || ''
      };
    });

    setBuildingTypeForm({
      ...buildingType,
      translations
    });
    setShowBuildingTypeForm(true);
  };

  const handleSaveBuildingType = async () => {
    if (!buildingTypeForm.name || Object.keys(buildingTypeForm.name).length === 0) {
      toast.error('Building type name is required');
      return;
    }

    setLoading(true);
    try {
      const buildingTypeData = {
        name: buildingTypeForm.name,
        description: buildingTypeForm.description,
        icon: buildingTypeForm.icon,
        image_url: buildingTypeForm.image_url,
        is_active: buildingTypeForm.is_active,
        display_order: buildingTypeForm.display_order
      };

      if (editingBuildingType) {
        await supabase
          .from('guide_building_types')
          .update(buildingTypeData)
          .eq('id', editingBuildingType.id);
        toast.success('Building type updated successfully');
      } else {
        await supabase
          .from('guide_building_types')
          .insert(buildingTypeData);
        toast.success('Building type added successfully');
      }

      await loadBuildingTypes();
      setShowBuildingTypeForm(false);
      setEditingBuildingType(null);
    } catch (error) {
      console.error('Error saving building type:', error);
      toast.error('Failed to save building type');
    }
    setLoading(false);
  };

  const handleDeleteBuildingType = async (id: string) => {
    try {
      await supabase
        .from('guide_building_types')
        .delete()
        .eq('id', id);
      
      toast.success('Building type deleted successfully');
      await loadBuildingTypes();
    } catch (error) {
      console.error('Error deleting building type:', error);
      toast.error('Failed to delete building type');
    }
  };

  // Hotspot Management
  const handleAddHotspot = () => {
    if (buildingTypes.length === 0) {
      toast.error('Please add building types first');
      return;
    }

    setEditingHotspot(null);
    setHotspotForm({
      building_type_id: buildingTypes[0].id,
      label: {},
      description: {},
      category: '',
      x_position: 50,
      y_position: 50,
      width: 40,
      height: 40,
      is_active: true,
      display_order: hotspots.length + 1,
      translations: {}
    });
    setShowHotspotForm(true);
  };

  const handleEditHotspot = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        label: hotspot.label[lang.code] || '',
        description: hotspot.description?.[lang.code] || ''
      };
    });

    setHotspotForm({
      ...hotspot,
      translations
    });
    setShowHotspotForm(true);
  };

  const handleSaveHotspot = async () => {
    if (!hotspotForm.label || Object.keys(hotspotForm.label).length === 0) {
      toast.error('Hotspot label is required');
      return;
    }

    if (!hotspotForm.building_type_id) {
      toast.error('Building type is required');
      return;
    }

    setLoading(true);
    try {
      const hotspotData = {
        building_type_id: hotspotForm.building_type_id,
        label: hotspotForm.label,
        description: hotspotForm.description,
        category: hotspotForm.category,
        x_position: hotspotForm.x_position,
        y_position: hotspotForm.y_position,
        width: hotspotForm.width,
        height: hotspotForm.height,
        is_active: hotspotForm.is_active,
        display_order: hotspotForm.display_order
      };

      if (editingHotspot) {
        await supabase
          .from('guide_hotspots')
          .update(hotspotData)
          .eq('id', editingHotspot.id);
        toast.success('Hotspot updated successfully');
      } else {
        await supabase
          .from('guide_hotspots')
          .insert(hotspotData);
        toast.success('Hotspot added successfully');
      }

      await loadHotspots();
      setShowHotspotForm(false);
      setEditingHotspot(null);
    } catch (error) {
      console.error('Error saving hotspot:', error);
      toast.error('Failed to save hotspot');
    }
    setLoading(false);
  };

  const handleDeleteHotspot = async (id: string) => {
    try {
      await supabase
        .from('guide_hotspots')
        .delete()
        .eq('id', id);
      
      toast.success('Hotspot deleted successfully');
      await loadHotspots();
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      toast.error('Failed to delete hotspot');
    }
  };

  // Product Association Management
  const handleToggleProductAssociation = async (hotspotId: string, productId: string) => {
    try {
      const hotspot = hotspots.find(h => h.id === hotspotId);
      const isAssociated = hotspot?.product_ids?.includes(productId);

      if (isAssociated) {
        // Remove association
        await supabase
          .from('guide_hotspot_products')
          .delete()
          .eq('hotspot_id', hotspotId)
          .eq('product_id', productId);
      } else {
        // Add association
        await supabase
          .from('guide_hotspot_products')
          .insert({
            hotspot_id: hotspotId,
            product_id: productId,
            display_order: 0
          });
      }

      await loadHotspots();
      toast.success(`Product ${isAssociated ? 'removed from' : 'added to'} hotspot`);
    } catch (error) {
      console.error('Error toggling product association:', error);
      toast.error('Failed to update product association');
    }
  };

  // Translation handling
  const handleBuildingTypeTranslationChange = (language: Language, fieldName: string, value: any) => {
    setBuildingTypeForm(prev => {
      const newFormData = {
        ...prev,
        translations: {
          ...prev.translations,
          [language]: {
            ...prev.translations[language],
            [fieldName]: value
          }
        }
      };

      // Update the main fields when English is selected
      if (language === 'en') {
        if (fieldName === 'name') {
          newFormData.name = { ...newFormData.name, en: value };
        }
        if (fieldName === 'description') {
          newFormData.description = { ...newFormData.description, en: value };
        }
      }

      return newFormData;
    });
  };

  const handleHotspotTranslationChange = (language: Language, fieldName: string, value: any) => {
    setHotspotForm(prev => {
      const newFormData = {
        ...prev,
        translations: {
          ...prev.translations,
          [language]: {
            ...prev.translations[language],
            [fieldName]: value
          }
        }
      };

      // Update the main fields when English is selected
      if (language === 'en') {
        if (fieldName === 'label') {
          newFormData.label = { ...newFormData.label, en: value };
        }
        if (fieldName === 'description') {
          newFormData.description = { ...newFormData.description, en: value };
        }
      }

      return newFormData;
    });
  };

  if (showBuildingTypeForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Link to="/admin/guide-manager">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guide Manager
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {editingBuildingType ? 'Edit Building Type' : 'Add Building Type'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingBuildingType ? 'Edit Building Type' : 'Add Building Type'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="bg-background border-b border-border pb-4 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              {/* Translation Status */}
              <div className="bg-muted p-4 rounded-lg">
                <TranslationStatus
                  translations={buildingTypeForm.translations}
                  requiredFields={['name']}
                />
              </div>

              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  Current Selection: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MultilingualFormField
                    label="Building Type Name"
                    fieldName="name"
                    type="text"
                    translations={buildingTypeForm.translations}
                    onTranslationChange={handleBuildingTypeTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <div>
                    <Label>Icon</Label>
                    <Select value={buildingTypeForm.icon} onValueChange={(value) => setBuildingTypeForm(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Building2">Building</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Factory">Factory</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <MultilingualFormField
                    label="Description"
                    fieldName="description"
                    type="rich-text"
                    translations={buildingTypeForm.translations}
                    onTranslationChange={handleBuildingTypeTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={buildingTypeForm.display_order || 0}
                    onChange={(e) => setBuildingTypeForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={buildingTypeForm.is_active || false}
                    onCheckedChange={(checked) => setBuildingTypeForm(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              {/* Building Image */}
              <div>
                <Label>Building Diagram Image</Label>
                <ImageUpload
                  value={buildingTypeForm.image_url || ''}
                  onChange={(url) => setBuildingTypeForm(prev => ({ ...prev, image_url: url }))}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveBuildingType} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setShowBuildingTypeForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showHotspotForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Link to="/admin/guide-manager">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guide Manager
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {editingHotspot ? 'Edit Hotspot' : 'Add Hotspot'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingHotspot ? 'Edit Hotspot' : 'Add Hotspot'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="bg-background border-b border-border pb-4 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              {/* Translation Status */}
              <div className="bg-muted p-4 rounded-lg">
                <TranslationStatus
                  translations={hotspotForm.translations}
                  requiredFields={['label']}
                />
              </div>

              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  Current Selection: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MultilingualFormField
                    label="Hotspot Label"
                    fieldName="label"
                    type="text"
                    translations={hotspotForm.translations}
                    onTranslationChange={handleHotspotTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <div>
                    <Label>Building Type</Label>
                    <Select value={hotspotForm.building_type_id} onValueChange={(value) => setHotspotForm(prev => ({ ...prev, building_type_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building type" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildingTypes.map(buildingType => (
                          <SelectItem key={buildingType.id} value={buildingType.id}>
                            {buildingType.name.en || buildingType.name[Object.keys(buildingType.name)[0]]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <MultilingualFormField
                    label="Description"
                    fieldName="description"
                    type="rich-text"
                    translations={hotspotForm.translations}
                    onTranslationChange={handleHotspotTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={hotspotForm.category || ''}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Foundation, Walls, Roof"
                  />
                </div>

                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={hotspotForm.display_order || 0}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Position and Size */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>X Position (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={hotspotForm.x_position || 50}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, x_position: parseFloat(e.target.value) || 50 }))}
                  />
                </div>

                <div>
                  <Label>Y Position (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={hotspotForm.y_position || 50}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, y_position: parseFloat(e.target.value) || 50 }))}
                  />
                </div>

                <div>
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    value={hotspotForm.width || 40}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, width: parseInt(e.target.value) || 40 }))}
                  />
                </div>

                <div>
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    value={hotspotForm.height || 40}
                    onChange={(e) => setHotspotForm(prev => ({ ...prev, height: parseInt(e.target.value) || 40 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={hotspotForm.is_active || false}
                  onCheckedChange={(checked) => setHotspotForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveHotspot} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setShowHotspotForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Guide Manager</h1>
          <p className="text-primary-foreground/80">
            Manage building types, hotspots, and product associations for the interactive guide
          </p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="building-types">Building Types</TabsTrigger>
            <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
            <TabsTrigger value="products">Product Associations</TabsTrigger>
          </TabsList>

          {/* Building Types Tab */}
          <TabsContent value="building-types" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Building Types</h2>
              <Button onClick={handleAddBuildingType}>
                <Plus className="h-4 w-4 mr-2" />
                Add Building Type
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildingTypes.map((buildingType) => (
                <Card key={buildingType.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {buildingType.name.en || buildingType.name[Object.keys(buildingType.name)[0]]}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{buildingType.icon}</Badge>
                          {!buildingType.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {buildingType.description?.en || buildingType.description?.[Object.keys(buildingType.description || {})[0]] || 'No description'}
                    </p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order:</span>
                        <span className="font-medium">{buildingType.display_order}</span>
                      </div>
                      {buildingType.image_url && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Image:</span>
                          <span className="font-medium text-xs">✓ Uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditBuildingType(buildingType)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Building Type</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{buildingType.name.en || buildingType.name[Object.keys(buildingType.name)[0]]}"? 
                              This will also delete all associated hotspots.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteBuildingType(buildingType.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hotspots Tab */}
          <TabsContent value="hotspots" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Hotspots</h2>
              <Button onClick={handleAddHotspot}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hotspot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotspots.map((hotspot) => {
                const buildingType = buildingTypes.find(bt => bt.id === hotspot.building_type_id);
                return (
                  <Card key={hotspot.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {hotspot.label.en || hotspot.label[Object.keys(hotspot.label)[0]]}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{hotspot.category}</Badge>
                            {buildingType && (
                              <Badge variant="outline">
                                {buildingType.name.en || buildingType.name[Object.keys(buildingType.name)[0]]}
                              </Badge>
                            )}
                            {!hotspot.is_active && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {hotspot.description?.en || hotspot.description?.[Object.keys(hotspot.description || {})[0]] || 'No description'}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Position:</span>
                            <div className="font-medium text-xs">
                              X: {hotspot.x_position}%, Y: {hotspot.y_position}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <div className="font-medium text-xs">
                              {hotspot.width} × {hotspot.height}px
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Products:</span>
                          <span className="font-medium text-xs">
                            {hotspot.product_ids?.length || 0} associated
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditHotspot(hotspot)} className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Hotspot</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{hotspot.label.en || hotspot.label[Object.keys(hotspot.label)[0]]}"? 
                                This will also delete all associated product associations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteHotspot(hotspot.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Product Associations Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Associations</h2>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-6">
              {buildingTypes.map((buildingType) => {
                const buildingHotspots = hotspots.filter(h => h.building_type_id === buildingType.id);
                if (buildingHotspots.length === 0) return null;

                return (
                  <Card key={buildingType.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {buildingType.name.en || buildingType.name[Object.keys(buildingType.name)[0]]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {buildingHotspots.map((hotspot) => (
                          <div key={hotspot.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">
                                {hotspot.label.en || hotspot.label[Object.keys(hotspot.label)[0]]}
                              </h4>
                              <Badge variant="secondary">{hotspot.category}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {products.map((product) => {
                                const isAssociated = hotspot.product_ids?.includes(product.id);
                                return (
                                  <div
                                    key={product.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      isAssociated 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => handleToggleProductAssociation(hotspot.id, product.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${
                                        isAssociated ? 'bg-primary' : 'bg-muted-foreground/30'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{product.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{product.category}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuideManager; 