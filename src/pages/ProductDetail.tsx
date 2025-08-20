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

const ProductDetail = () => {
  const { productId } = useParams();
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);
  const [allProjects, setAllProjects] = useState<MultilingualProject[]>([]);
  
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

  // Debug logging for product data
  useEffect(() => {
    if (product) {
      console.log('🔍 ProductDetail: Product data loaded:', {
        id: product.id,
        name: product.name,
        related_products: product.related_products,
        related_productsType: typeof product.related_products,
        related_productsIsArray: Array.isArray(product.related_products),
        projects_used: product.projects_used,
        projects_usedType: typeof product.projects_used,
        projects_usedIsArray: Array.isArray(product.projects_used),
        specifications: product.specifications
      });
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate('/products');
        return;
      }

      setLoading(true);
      try {
        // Try to get product by ID first, then by slug
        let productData = await productService.getProduct(productId);
        if (!productData) {
          // If not found by ID, try to find by slug from all products
          const allProducts = await productService.getAllProducts();
          productData = allProducts.find(p => p.slug === productId);
        }
        
        if (!productData) {
          navigate('/products');
          return;
        }

        setProduct(productData);
        
        // Get related products - prioritize manually selected ones, then fallback to category-based
        const allProducts = await productService.getAllProducts();
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
  }, [productId, navigate]);

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


        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl relative overflow-hidden">
              {product.image && product.image !== '/placeholder.svg' ? (
                <img 
                  src={product.image} 
                  alt={product.name}
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
                <h1 className="text-4xl font-bold text-foreground pr-4">{product.name}</h1>
                {/* Rating temporarily removed - property doesn't exist on UnifiedProduct */}
                {/* {product.rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg text-muted-foreground ml-2">{product.rating}</span>
                  </div>
                )} */}
              </div>

              {/* Category */}
              <div className="mb-6">
                <Badge variant="secondary" className="text-sm">
                  {product.category}
                </Badge>
              </div>

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
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{t('productDetail.keyFeatures')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature: string, idx: number) => (
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
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-6 border-t">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{t('productDetail.interestedInProduct')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('productDetail.contactForInfo')}
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate('/contact')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('productDetail.contactUs')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Additional Information Tabs */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <Tabs defaultValue="specifications" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specifications">{t('productDetail.specifications')}</TabsTrigger>
                  <TabsTrigger value="examples">{t('productDetail.examples')}</TabsTrigger>
                  <TabsTrigger value="related">{t('productDetail.relatedProducts')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specifications" className="mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.technicalSpecifications')}</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div>
                        {product.specifications[currentLanguage] ? (
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.specifications[currentLanguage] as string }}
                          />
                        ) : (
                          <div className="bg-muted/50 rounded-lg p-6 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                              {t('productDetail.specificationsText').replace('{productName}', product.name)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-6 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {t('productDetail.specificationsText').replace('{productName}', product.name)}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-6">
                  <div>
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
                                    <h4 className="font-semibold text-lg">{project.title}</h4>
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
                          {t('productDetail.examplesDescription').replace('{productName}', product.name)}
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
                
                <TabsContent value="related" className="mt-6">
                  <div>
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
                                      alt={relatedProduct.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{relatedProduct.name}</h4>
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
                          {t('productDetail.noRelatedProducts').replace('{productName}', product.name)}
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
              </Tabs>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default ProductDetail; 