import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, ArrowLeft, Package, Star, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductFilter, { ProductFilters } from '@/components/ProductFilter';
import { useTranslation } from '@/hooks/useTranslation';
import { productService, UnifiedProduct } from '@/services/productService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LanguageSelector, { Language, LANGUAGES } from '@/components/LanguageSelector';
import MultilingualFormField from '@/components/MultilingualFormField';
import TranslationStatus from '@/components/TranslationStatus';
import QuickTranslationCopy from '@/components/QuickTranslationCopy';

interface Product extends UnifiedProduct {
  // Legacy compatibility - all properties now come from UnifiedProduct
}

const FEATURE_OPTIONS = [
  // Application Environment
  'Indoor Use',
  'Outdoor Use',
  'Underwater',
  'High Traffic Areas',
  'Chemical Exposure',
  
  // Properties
  'Waterproof',
  'UV Resistant',
  'Flexible',
  'Fast Cure',
  'High Strength',
  'Low Odor',
  'Chemical Resistant',
  'Temperature Resistant',
  
  // Base Type
  'Polyurethane',
  'Silicone',
  'Acrylic',
  'Epoxy',
  'Hybrid',
  'Cement Based',
  
  // Special Features
  'Eco Friendly',
  'Fire Resistant',
  'Anti Microbial',
  'Self Leveling',
  'Quick Setting',
  'Paintable'
];

const Products = () => {
  const { currentLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    features: [] as string[],
    image: '',
    in_stock: true,
    size: '',
    showInFeatured: false,
    displayOrder: 99,
    // Multilingual content
    translations: {} as Record<string, any>
  });

  const [filters, setFilters] = useState<ProductFilters>({ 
    search: '', 
    category: [],
    features: []
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const categories = [
    'Waterproofing',
    'Sealants & Adhesives',
    'Redi-Mix G&M',
    'Flooring Systems',
    'Others (Insulation, Coatings)'
  ];

  // Filter products based on current filters
  useEffect(() => {
    let filtered = products;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category.includes(product.category)
      );
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(product => {
        const productFeatures = Array.isArray(product.features) 
          ? product.features 
          : [product.features].filter(Boolean);
        return filters.features.some(feature => 
          productFeatures.includes(feature)
        );
      });
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAdminProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      features: [],
      image: '',
      in_stock: true,
      size: '',
      showInFeatured: false,
      displayOrder: 99,
      translations: {}
    });
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Prepare translations data
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        name: lang.code === 'en' ? product.name : (product.names?.[lang.code] || ''),
        description: lang.code === 'en' ? product.description : (product.names?.[`${lang.code}_description`] || ''),
        category: product.category || ''
      };
    });

    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      features: (() => {
        const features = product.features as any;
        if (Array.isArray(features)) {
          return features;
        }
        if (typeof features === 'string' && features && features.length > 0) {
          return [features];
        }
        return [];
      })(),
      image: product.image || '',
      in_stock: product.in_stock !== false,
      size: (product.sizes && product.sizes.length > 0) ? product.sizes[0] : '',
      showInFeatured: product.showInFeatured || false,
      displayOrder: product.displayOrder || 99,
      translations
    });
    setShowForm(true);
  };

  const handleTranslationChange = (language: Language, fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: {
          ...prev.translations[language],
          [fieldName]: value
        }
      }
    }));
  };

  const handleTranslationUpdate = (language: Language, updates: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: {
          ...prev.translations[language],
          ...updates
        }
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Validate required fields for current language
    const currentLangData = formData.translations[selectedLanguage] || {};
    if (!currentLangData.name && !formData.name) {
      toast.error('Please enter a product name.');
      setLoading(false);
      return;
    }

    try {
      // Prepare product data with multilingual content
      const productData: Partial<UnifiedProduct> = {
        name: formData.name || currentLangData.name,
        category: formData.category,
        description: formData.description || currentLangData.description,
        features: formData.features,
        image: formData.image,
        inStock: formData.in_stock,
        in_stock: formData.in_stock,
        showInFeatured: formData.showInFeatured,
        displayOrder: formData.displayOrder,
        names: {}
      };

      // Add multilingual names and descriptions
      LANGUAGES.forEach(lang => {
        const langData = formData.translations[lang.code];
        if (langData?.name) {
          productData.names![lang.code] = langData.name;
        }
        if (langData?.description) {
          productData.names![`${lang.code}_description`] = langData.description;
        }
      });

      if (editingProduct && editingProduct.id) {
        const updated = await productService.updateProduct(editingProduct.id, productData);
        if (updated) {
          toast.success('Product updated successfully!');
        } else {
          throw new Error('Product update failed');
        }
      } else {
        await productService.addProduct(productData);
        toast.success('Product added successfully!');
      }
      
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product: ' + (error.message || error));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setLoading(true);
    try {
      const success = await productService.deleteProduct(id);
      
      if (success) {
        toast.success('Product deleted successfully!');
        await fetchProducts();
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product: ' + (error.message || error));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? '编辑产品' : '添加新产品'}
              </CardTitle>
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
                  translations={formData.translations}
                  requiredFields={['name', 'description']}
                />
              </div>

              {/* Quick Translation Copy */}
              <QuickTranslationCopy
                translations={formData.translations}
                onTranslationUpdate={handleTranslationUpdate}
              />

              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  当前编辑语言: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MultilingualFormField
                    label="产品名称"
                    fieldName="name"
                    type="text"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <MultilingualFormField
                    label="产品描述"
                    fieldName="description"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                      const filePath = `products/${Date.now()}_${sanitizedFileName}`;
                      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                      });
                      if (error) {
                        toast.error('Error uploading image: ' + error.message);
                        return;
                      }
                      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
                      setFormData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
                    }}
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Product" style={{ maxWidth: 200, marginTop: 8 }} />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInFeatured"
                    checked={formData.showInFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInFeatured: checked }))}
                  />
                  <Label htmlFor="showInFeatured">Show in Featured Products</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    className="border rounded p-2 w-full"
                    value={formData.size}
                    onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <option value="">Select size (optional)</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div>
                  <Label>Features</Label>
                  <select
                    multiple
                    className="border rounded p-2 w-full"
                    value={formData.features}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ ...prev, features: selected }));
                    }}
                  >
                    {FEATURE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple features.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Product'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
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
              返回仪表板
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">产品管理</h1>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">产品管理</h1>
            <p className="text-muted-foreground">管理您的产品目录</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            添加产品
          </Button>
        </div>

        <ProductFilter onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const features = product.features as any;
              const safeFeatures: string[] = Array.isArray(features)
                ? features
                : (typeof features === 'string' && features && features.length > 0)
                  ? [features]
                  : [];
              const displayName = product.names && product.names[currentLanguage] ? product.names[currentLanguage] : product.name;

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{displayName}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {safeFeatures.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {safeFeatures.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {safeFeatures.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{safeFeatures.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={product.in_stock ? "default" : "secondary"}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {product.showInFeatured && (
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 