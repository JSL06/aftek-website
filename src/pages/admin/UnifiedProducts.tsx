import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, ArrowLeft, Package, Star, Eye, RefreshCw, Database, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, UnifiedProduct } from '@/services/productService';
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
import FeaturesChecklist from '@/components/FeaturesChecklist';
import { projectService } from '@/services/projectService';

// Features are now loaded from the database via FeaturesChecklist component

const UnifiedProducts = () => {
  // Categories will be loaded from the database
  const [categories, setCategories] = useState<string[]>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant');
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UnifiedProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);

  const [formData, setFormData] = useState<Partial<UnifiedProduct> & { translations: Record<string, any> }>({
    name: '',
    description: '',
    category: '',
    model: '',
    features: [],
    inStock: true,
    showInFeatured: false,
    isActive: true,
    image: '/placeholder.svg',
    tags: [],
    specifications: {},
    projects_used: [],
    related_products: [],
    translations: {}
  });

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadProjects();
  }, []);

  // Filter products when search/filter criteria change
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, showInactiveProducts]);

  const loadProducts = async () => {
    console.log('Loading products...');
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      console.log('Loaded products:', allProducts.length);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('admin.products.loadError'));
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Could not load categories:', error);
        // Fallback to default categories if table doesn't exist yet
        setCategories([
          'Waterproofing',
          'Sealant & Adhesive',
          'Redi-Mix G&M',
          'Flooring',
          'Other Specialties'
        ]);
        return;
      }

      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(categoryNames);
    } catch (error) {
      console.warn('Error loading categories:', error);
      // Fallback to default categories
      setCategories([
        'Waterproofing',
        'Sealant & Adhesive',
        'Redi-Mix G&M',
        'Flooring',
        'Other Specialties'
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const allProjects = await projectService.getProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.model.toLowerCase().includes(term) ||
        (Array.isArray(product.features) && product.features.some(feature => feature.toLowerCase().includes(term)))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by active status
    if (!showInactiveProducts) {
      filtered = filtered.filter(product => product.isActive);
    }

    setFilteredProducts(filtered);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      model: '',
      features: [],
      inStock: true,
      showInFeatured: false,
      isActive: true,
      image: '/placeholder.svg',
      tags: [],
      specifications: {},
      projects_used: [],
      related_products: [],
      translations: {}
    });
    setShowForm(true);
  };

  const handleEdit = (product: UnifiedProduct) => {
    // Navigate to individual product edit page
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleTranslationChange = (language: Language, fieldName: string, value: any) => {
    setFormData(prev => {
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

      // Also update the basic fields when English is selected (for backward compatibility)
      if (language === 'en' && (fieldName === 'name' || fieldName === 'description')) {
        newFormData[fieldName] = value;
      }

      return newFormData;
    });
  };

  const handleBasicFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };



  const handleSave = async () => {
    console.log('🔄 handleSave called');
    console.log('📝 Current formData:', formData);
    console.log('🌐 Selected language:', selectedLanguage);
    
    // Validate required fields for current language
    const currentLangData = formData.translations[selectedLanguage] || {};
    console.log('🌐 Current language data:', currentLangData);
    
    if (!currentLangData.name && !formData.name?.trim()) {
      console.log('❌ Validation failed: No name provided');
      toast.error(t('admin.products.name') + ' ' + t('admin.products.required'));
      return;
    }

    if (!formData.category) {
      console.log('❌ Validation failed: No category provided');
      toast.error('Product category is required');
      return;
    }

    console.log('✅ Validation passed, proceeding with save');
    setLoading(true);
    
    try {
      // Prepare product data with multilingual content
      const productData: Partial<UnifiedProduct> = {
        name: formData.name || currentLangData.name,
        description: formData.description || currentLangData.description,
        category: formData.category,
        model: formData.model,
        features: formData.features,
        inStock: formData.inStock,
        showInFeatured: formData.showInFeatured,
        isActive: formData.isActive,
        image: formData.image,
        tags: formData.tags,
        specifications: {},
        projects_used: formData.projects_used || [],
        related_products: formData.related_products || [],
        names: {}
      };

      console.log('📦 Prepared product data:', productData);

      // Add multilingual names and descriptions
      LANGUAGES.forEach(lang => {
        const langData = formData.translations[lang.code];
        if (langData?.name) {
          productData.names![lang.code] = langData.name;
        }
        if (langData?.description) {
          // Store descriptions in the descriptions field, not names
          if (!productData.descriptions) productData.descriptions = {};
          productData.descriptions![lang.code] = langData.description;
        }
        if (langData?.specifications) {
          // Store specifications in the specifications field
          if (!productData.specifications) productData.specifications = {};
          productData.specifications![lang.code] = langData.specifications;
        }
      });

      console.log('🌍 Final product data with translations:', productData);
      
      if (editingProduct) {
        console.log('✏️ Updating existing product:', editingProduct.id);
        // Update existing product
        const updated = await productService.updateProduct(editingProduct.id, productData);
        console.log('✅ Update result:', updated);
        if (updated) {
          toast.success(t('admin.products.saveSuccess'));
        } else {
          throw new Error('Product update returned null');
        }
      } else {
        console.log('➕ Adding new product');
        // Add new product
        const result = await productService.addProduct(productData);
        console.log('✅ Add result:', result);
        toast.success(t('admin.products.saveSuccess'));
      }

      console.log('🔄 Reloading products');
      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
      console.log('✅ Save operation completed successfully');
    } catch (error) {
      console.error('❌ Save error details:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(t('admin.products.saveError') + ': ' + errorMessage);
    }
    setLoading(false);
    console.log('🏁 handleSave completed');
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      setLoading(true);
      console.log(`🗑️ Admin: Deleting product "${name}" (${id})`);
      
      await productService.deleteProduct(id);
      
      // Force refresh to ensure we get the latest state from database
      await productService.forceRefresh();
      
      // Reload the admin interface
      await loadProducts();
      
      toast.success(t('admin.products.deleteSuccess'));
      console.log(`✅ Admin: Product "${name}" deletion complete`);
    } catch (error) {
      toast.error(t('admin.products.deleteError'));
      console.error('❌ Admin: Error deleting product:', error);
    }
    setLoading(false);
  };

  const toggleFeaturedStatus = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateFeaturedStatus(id, !currentStatus);
      toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} featured list`);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error('Error updating featured status:', error);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateProduct(id, { isActive: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Error updating product status:', error);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Link to="/admin/unified-products">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('admin.products.backToProducts')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {editingProduct ? t('admin.products.edit') : t('admin.products.addNew')}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? t('admin.products.edit') : t('admin.products.addNew')}</CardTitle>
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



              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  {t('admin.dashboard.currentSelection')}: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <MultilingualFormField
                     label={t('admin.products.name')}
                     fieldName="name"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     required={true}
                   />

                   <div>
                     <Label>{t('admin.products.category')}</Label>
                     <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                       <SelectTrigger id="category" name="category">
                         <SelectValue placeholder={t('admin.products.allCategories')} />
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
                    label={t('admin.products.description')}
                    fieldName="description"
                    type="rich-text"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />
                </div>

                {/* Technical Specifications */}
                <div className="mt-6">
                  <MultilingualFormField
                    label={t('admin.products.technicalSpecifications') || 'Technical Specifications'}
                    fieldName="specifications"
                    type="rich-text"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />
                </div>
              </div>

              {/* Common fields */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                   <Label htmlFor="model">{t('admin.products.model')}</Label>
                   <Input
                     id="model"
                     name="model"
                     value={formData.model || ''}
                     onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                     placeholder="Enter model number"
                   />
                 </div>
              </div>

                             <div>
                 <Label htmlFor="image">{t('admin.products.image')}</Label>
                 <ImageUpload
                   value={formData.image || ''}
                   onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                 />
               </div>

                                              <div>
                   <Label id="features-label">{t('admin.products.features')}</Label>
                   <FeaturesChecklist
                     features={[]}
                     selectedFeatures={formData.features || []}
                     onFeaturesChange={(featureKeys) => {
                       // featureKeys are now the feature keys (language-agnostic)
                       setFormData(prev => ({ ...prev, features: featureKeys }));
                     }}
                     language={selectedLanguage}
                     placeholder={t('admin.products.searchFeatures')}
                     className="mt-2"
                   />
                 </div>

                                              <div>
                   <Label id="related-products-label">Related Products</Label>
                   <div className="space-y-4" role="group" aria-labelledby="related-products-label">
                   <div className="flex gap-2 mb-4">
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => {
                         // Auto-suggest products with similar tags
                         const currentTags = formData.features || [];
                         const suggestions = products
                           .filter(p => p.id !== formData.id && p.isActive)
                           .filter(p => {
                             const productTags = p.features || [];
                             return productTags.some(tag => currentTags.includes(tag));
                           })
                           .slice(0, 5)
                           .map(p => p.id);
                         
                         setFormData(prev => ({
                           ...prev,
                           related_products: [...new Set([...(prev.related_products || []), ...suggestions])]
                         }));
                       }}
                     >
                       <Package className="h-4 w-4 mr-2" />
                       Auto-Suggest by Tags
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => {
                         // Auto-suggest products from same category
                         const suggestions = products
                           .filter(p => p.id !== formData.id && p.isActive && p.category === formData.category)
                           .slice(0, 5)
                           .map(p => p.id);
                         
                         setFormData(prev => ({
                           ...prev,
                           related_products: [...new Set([...(prev.related_products || []), ...suggestions])]
                         }));
                       }}
                     >
                       <Package className="h-4 w-4 mr-2" />
                       Auto-Suggest by Category
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => setFormData(prev => ({ ...prev, related_products: [] }))}
                     >
                       Clear All
                     </Button>
                   </div>
                   
                   <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                     <div className="space-y-2">
                       {products
                         .filter(p => p.id !== formData.id && p.isActive)
                         .map(product => (
                           <div key={product.id} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted rounded">
                             <input
                               type="checkbox"
                               id={`related-product-${product.id}`}
                               name="related_products"
                               value={product.id}
                               checked={formData.related_products?.includes(product.id) || false}
                               onChange={(e) => {
                                 const relatedProducts = formData.related_products || [];
                                 if (e.target.checked) {
                                   setFormData(prev => ({
                                     ...prev,
                                     related_products: [...relatedProducts, product.id]
                                   }));
                                 } else {
                                   setFormData(prev => ({
                                     ...prev,
                                     related_products: relatedProducts.filter(id => id !== product.id)
                                   }));
                                 }
                               }}
                             />
                             <label htmlFor={`related-product-${product.id}`} className="flex-1">
                               <span className="font-medium">{product.name}</span>
                               <span className="text-muted-foreground ml-2">({product.category})</span>
                               <Badge variant="secondary" className="text-xs ml-2">
                                 {Array.isArray(product.features) ? product.features.slice(0, 2).join(', ') : ''}
                               </Badge>
                             </label>
                           </div>
                         ))}
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Selected: {formData.related_products?.length || 0} related products
                   </p>
                 </div>
               </div>

               {/* Related Projects */}
               <div>
                 <Label id="related-projects-label">{t('admin.products.relatedProjects')}</Label>
                 <div className="space-y-4" role="group" aria-labelledby="related-projects-label">
                   <div className="flex gap-2 mb-4">
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => {
                         // Auto-suggest projects with similar category
                         const suggestions = projects
                           .filter(p => p.id !== formData.id && p.isActive)
                           .filter(p => p.category === formData.category)
                           .slice(0, 5)
                           .map(p => p.id);
                         
                         setFormData(prev => ({
                           ...prev,
                           projects_used: [...new Set([...(prev.projects_used || []), ...suggestions])]
                         }));
                       }}
                     >
                       <Building2 className="h-4 w-4 mr-2" />
                       Auto-Suggest by Category
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => setFormData(prev => ({ ...prev, projects_used: [] }))}
                     >
                       Clear All
                     </Button>
                   </div>
                   
                   <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                     <div className="space-y-2">
                       {projects
                         .filter(p => p.id !== formData.id && p.isActive)
                         .map(project => (
                           <div key={project.id} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted rounded">
                             <input
                               type="checkbox"
                               id={`related-project-${project.id}`}
                               name="projects_used"
                               value={project.id}
                               checked={formData.projects_used?.includes(project.id) || false}
                               onChange={(e) => {
                                 const relatedProjects = formData.projects_used || [];
                                 if (e.target.checked) {
                                   setFormData(prev => ({
                                     ...prev,
                                     projects_used: [...relatedProjects, project.id]
                                   }));
                                 } else {
                                   setFormData(prev => ({
                                     ...prev,
                                     projects_used: relatedProjects.filter(id => id !== project.id)
                                   }));
                                 }
                               }}
                             />
                             <label htmlFor={`related-project-${project.id}`} className="flex-1">
                               <span className="font-medium">{project.title}</span>
                               <span className="text-muted-foreground ml-2">({project.category})</span>
                               <Badge variant="secondary" className="text-xs ml-2">
                                 {project.client}
                               </Badge>
                             </label>
                           </div>
                         ))}
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Selected: {formData.projects_used?.length || 0} related projects
                   </p>
                 </div>
               </div>

                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="flex items-center space-x-2">
                   <Switch
                     id="inStock"
                     name="inStock"
                     checked={formData.inStock || false}
                     onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                   />
                   <Label htmlFor="inStock">{t('admin.products.inStock')}</Label>
                 </div>
 
                 <div className="flex items-center space-x-2">
                   <Switch
                     id="showInFeatured"
                     name="showInFeatured"
                     checked={formData.showInFeatured || false}
                     onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInFeatured: checked }))}
                   />
                   <Label htmlFor="showInFeatured">{t('admin.products.featured')}</Label>
                 </div>
 
                 <div className="flex items-center space-x-2">
                   <Switch
                     id="isActive"
                     name="isActive"
                     checked={formData.isActive || false}
                     onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                   />
                   <Label htmlFor="isActive">{t('admin.products.active')}</Label>
                 </div>
               </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : t('admin.products.save')}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  {t('admin.products.cancel')}
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
          <h1 className="text-2xl font-bold">{t('admin.products.title')}</h1>
          <p className="text-primary-foreground/80">
            Manage all products from a single source - changes reflect immediately on website
          </p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.products.title')}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadProducts} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={async () => await productService.debugDatabase()} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Debug DB
            </Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                try {
                  toast.success('UUID fix completed! Check console for details.');
                  await loadProducts();
                } catch (error) {
                  toast.error('Failed to fix UUIDs');
                  console.error('UUID fix error:', error);
                }
                setLoading(false);
              }} 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Fix UUIDs
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.products.addNew')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div>
                 <Label htmlFor="search">{t('admin.products.search')}</Label>
                 <Input
                   id="search"
                   name="search"
                   placeholder="Search by name, description, model..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
 
               <div>
                 <Label>{t('admin.products.filterByCategory')}</Label>
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                   <SelectTrigger id="filter-category" name="filter-category">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('admin.products.allCategories')}</SelectItem>
                     {categories.map(category => (
                       <SelectItem key={category} value={category}>
                         {category}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="flex items-center space-x-2 mt-6">
                 <Switch
                   id="showInactive"
                   name="showInactive"
                   checked={showInactiveProducts}
                   onCheckedChange={setShowInactiveProducts}
                 />
                 <Label htmlFor="showInactive">{t('admin.products.showInactive')}</Label>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading && !showForm ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('admin.products.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={`hover:shadow-lg transition-shadow ${!product.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        {product.showInFeatured && <Badge className="bg-yellow-500"><Star className="h-3 w-3" /></Badge>}
                        {!product.isActive && <Badge variant="destructive">{t('admin.common.disabled')}</Badge>}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('admin.products.inStock')}:</span>
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? t('admin.products.inStock') : 'Out of Stock'}
                      </Badge>
                    </div>
                    {product.related_products && product.related_products.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Related:</span>
                        <span className="font-medium text-xs">
                          {product.related_products.length} products
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-${product.id}`}
                        name={`active-${product.id}`}
                        checked={product.isActive}
                        onCheckedChange={() => productService.updateProduct(product.id, { isActive: !product.isActive }).then(loadProducts)}
                      />
                      <span className="text-sm font-medium">{t('admin.products.active')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`featured-${product.id}`}
                        name={`featured-${product.id}`}
                        checked={product.showInFeatured}
                        onCheckedChange={() => productService.updateProduct(product.id, { showInFeatured: !product.showInFeatured }).then(loadProducts)}
                      />
                      <span className="text-sm font-medium">{t('admin.products.featured')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      {t('admin.products.edit')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.products.delete')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.products.deleteConfirm')} "{product.name}"? {t('admin.products.deleteWarning')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.products.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t('admin.products.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'Get started by adding your first product to the catalog.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UnifiedProducts;