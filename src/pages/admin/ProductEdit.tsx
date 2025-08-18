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

// Predefined product categories
const productCategories = [
  'Waterproofing',
  'Sealants & Adhesives',
  'Redi-Mix G&M',
  'Flooring Systems',
  'Grouts',
  'Coatings',
  'Additives',
  'Adhesives & Sealants',
  'Flooring Solutions',
  'Concrete & Mortar',
  'Protective Coatings',
  'Others (Insulation, Coatings)'
];

export default function ProductEdit() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t } = useAdminLanguage();
  
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
      const productData = await productService.getProduct(productId!); // Load without language to get all translations
      console.log('ProductEdit: Loaded product data:', productData);
      console.log('ProductEdit: Names:', productData?.names);
      console.log('ProductEdit: Descriptions:', productData?.descriptions);
      console.log('ProductEdit: Names object keys:', Object.keys(productData?.names || {}));
      console.log('ProductEdit: Descriptions object keys:', Object.keys(productData?.descriptions || {}));
      
      // Ensure names and descriptions are properly initialized
      if (productData) {
        const initializedProduct = {
          ...productData,
          names: productData.names || {},
          descriptions: productData.descriptions || {}
        };
        
        // Don't override names with defaults - use what's in the database
        console.log('ProductEdit: Final initialized product:', initializedProduct);
        console.log('ProductEdit: Final names object:', initializedProduct.names);
        console.log('ProductEdit: Final descriptions object:', initializedProduct.descriptions);
        
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
      
      // Debug: Log the current product state
      console.log('🔍 ProductEdit: Current product state before save:', {
        id: product.id,
        names: product.names,
        descriptions: product.descriptions,
        category: product.category,
        model: product.model
      });
      
      // Prepare the update data
      const updateData = {
        category: product.category,
        model: product.model,
        inStock: product.inStock,
        showInFeatured: product.showInFeatured,
        isActive: product.isActive,
        names: product.names || {},
        descriptions: product.descriptions || {}
      };

      console.log('📝 ProductEdit: Saving product with data:', updateData);
      console.log('📝 ProductEdit: Names to save:', updateData.names);
      console.log('📝 ProductEdit: Descriptions to save:', updateData.descriptions);

      // Debug: Check if names object has actual values
      Object.entries(updateData.names).forEach(([lang, name]) => {
        console.log(`🌐 Language ${lang}: name = "${name}" (type: ${typeof name}, length: ${name?.length})`);
      });

      // Debug: Check if descriptions object has actual values
      Object.entries(updateData.descriptions).forEach(([lang, desc]) => {
        const descStr = desc as string;
        console.log(`🌐 Language ${lang}: description = "${descStr?.substring(0, 100)}..." (type: ${typeof desc}, length: ${descStr?.length})`);
      });

      // Debug: Check if names object is not empty
      const hasNames = Object.keys(updateData.names).length > 0;
      const hasDescriptions = Object.keys(updateData.descriptions).length > 0;
      console.log(`🔍 Debug: Has names: ${hasNames}, Has descriptions: ${hasDescriptions}`);
      console.log(`🔍 Debug: Names object keys:`, Object.keys(updateData.names));
      console.log(`🔍 Debug: Descriptions object keys:`, Object.keys(updateData.descriptions));
      
      // Debug: Check if names object contains actual string values
      const namesWithValues = Object.entries(updateData.names).filter(([lang, name]) => name && typeof name === 'string' && name.trim().length > 0);
      console.log(`🔍 Debug: Names with actual values:`, namesWithValues);
      console.log(`🔍 Debug: Total names with values: ${namesWithValues.length}`);

      const result = await productService.updateProduct(product.id, updateData);
      console.log('✅ ProductEdit: Save result:', result);
      console.log('✅ ProductEdit: Save result names:', result?.names);
      console.log('✅ ProductEdit: Save result descriptions:', result?.descriptions);
      
      toast.success(t('messages.saveSuccess'));
      
      // Reload the product to show updated data
      await loadProduct();
      
      // Don't navigate away - stay on the edit page to see changes
      toast.success(t('messages.saveAndReload'));
    } catch (error) {
      console.error('❌ ProductEdit: Error saving product:', error);
      toast.error(t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const updateTranslation = (languageCode: string, field: 'name' | 'description', value: string) => {
    if (!product) return;

    console.log(`🔄 ProductEdit: updateTranslation called - Language: ${languageCode}, Field: ${field}, Value: "${value}"`);
    console.log(`🔄 ProductEdit: Current product state before update:`, {
      names: product.names,
      descriptions: product.descriptions
    });

    setProduct(prev => {
      if (!prev) return prev;

      if (field === 'name') {
        const newNames = { ...prev.names, [languageCode]: value };
        console.log(`🔄 ProductEdit: Updated names object:`, newNames);
        return { ...prev, names: newNames };
      } else {
        const newDescriptions = { ...prev.descriptions, [languageCode]: value };
        console.log(`🔄 ProductEdit: Updated descriptions object:`, newDescriptions);
        return { ...prev, descriptions: newDescriptions };
      }
    });
  };

  const updateBasicField = (field: string, value: any) => {
    if (!product) return;
    setProduct(prev => ({ ...prev!, [field]: value }));
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
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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
              <Tabs defaultValue="zh-Hant" className="w-full">
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
                          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            {t('multilingual.productName')} ({lang.nativeName})
                          </label>
                          <Input
                            value={product.names?.[lang.code] || ''}
                            onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
                            placeholder={t('multilingual.enterName')}
                            className="text-lg font-medium"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('multilingual.simpleTextInput')}
                          </p>
                        </div>

                        {/* Product Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t('multilingual.productDescription')} ({lang.nativeName})
                          </label>
                          <SimpleRichTextEditor
                            value={product.descriptions?.[lang.code] || ''}
                            onChange={(value) => updateTranslation(lang.code, 'description', value)}
                            placeholder={t('multilingual.enterDescription')}
                            height="300px"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('multilingual.richTextEditor')}
                          </p>
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
