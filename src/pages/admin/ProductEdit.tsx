/**
 * 🚨 PRODUCT EDIT PAGE - TITLE AND DESCRIPTION EDITORS LOCKED 🚨
 * 
 * CRITICAL: The title and description text editors in this component are LOCKED
 * and should not be modified. They are working perfectly and any changes could
 * break the multilingual product system.
 * 
 * 🔒 LOCKED COMPONENTS:
 * - Title Input Fields (all languages) - Working perfectly
 * - Description Rich Text Editors (all languages) - Working perfectly
 * - Model Field - Working perfectly
 * 
 * ✅ WHAT WORKS:
 * - Multilingual title editing and saving
 * - Multilingual description editing and saving  
 * - Model field editing and saving
 * - All data persists to Supabase correctly
 * - Frontend website updates automatically
 * - Language switching works perfectly
 * 
 * 🚫 DO NOT MODIFY:
 * - ModernRichTextEditor component
 * - updateTranslation function
 * - Input field onChange handlers
 * - Any text editor logic
 * 
 * 🔧 ONLY ALLOWED CHANGES:
 * - UI layout and styling
 * - Adding new fields (not text editors)
 * - Translation keys and labels
 * - Category management integration
 * 
 * This system has been extensively tested and is production-ready.
 * Any modifications to the text editors will break functionality.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService, UnifiedProduct } from '@/services/productService';
import ModernRichTextEditor from '@/components/ModernRichTextEditor';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import FeaturesChecklist from '@/components/FeaturesChecklist';
import { projectService, MultilingualProject } from '@/services/projectService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Language configuration
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function ProductEdit() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t, language } = useAdminLanguage();
  
  // Use dynamic categories from the database instead of hardcoded list
  const { categories: productCategories } = useCategories('en');
  
     const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProduct, setOriginalProduct] = useState<UnifiedProduct | null>(null); // Store original state for comparison

  // New state variables for related products and projects
  const [relatedProductSearch, setRelatedProductSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [showRelatedProductsModal, setShowRelatedProductsModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);
  const [allProjects, setAllProjects] = useState<MultilingualProject[]>([]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Load all products and projects for selection modals
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [products, projects] = await Promise.all([
          productService.getAllProducts(),
          projectService.getProjects()
        ]);
        setAllProducts(products);
        setAllProjects(projects);
      } catch (error) {
        console.error('Error loading products and projects:', error);
      }
    };
    
    loadAllData();
  }, []);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // CRITICAL FIX: Load product with explicit language to ensure translations are loaded
      const productData = await productService.getProduct(productId!, 'en');
      console.log('ProductEdit: Loaded product data:', productData);
      console.log('ProductEdit: Names:', productData?.names);
      console.log('ProductEdit: Descriptions:', productData?.descriptions);
      console.log('ProductEdit: Features:', productData?.features);
      console.log('ProductEdit: Specifications:', productData?.specifications);
      console.log('ProductEdit: Projects Used:', productData?.projects_used, 'Type:', typeof productData?.projects_used, 'IsArray:', Array.isArray(productData?.projects_used));
      console.log('ProductEdit: Related Products:', productData?.related_products, 'Type:', typeof productData?.related_products, 'IsArray:', Array.isArray(productData?.related_products));
      console.log('ProductEdit: Names object keys:', Object.keys(productData?.names || {}));
      console.log('ProductEdit: Descriptions object keys:', Object.keys(productData?.descriptions || {}));
      console.log('ProductEdit: Features type:', typeof productData?.features, 'Features value:', productData?.features);
      
      // Ensure names and descriptions are properly initialized
      if (productData) {
        const initializedProduct = {
          ...productData,
          // CRITICAL FIX: Ensure names and descriptions are always objects, never undefined
          names: productData.names || {},
          descriptions: productData.descriptions || {},
          // Features are now centralized - use the main features array
          features: productData.features || [],
          // CRITICAL FIX: Ensure required fields have default values
          model: productData.model || '',
          category: productData.category || '',
          inStock: productData.inStock ?? false,
          showInFeatured: productData.showInFeatured ?? false,
          isActive: productData.isActive ?? true,
          // New fields with default values - ensure they are always arrays
          specifications: productData.specifications || {},
          projects_used: Array.isArray(productData.projects_used) ? productData.projects_used : [],
          related_products: Array.isArray(productData.related_products) ? productData.related_products : []
        };
        
        // CRITICAL FIX: Log the exact structure being set
        console.log('ProductEdit: Final initialized product:', {
          id: initializedProduct.id,
          model: initializedProduct.model,
          category: initializedProduct.category,
          names: initializedProduct.names,
          descriptions: initializedProduct.descriptions,
          features: initializedProduct.features,
          specifications: initializedProduct.specifications,
          projects_used: initializedProduct.projects_used,
          related_products: initializedProduct.related_products,
          namesType: typeof initializedProduct.names,
          descriptionsType: typeof initializedProduct.descriptions,
          featuresType: typeof initializedProduct.features,
          namesKeys: Object.keys(initializedProduct.names),
          descriptionsKeys: Object.keys(initializedProduct.descriptions),
          featuresLength: Array.isArray(initializedProduct.features) ? initializedProduct.features.length : 'not array',
          projectsUsedType: typeof initializedProduct.projects_used,
          projectsUsedIsArray: Array.isArray(initializedProduct.projects_used),
          relatedProductsType: typeof initializedProduct.related_products,
          relatedProductsIsArray: Array.isArray(initializedProduct.related_products)
        });
        
        setProduct(initializedProduct);
        setOriginalProduct(initializedProduct); // Store the initial product state
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      
      // CRITICAL: Ensure required fields are properly initialized before validation
      const productToValidate = {
        ...product,
        model: product.model || '',
        category: product.category || '',
        names: product.names || {},
        descriptions: product.descriptions || {},
        features: product.features || [],
        specifications: product.specifications || {},
        projects_used: Array.isArray(product.projects_used) ? product.projects_used : [],
        related_products: Array.isArray(product.related_products) ? product.related_products : []
      };
      
      // CRITICAL: Comprehensive validation system - Products page is now fully protected
      const validationErrors = [];
      
      // Debug logging for validation - log the entire product state
      console.log('🔍 VALIDATION: Full product state before validation:', productToValidate);
      console.log('🔍 VALIDATION: Original product state:', {
        id: originalProduct?.id,
        model: originalProduct?.model,
        category: originalProduct?.category,
        projects_used: originalProduct?.projects_used,
        related_products: originalProduct?.related_products,
        specifications: originalProduct?.specifications
      });
      console.log('🔍 VALIDATION: Current product state:', {
        id: product.id,
        model: product.model,
        category: product.category,
        projects_used: product.projects_used,
        related_products: product.related_products,
        specifications: product.specifications
      });
      console.log('🔍 VALIDATION: Model field details:', {
        model: productToValidate.model,
        modelType: typeof productToValidate.model,
        modelExists: !!productToValidate.model,
        modelTrimmed: productToValidate.model?.trim(),
        modelTrimmedExists: !!(productToValidate.model?.trim())
      });
      
      // Check if this is a partial update (only related fields changed)
      const originalProjects = JSON.stringify(originalProduct?.projects_used || []);
      const newProjects = JSON.stringify(productToValidate.projects_used || []);
      const originalRelated = JSON.stringify(originalProduct?.related_products || []);
      const newRelated = JSON.stringify(productToValidate.related_products || []);
      const originalSpecs = JSON.stringify(originalProduct?.specifications || {});
      const newSpecs = JSON.stringify(productToValidate.specifications || {});
      
      const isPartialUpdate = (
        originalProjects !== newProjects ||
        originalRelated !== newRelated ||
        originalSpecs !== newSpecs
      );
      
      console.log('🔍 VALIDATION: Partial update detection details:', {
        originalProjects,
        newProjects,
        originalRelated,
        newRelated,
        originalSpecs,
        newSpecs,
        projectsChanged: originalProjects !== newProjects,
        relatedProductsChanged: originalRelated !== newRelated,
        specificationsChanged: originalSpecs !== newSpecs,
        isPartialUpdate
      });
      
      console.log('🔍 VALIDATION: Detailed comparison for related products:', {
        originalRelatedArray: originalProduct?.related_products || [],
        newRelatedArray: productToValidate.related_products || [],
        originalRelatedString: originalRelated,
        newRelatedString: newRelated,
        comparison: originalRelated === newRelated ? 'EQUAL' : 'DIFFERENT'
      });
      
      // Basic field validation - only required for full updates
      if (!isPartialUpdate) {
        console.log('🔍 VALIDATION: Full update detected - running all validations');
        
        if (!productToValidate.category || !productToValidate.category.trim()) {
        validationErrors.push('Category is required');
      }
      
        if (!productToValidate.model || !productToValidate.model.trim()) {
        validationErrors.push('Model is required');
          console.error('🔍 VALIDATION ERROR: Model field is missing or empty:', {
            model: productToValidate.model,
            modelType: typeof productToValidate.model,
            modelExists: !!productToValidate.model,
            modelTrimmed: productToValidate.model?.trim(),
            modelTrimmedExists: !!(productToValidate.model?.trim())
          });
      }
      
      // Multilingual content validation
        const hasNames = Object.values(productToValidate.names || {}).some(name => name && name.trim());
        const hasDescriptions = Object.values(productToValidate.descriptions || {}).some(desc => desc && desc.trim());
      
      if (!hasNames) {
        validationErrors.push('At least one product name is required');
      }
      
      if (!hasDescriptions) {
        validationErrors.push('At least one product description is required');
      }
      
        // Features validation - now centralized
        const hasFeatures = Array.isArray(productToValidate.features) && productToValidate.features.length > 0;
      
      if (!hasFeatures) {
        validationErrors.push('At least one feature is required');
        }
      } else {
        console.log('🔍 VALIDATION: Partial update detected - skipping basic field validation');
        
        // For partial updates, show warnings about incomplete basic fields but don't block save
        const warnings = [];
        
        if (!productToValidate.category || !productToValidate.category.trim()) {
          warnings.push('Category is empty (will not be updated)');
        }
        
        if (!productToValidate.model || !productToValidate.model.trim()) {
          warnings.push('Model is empty (will not be updated)');
        }
        
        if (warnings.length > 0) {
          console.log('🔍 VALIDATION: Warnings for partial update:', warnings);
          // Show warnings but don't block save
          toast.warning(`Partial update: ${warnings.join(', ')}`);
        }
      }
      
      // Block save if validation fails
      if (validationErrors.length > 0) {
        toast.error(`Validation failed: ${validationErrors.join(', ')}`);
        setSaving(false);
        return;
      }
      
      // UNIFIED SAVE: Prepare ALL data together (categories, names, descriptions, everything)
      console.log('🔍 UNIFIED SAVE: Preparing all data for unified save operation');
      console.log('🔍 UNIFIED SAVE: Current product state:', {
        id: productToValidate.id,
        category: productToValidate.category,
        model: productToValidate.model,
        inStock: productToValidate.inStock,
        showInFeatured: productToValidate.showInFeatured,
        isActive: productToValidate.isActive,
        features: productToValidate.features,
        image: productToValidate.image,
        specifications: productToValidate.specifications,
        projects_used: productToValidate.projects_used,
        related_products: productToValidate.related_products,
        names: productToValidate.names,
        descriptions: productToValidate.descriptions
      });
      
      console.log('🔍 UNIFIED SAVE: Update type:', isPartialUpdate ? 'Partial Update' : 'Full Update');
      
      const updateData = {
        // Basic fields (category, model, checkboxes) - only include if not partial update
        ...(isPartialUpdate ? {} : {
          category: productToValidate.category,
          model: productToValidate.model,
          inStock: productToValidate.inStock,
          showInFeatured: productToValidate.showInFeatured,
          isActive: productToValidate.isActive,
          image: productToValidate.image,
          features: productToValidate.features || []
        }),
        
        // New fields for specifications, projects, and related products - always include
        specifications: productToValidate.specifications || {},
        projects_used: productToValidate.projects_used || [],
        related_products: productToValidate.related_products || [],
        
        // Multilingual content (names and descriptions for all languages) - only include if not partial update
        ...(isPartialUpdate ? {} : {
          names: productToValidate.names || {},
          descriptions: productToValidate.descriptions || {}
        })
      };
      
      console.log('🔍 UNIFIED SAVE: Fields to update:', Object.keys(updateData));

      console.log('📝 UNIFIED SAVE: Complete data being sent to service:', updateData);
      console.log('📝 UNIFIED SAVE: Names object:', updateData.names);
      console.log('📝 UNIFIED SAVE: Descriptions object:', updateData.descriptions);
      console.log('📝 UNIFIED SAVE: Features being sent:', updateData.features);
      console.log('📝 UNIFIED SAVE: Related products being sent:', updateData.related_products);
      console.log('📝 UNIFIED SAVE: Related products type:', typeof updateData.related_products);
      console.log('📝 UNIFIED SAVE: Related products is array:', Array.isArray(updateData.related_products));
      console.log('📝 UNIFIED SAVE: Basic fields:', {
        category: updateData.category,
        model: updateData.model,
        inStock: updateData.inStock,
        showInFeatured: updateData.showInFeatured,
        isActive: updateData.isActive,
        image: updateData.image,
        features: updateData.features
      });
      console.log('📝 UNIFIED SAVE: Basic fields type check:', {
        categoryType: typeof updateData.category,
        modelType: typeof updateData.model,
        categoryValue: updateData.category,
        modelValue: updateData.model
      });

      // UNIFIED SAVE: Send everything to the service in one operation
      const result = await productService.updateProduct(productToValidate.id, updateData);
      console.log('✅ UNIFIED SAVE: Service result:', result);
      
      // Update the product state with the result and reset original state
      if (result) {
        setProduct(result);
        setOriginalProduct({ ...result }); // Reset original state to new saved state
      toast.success(t('messages.saveSuccess'));
      }
      
      // Dispatch custom event to refresh admin counts and frontend website
      console.log('🔄 UNIFIED SAVE: Dispatching productUpdated event to refresh frontend...');
      window.dispatchEvent(new CustomEvent('productUpdated'));
      console.log('✅ UNIFIED SAVE: productUpdated event dispatched successfully');
      
      toast.success(t('messages.saveAndReload'));
      
    } catch (error) {
      console.error('❌ UNIFIED SAVE: Error saving product:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ UNIFIED SAVE: Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // Check if it's a database error
        if (error.message.includes('relation') || error.message.includes('table')) {
          toast.error('Database table missing. Please run database setup script.');
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          toast.error('Database permission denied. Check RLS policies.');
        } else {
          toast.error(`Save failed: ${error.message}`);
        }
      } else {
        toast.error('Save failed with unknown error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (productId) {
      loadProduct(); // Reload the product to reset any changes
    } else {
      setProduct(null);
    }
    setSaving(false);
    navigate('/admin/products');
  };

  const resetOriginalState = () => {
    if (product) {
      setOriginalProduct({ ...product });
    }
  };

  const updateTranslation = (languageCode: string, field: 'name' | 'description', value: string) => {
    if (!product) return;

    setProduct(prev => ({
      ...prev!,
      [field === 'name' ? 'names' : 'descriptions']: {
        ...prev![field === 'name' ? 'names' : 'descriptions'],
        [languageCode]: value
      }
    }));
  };

  // Functions for managing related products and projects
  const removeRelatedProduct = (productId: string) => {
    if (!product) return;
    console.log('🔍 removeRelatedProduct called with productId:', productId);
    console.log('🔍 Current product state before removing related product:', {
      id: product.id,
      related_products: product.related_products,
      related_productsType: typeof product.related_products,
      related_productsIsArray: Array.isArray(product.related_products)
    });
    
    const newRelatedProducts = (product.related_products || []).filter(id => id !== productId);
    console.log('🔍 New related products array after removal:', newRelatedProducts);
    
    setProduct({
      ...product,
      related_products: newRelatedProducts
    });
    
    console.log('🔍 Product state updated after removing related product');
  };

  const removeProject = (projectId: string) => {
    if (!product) return;
    setProduct({
      ...product,
      projects_used: (product.projects_used || []).filter(id => id !== projectId)
    });
  };

  const addRelatedProduct = (productId: string) => {
    if (!product) return;
    console.log('🔍 addRelatedProduct called with productId:', productId);
    console.log('🔍 Current product state before adding related product:', {
      id: product.id,
      related_products: product.related_products,
      related_productsType: typeof product.related_products,
      related_productsIsArray: Array.isArray(product.related_products)
    });
    
    const currentRelated = Array.isArray(product.related_products) ? product.related_products : [];
    console.log('🔍 Current related products array:', currentRelated);
    
    if (!currentRelated.includes(productId)) {
      const newRelatedProducts = [...currentRelated, productId];
      console.log('🔍 New related products array:', newRelatedProducts);
      
      setProduct({
        ...product,
        related_products: newRelatedProducts
      });
      
      console.log('🔍 Product state updated with new related products');
    } else {
      console.log('🔍 Product already in related products list');
    }
  };

  const addProject = (projectId: string) => {
    if (!product) return;
    const currentProjects = Array.isArray(product.projects_used) ? product.projects_used : [];
    if (!currentProjects.includes(projectId)) {
      setProduct({
        ...product,
        projects_used: [...currentProjects, projectId]
      });
    }
  };

  const updateBasicField = (field: string, value: any) => {
    if (!product) return;
    console.log(`🔍 updateBasicField called - Field: ${field}, Value: "${value}"`);
    console.log(`🔍 Current product state before update:`, {
      category: product.category,
      model: product.model,
      inStock: product.inStock,
      showInFeatured: product.showInFeatured,
      isActive: product.isActive,
      features: product.features
    });
    
    setProduct(prev => {
      const updated = { ...prev!, [field]: value };
      console.log(`🔍 Product state after ${field} update:`, {
        category: updated.category,
        model: updated.model,
        inStock: updated.inStock,
        showInFeatured: updated.showInFeatured,
        isActive: updated.isActive,
        features: updated.features
      });
      return updated;
    });
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('messages.loading')}</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('messages.notFound')}</h2>
          <Button onClick={() => navigate('/admin/products')}>
            {t('messages.backToProducts')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('nav.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('actions.edit')} {t('nav.products')}</h1>
            <p className="text-muted-foreground">ID: {product.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Basic Info - Left Sidebar */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t('basic.title')}
              </CardTitle>
            </CardHeader>
                         <CardContent className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-2">{t('basic.category')}</label>
                <Select onValueChange={(value) => updateBasicField('category', value)} defaultValue={product.category || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('basic.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.names['en'] || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('basic.model')}</label>
                <Input
                  value={product.model || ''}
                  onChange={(e) => updateBasicField('model', e.target.value)}
                  placeholder={t('basic.model')}
                />
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <div className="space-y-3">
                  {/* Current Image Display */}
                  {product.image && (
                    <div className="relative">
                      <img
                        src={product.image}
                        alt="Current product image"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => updateBasicField('image', '')}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  
                  {/* Image Upload Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            // Upload to Supabase Storage
                            const fileName = `product-${product.id}-${Date.now()}`;
                            const { data, error } = await supabase.storage
                              .from('product-images')
                              .upload(fileName, file);
                            
                            if (error) throw error;
                            
                            // Get public URL
                            const { data: { publicUrl } } = supabase.storage
                              .from('product-images')
                              .getPublicUrl(fileName);
                            
                            // Update product state
                            updateBasicField('image', publicUrl);
                            toast.success('Image uploaded successfully');
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            toast.error('Failed to upload image');
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Upload a new product image. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

               {/* Product Features - Centralized Management */}
               <div>
                 <label className="block text-sm font-medium mb-2">Product Features</label>
                 <FeaturesChecklist
                   features={[]}
                   selectedFeatures={product.features || []}
                   onFeaturesChange={(featureKeys) => {
                     console.log('🔍 FeaturesChecklist onChange called with:', featureKeys);
                     console.log('🔍 Current product features before update:', product.features);
                     // Update features centrally - affects all languages
                     if (product) {
                       setProduct({
                         ...product,
                         features: featureKeys
                       });
                       console.log('🔍 Product state updated with new features:', featureKeys);
                     }
                   }}
                   language={language} // Use current admin language for display
                   placeholder="Search features..."
                   className="mt-2"
                 />
                 <p className="text-xs text-muted-foreground mt-2">
                   Features selected here will be available in all languages. The frontend will automatically translate them based on the user's language preference.
                 </p>
               </div>

               {/* Related Products Selector */}
               <div>
                 <label className="block text-sm font-medium mb-2">Related Products</label>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <Input
                       placeholder="Search products..."
                       value={relatedProductSearch}
                       onChange={(e) => setRelatedProductSearch(e.target.value)}
                       className="flex-1"
                     />
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowRelatedProductsModal(true)}
                     >
                       Select Products
                     </Button>
                   </div>
                   
                   {/* Selected Related Products */}
                   {product.related_products && Array.isArray(product.related_products) && product.related_products.length > 0 && (
                     <div className="space-y-2">
                       <p className="text-sm text-muted-foreground">Selected products:</p>
                       {product.related_products.map((productId, index) => {
                         const relatedProduct = allProducts.find(p => p.id === productId);
                         return (
                           <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                             <span className="text-sm">
                               {relatedProduct ? relatedProduct.names?.[language] || relatedProduct.name : `Product ${productId}`}
                             </span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => removeRelatedProduct(productId)}
                               className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                             >
                               ×
                             </Button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               </div>

               {/* Projects Used In - Past Cases & Projects */}
               <div>
                 <label className="block text-sm font-medium mb-2">過往案例與專案 (Past Cases & Projects)</label>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <Input
                       placeholder="Search projects..."
                       value={projectSearch}
                       onChange={(e) => setProjectSearch(e.target.value)}
                       className="flex-1"
                     />
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowProjectsModal(true)}
                     >
                       Select Projects
                     </Button>
                   </div>
                   
                   {/* Selected Projects */}
                   {product.projects_used && Array.isArray(product.projects_used) && product.projects_used.length > 0 && (
                     <div className="space-y-2">
                       <p className="text-sm text-muted-foreground">Selected projects:</p>
                       {product.projects_used.map((projectId, index) => {
                         const project = allProjects.find(p => p.id === projectId);
                         return (
                           <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                             <span className="text-sm">
                               {project ? project.titles?.[language] || project.title : `Project ${projectId}`}
                             </span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => removeProject(projectId)}
                               className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                             >
                               ×
                             </Button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={product.inStock || false}
                    onChange={(e) => updateBasicField('inStock', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium">{t('basic.inStock')}</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInFeatured"
                    checked={product.showInFeatured || false}
                    onChange={(e) => updateBasicField('showInFeatured', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showInFeatured" className="text-sm font-medium">{t('basic.showInFeatured')}</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={product.isActive !== false}
                    onChange={(e) => updateBasicField('isActive', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">{t('basic.isActive')}</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multilingual Content - Main Area */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('multilingual.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full">
                {/* Language Tabs - Horizontal Layout */}
                <TabsList className="grid w-full grid-cols-7 h-12 mb-6">
                  {languages.map(lang => (
                    <TabsTrigger 
                      key={lang.code} 
                      value={lang.code} 
                      className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Language Content */}
                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.nativeName} - {lang.name}
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Product Name */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Type className="h-4 w-4 inline mr-2" />
                            {t('multilingual.productName')} ({lang.nativeName})
                          </label>
                          <Input
                            value={product.names?.[lang.code] || ''}
                            onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
                            placeholder={t('multilingual.enterName')}
                            className="text-lg font-medium"
                          />
                        </div>

                        {/* Product Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            {t('multilingual.productDescription')} ({lang.nativeName})
                          </label>
                          <ModernRichTextEditor
                            value={product.descriptions?.[lang.code] || ''}
                            onChange={(value) => updateTranslation(lang.code, 'description', value)}
                            placeholder={t('multilingual.enterDescription')}
                            height="300px"
                          />
                        </div>

                        {/* Technical Specifications */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            技術規格 (Technical Specifications) ({lang.nativeName})
                          </label>
                          <ModernRichTextEditor
                            value={product.specifications?.[lang.code] || ''}
                            onChange={(value) => {
                              if (product) {
                                setProduct({
                                  ...product,
                                  specifications: {
                                    ...product.specifications,
                                    [lang.code]: value
                                  }
                                });
                              }
                            }}
                            placeholder="Enter technical specifications..."
                            height="200px"
                          />
                                </div>
                        
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products Selection Modal */}
      <Dialog open={showRelatedProductsModal} onOpenChange={setShowRelatedProductsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Related Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search products..."
              value={relatedProductSearch}
              onChange={(e) => setRelatedProductSearch(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {allProducts
                .filter(p => p.id !== product?.id) // Exclude current product
                .filter(p => 
                  !product?.related_products?.includes(p.id) && // Exclude already selected
                  (p.names?.[language] || p.name).toLowerCase().includes(relatedProductSearch.toLowerCase())
                )
                .map(productItem => (
                  <div
                    key={productItem.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      addRelatedProduct(productItem.id);
                      setShowRelatedProductsModal(false);
                    }}
                  >
                    <div className="font-medium">{productItem.names?.[language] || productItem.name}</div>
                    <div className="text-sm text-muted-foreground">{productItem.category}</div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Projects Selection Modal */}
      <Dialog open={showProjectsModal} onOpenChange={setShowProjectsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Projects (Past Cases & Projects)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {allProjects
                .filter(p => 
                  !product?.projects_used?.includes(p.id) && // Exclude already selected
                  (p.titles?.[language] || p.title).toLowerCase().includes(projectSearch.toLowerCase())
                )
                .map(project => (
                  <div
                    key={project.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      addProject(project.id);
                      setShowProjectsModal(false);
                    }}
                  >
                    <div className="font-medium">{project.titles?.[language] || project.title}</div>
                    <div className="text-sm text-muted-foreground">{project.category}</div>
                    <div className="text-xs text-muted-foreground">{project.client}</div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
