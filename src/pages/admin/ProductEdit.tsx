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
 * - SimpleRichTextEditor component
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
import { ArrowLeft, Type, FileText, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService, UnifiedProduct } from '@/services/productService';
import SimpleRichTextEditor from '@/components/SimpleRichTextEditor';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';

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
  const { t } = useAdminLanguage();
  
  // Use dynamic categories from the database instead of hardcoded list
  const { categories: productCategories } = useCategories('en');
  
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // CRITICAL FIX: Load product with explicit language to ensure translations are loaded
      const productData = await productService.getProduct(productId!, 'en');
      console.log('ProductEdit: Loaded product data:', productData);
      console.log('ProductEdit: Names:', productData?.names);
      console.log('ProductEdit: Descriptions:', productData?.descriptions);
      console.log('ProductEdit: Names object keys:', Object.keys(productData?.names || {}));
      console.log('ProductEdit: Descriptions object keys:', Object.keys(productData?.descriptions || {}));
      
      // Ensure names and descriptions are properly initialized
      if (productData) {
        const initializedProduct = {
          ...productData,
          // CRITICAL FIX: Ensure names and descriptions are always objects, never undefined
          names: productData.names || {},
          descriptions: productData.descriptions || {}
        };
        
        // CRITICAL FIX: Log the exact structure being set
        console.log('ProductEdit: Final initialized product:', {
          id: initializedProduct.id,
          names: initializedProduct.names,
          descriptions: initializedProduct.descriptions,
          namesType: typeof initializedProduct.names,
          descriptionsType: typeof initializedProduct.descriptions,
          namesKeys: Object.keys(initializedProduct.names),
          descriptionsKeys: Object.keys(initializedProduct.descriptions)
        });
        
        setProduct(initializedProduct);
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
      
      // UNIFIED SAVE: Prepare ALL data together (categories, names, descriptions, everything)
      console.log('🔍 UNIFIED SAVE: Preparing all data for unified save operation');
      console.log('🔍 UNIFIED SAVE: Current product state:', {
        id: product.id,
        category: product.category,
        model: product.model,
        inStock: product.inStock,
        showInFeatured: product.showInFeatured,
        isActive: product.isActive,
        names: product.names,
        descriptions: product.descriptions
      });
      
      const updateData = {
        // Basic fields (category, model, checkboxes)
        category: product.category,
        model: product.model,
        inStock: product.inStock,
        showInFeatured: product.showInFeatured,
        isActive: product.isActive,
        
        // Multilingual content (names and descriptions for all languages)
        names: product.names || {},
        descriptions: product.descriptions || {}
      };

      console.log('📝 UNIFIED SAVE: Complete data being sent to service:', updateData);
      console.log('📝 UNIFIED SAVE: Names object:', updateData.names);
      console.log('📝 UNIFIED SAVE: Descriptions object:', updateData.descriptions);
      console.log('📝 UNIFIED SAVE: Basic fields:', {
        category: updateData.category,
        model: updateData.model,
        inStock: updateData.inStock,
        showInFeatured: updateData.showInFeatured,
        isActive: updateData.isActive
      });
      console.log('📝 UNIFIED SAVE: Basic fields type check:', {
        categoryType: typeof updateData.category,
        modelType: typeof updateData.model,
        categoryValue: updateData.category,
        modelValue: updateData.model
      });

      // UNIFIED SAVE: Send everything to the service in one operation
      const result = await productService.updateProduct(product.id, updateData);
      console.log('✅ UNIFIED SAVE: Service result:', result);
      
      // Don't update local state with server result - it might overwrite our changes
      // The local state already has the correct data from user edits
      // This prevents the "edits disappearing" bug
      
      toast.success(t('messages.saveSuccess'));
      
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
    navigate('/admin/products');
  };

  const updateTranslation = (languageCode: string, field: 'name' | 'description', value: string) => {
    if (!product) return;

    console.log(`🔄 UPDATE DEBUG: updateTranslation called - Language: ${languageCode}, Field: ${field}, Value: "${value}"`);
    console.log(`🔄 UPDATE DEBUG: Current product state before update:`, {
      names: product.names,
      descriptions: product.descriptions
    });

    setProduct(prev => {
      if (!prev) return prev;

      if (field === 'name') {
        const newNames = { ...prev.names, [languageCode]: value };
        console.log(`🔄 UPDATE DEBUG: Updated names object:`, newNames);
        const updatedProduct = { ...prev, names: newNames };
        console.log(`🔄 UPDATE DEBUG: Product state after name update:`, updatedProduct);
        return updatedProduct;
      } else {
        const newDescriptions = { ...prev.descriptions, [languageCode]: value };
        console.log(`🔄 UPDATE DEBUG: Updated descriptions object:`, newDescriptions);
        const updatedProduct = { ...prev, descriptions: newDescriptions };
        console.log(`🔄 UPDATE DEBUG: Product state after description update:`, updatedProduct);
        return updatedProduct;
      }
    });
  };

  const updateBasicField = (field: string, value: any) => {
    if (!product) return;
    console.log(`🔍 updateBasicField called - Field: ${field}, Value: "${value}"`);
    console.log(`🔍 Current product state before update:`, {
      category: product.category,
      model: product.model,
      inStock: product.inStock,
      showInFeatured: product.showInFeatured,
      isActive: product.isActive
    });
    
    setProduct(prev => {
      const updated = { ...prev!, [field]: value };
      console.log(`🔍 Product state after ${field} update:`, {
        category: updated.category,
        model: updated.model,
        inStock: updated.inStock,
        showInFeatured: updated.showInFeatured,
        isActive: updated.isActive
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
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Basic Info - Left Sidebar */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t('basic.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
        <div className="xl:col-span-3">
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
                          <SimpleRichTextEditor
                            value={product.descriptions?.[lang.code] || ''}
                            onChange={(value) => updateTranslation(lang.code, 'description', value)}
                            placeholder={t('multilingual.enterDescription')}
                            height="300px"
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
    </div>
  );
}
