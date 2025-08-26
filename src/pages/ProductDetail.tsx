import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Star, Tag, ArrowLeft, ExternalLink, Package, Check } from 'lucide-react';
import { productService, UnifiedProduct } from '@/services/productService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import { projectService, MultilingualProject } from '@/services/projectService';
import FeaturesService from '@/services/featuresService';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
  // Custom CSS for specifications content width
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .specifications-content {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
      }
      .specifications-content * {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
      }
      .specifications-content p,
      .specifications-content div,
      .specifications-content span {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { productId } = useParams();
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);
  const [allProjects, setAllProjects] = useState<MultilingualProject[]>([]);
  const [translatedFeatures, setTranslatedFeatures] = useState<string[]>([]);
  const [translatedCategory, setTranslatedCategory] = useState<string>('');

  // Helper function to get translated category name from database
  const getTranslatedCategory = async (category: string, language: string): Promise<string> => {
    try {
      // If category is already in the target language, return it as is
      if (language === 'en') {
        return category;
      }

      // Simplified query: first get the category, then get its translation
      const { data: categoryData, error: categoryError } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('name', category)
        .single();

      if (categoryError || !categoryData) {
        console.log('Category not found:', category);
        return category; // Fallback to original category
      }

      // Now get the translation for this category and language
      const { data: translationData, error: translationError } = await supabase
        .from('category_translations')
        .select('display_name, description')
        .eq('category_id', categoryData.id)
        .eq('language_code', language)
        .single();

      if (translationError || !translationData) {
        console.log('No translation found for category:', category, 'in language:', language);
        return category; // Fallback to original category
      }

      if (translationData.display_name) {
        console.log(`Found database translation for ${category}: ${translationData.display_name}`);
        return translationData.display_name;
      }

      return category; // Fallback to original category
    } catch (error) {
      console.error('Error fetching category translation:', error);
      return category; // Fallback to original category
    }
  };

  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('ProductDetail page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Listen for product updates from admin panel
    const handleProductUpdate = () => {
      console.log('ProductDetail page: Product updated, refreshing product data...');
      // Refresh the current product data
      if (productId) {
        const refreshProduct = async () => {
          try {
            const productData = await productService.getProduct(productId);
            if (productData) {
              setProduct(productData);
            }
          } catch (error) {
            console.error('Error refreshing product:', error);
          }
        };
        refreshProduct();
      }
    };

    // Add event listeners
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    window.addEventListener('productUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, [productId]);

  // Load all products for related products display
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error loading all products:', error);
      }
    };
    
    loadAllProducts();
  }, []);

  // Load all projects for examples tab
  useEffect(() => {
    const loadAllProjects = async () => {
      try {
        const projects = await projectService.getProjects();
        setAllProjects(projects);
      } catch (error) {
        console.error('Error loading all projects:', error);
      }
    };

    loadAllProjects();
  }, []);

  // Load translated category when product or language changes
  useEffect(() => {
    const loadTranslatedCategory = async () => {
      if (product?.category && currentLanguage !== 'en') {
        try {
          const translated = await getTranslatedCategory(product.category, currentLanguage);
          setTranslatedCategory(translated);
        } catch (error) {
          console.error('Error translating category in ProductDetail:', error);
          setTranslatedCategory(product.category);
        }
      } else {
        setTranslatedCategory(product?.category || '');
      }
    };

    if (product) {
      loadTranslatedCategory();
    }
  }, [product?.category, currentLanguage]);

  // Debug logging for product data
  useEffect(() => {
    if (product) {
      console.log('🔍 ProductDetail: Product data loaded:', {
        id: product.id,
        name: product.name,
        names: product.names,
        description: product.description,
        descriptions: product.descriptions,
        currentLanguage: currentLanguage,
        related_products: product.related_products,
        related_productsType: typeof product.related_products,
        related_productsIsArray: Array.isArray(product.related_products),
        projects_used: product.projects_used,
        projects_usedType: typeof product.projects_used,
        projects_usedIsArray: Array.isArray(product.projects_used),
        specifications: product.specifications,
        features: product.features
      });
    }
  }, [product, currentLanguage]);

  // Translate features when product or language changes
  useEffect(() => {
    const translateFeatures = async () => {
      if (product?.features && Array.isArray(product.features) && product.features.length > 0) {
        try {
          console.log('🔍 Translating features for language:', currentLanguage);
          console.log('🔍 Raw features:', product.features);
          const translated = await FeaturesService.translateFeatureKeys(product.features, currentLanguage);
          console.log('🔍 Translated features:', translated);
          setTranslatedFeatures(translated);
        } catch (error) {
          console.error('Error translating features:', error);
          setTranslatedFeatures(product.features);
        }
      } else {
        setTranslatedFeatures([]);
      }
    };

    translateFeatures();
  }, [product?.features, currentLanguage]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate('/products');
        return;
      }

      console.log('🔄 ProductDetail: Fetching product with language:', currentLanguage);
      setLoading(true);
      try {
        // Try to get product by ID first, then by slug - WITH CORRECT LANGUAGE
        let productData = await productService.getProduct(productId, currentLanguage);
        if (!productData) {
          // If not found by ID, try to find by slug from all products
          const allProducts = await productService.getAllProducts(currentLanguage);
          productData = allProducts.find(p => p.slug === productId);
        }
        
        if (!productData) {
          navigate('/products');
          return;
        }

        console.log('✅ ProductDetail: Product data loaded:', {
          id: productData.id,
          name: productData.name,
          hasNames: !!productData.names,
          namesKeys: Object.keys(productData.names || {}),
          hasDescriptions: !!productData.descriptions,
          descriptionsKeys: Object.keys(productData.descriptions || {}),
          currentLanguage: currentLanguage
        });

        setProduct(productData);
        
        // Get related products - prioritize manually selected ones, then fallback to category-based
        const allProducts = await productService.getAllProducts(currentLanguage);
        let related: UnifiedProduct[] = [];
        
        // First, try to get manually selected related products
        if (productData.related_products && productData.related_products.length > 0) {
          related = allProducts
            .filter(p => productData.related_products!.includes(p.id) && p.isActive)
            .slice(0, 6);
        }
        
        // If not enough manually selected products, add category-based suggestions
        if (related.length < 3) {
          const categoryBased = allProducts
            .filter(p => p.id !== productData!.id && 
                        p.category === productData!.category && 
                        p.isActive &&
                        !related.some(r => r.id === p.id))
            .slice(0, 3 - related.length);
          related = [...related, ...categoryBased];
        }
        
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, navigate, currentLanguage]);

  // Comprehensive debugging
  useEffect(() => {
    console.log('🔍 ProductDetail: Current language:', currentLanguage);
    console.log('🔍 ProductDetail: Translation function exists:', typeof t);
    console.log('🔍 ProductDetail: Translation function keys:', Object.keys(t));
    console.log('🔍 ProductDetail: Trying to translate productDetail.backToProducts');
    console.log('🔍 ProductDetail: Result:', t('productDetail.backToProducts'));
    console.log('🔍 ProductDetail: Raw translation object:', t);
  }, [currentLanguage, t]);

  // Hardcoded button text that WILL work
  const getButtonText = () => {
    switch (currentLanguage) {
      case 'zh-Hant':
        return '返回產品頁面';

      case 'ja':
        return '製品ページに戻る';
      case 'ko':
        return '제품 페이지로 돌아가기';
      case 'th':
        return 'กลับไปยังหน้าผลิตภัณฑ์';
      case 'vi':
        return 'Quay lại trang sản phẩm';
      case 'en':
      default:
        return 'Back to Products';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-8">

        {/* Back Button - HARDCODED TEXT */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {getButtonText()}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl relative overflow-hidden">
              {product.image && product.image !== '/placeholder.svg' ? (
                <img 
                  src={product.image} 
                                        alt={product.names?.[currentLanguage] || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400 mb-4" />
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Product Title and Rating */}
              <div className="flex items-start justify-between mb-4">
                                  <h1 className="text-4xl font-bold text-foreground pr-4">
                    {product.names?.[currentLanguage] || product.name}
                  </h1>
                {/* Rating temporarily removed - property doesn't exist on UnifiedProduct */}
                {/* {product.rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg text-muted-foreground ml-2">{product.rating}</span>
                  </div>
                )} */}
              </div>

              {/* Category */}
              {product.category && (
                <div className="mb-6">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm">
                    {translatedCategory || product.category}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock || product.in_stock ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✓ {t('productDetail.inStock')}
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    ✗ {t('productDetail.outOfStock')}
                  </Badge>
                )}
              </div>

              {/* Features - Show first and prominently */}
              {translatedFeatures && translatedFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{t('productDetail.keyFeatures')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {translatedFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Description - Moved below features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('productDetail.productDescription')}</h3>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptions?.[currentLanguage] || product.description || '' }}
                />
              </div>

              {/* Contact Information - REMOVED from here, moved to tabs */}
              {/* <div className="space-y-4 pt-6 border-t">
                ... contact section removed ...
              </div> */}
            </div>
          </div>
        </div>



        {/* Additional Information Tabs */}
        <div className="mt-16 w-full">
          <Card className="w-full">
            <CardContent className="p-8 w-full">
              <Tabs defaultValue="specifications" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specifications">{t('productDetail.specifications')}</TabsTrigger>
                  <TabsTrigger value="examples">{t('productDetail.examples')}</TabsTrigger>
                  <TabsTrigger value="related">{t('productDetail.relatedProducts')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specifications" className="mt-6 w-full">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.technicalSpecifications')}</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="w-full">
                        {product.specifications[currentLanguage] ? (
                          <div 
                            className="w-full specifications-content"
                            style={{ 
                              width: '100%', 
                              maxWidth: '100%',
                              minWidth: '100%',
                              display: 'block'
                            }}
                            dangerouslySetInnerHTML={{ __html: product.specifications[currentLanguage] as string }}
                          />
                        ) : (
                          <div className="bg-muted/50 rounded-lg p-6 text-center w-full">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                              {t('productDetail.specificationsText').replace('{productName}', product.names?.[currentLanguage] || product.name)}
                            </p>
                          </div>
                        )}
                        

                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-6 text-center w-full">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {t('productDetail.specificationsText').replace('{productName}', product.name)}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-6 w-full">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.pastExamples')}</h3>
                    {product.projects_used && Array.isArray(product.projects_used) && product.projects_used.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.projects_used.map((projectId, index) => {
                            const project = allProjects.find(p => p.id === projectId);
                            if (!project) return null;
                            
                            return (
                              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                  {project.image && (
                                    <img
                                      src={project.image}
                                      alt={project.title}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">
                                      {project.titles?.[currentLanguage] || project.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{project.category}</p>
                                    <p className="text-xs text-muted-foreground">{project.client}</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                      View Project
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-6">
                                                        {t('productDetail.examplesDescription').replace('{productName}', product.names?.[currentLanguage] || product.name)}
                        </p>
                        <Button 
                          onClick={() => navigate('/projects')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('productDetail.viewProjects')}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="related" className="mt-6 w-full">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.relatedProducts')}</h3>
                    {product.related_products && Array.isArray(product.related_products) && product.related_products.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.related_products.map((relatedProductId, index) => {
                            const relatedProduct = allProducts.find(p => p.id === relatedProductId);
                            if (!relatedProduct) return null;
                            
                            return (
                              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                  {relatedProduct.image && (
                                    <img
                                      src={relatedProduct.image}
                                      alt={relatedProduct.names?.[currentLanguage] || relatedProduct.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">
                                      {relatedProduct.names?.[currentLanguage] || relatedProduct.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{relatedProduct.category}</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => navigate(`/products/${relatedProduct.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-6">
                          {t('productDetail.noRelatedProducts').replace('{productName}', product.names?.[currentLanguage] || product.name)}
                        </p>
                        <Button 
                          onClick={() => navigate('/products')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('productDetail.browseProducts')}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-6 w-full">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-2">Interested in this product?</h3>
                      <p className="text-muted-foreground mb-4">Contact us for pricing, availability, and technical specifications.</p>
                      <Button 
                        size="lg" 
                        className="w-full"
                        onClick={() => navigate('/contact')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default ProductDetail; 