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

const ProductDetail = () => {
  const { productId } = useParams();
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate('/products');
        return;
      }

      setLoading(true);
      try {
        // Try to get product by ID first, then by slug
        let productData = await productService.getProductById(productId);
        if (!productData) {
          productData = await productService.getProductBySlug(productId);
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
                {product.rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg text-muted-foreground ml-2">{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="secondary" className="text-primary">
                  {product.category}
                </Badge>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
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

              {/* Short Description */}
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
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
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">{t('productDetail.description')}</TabsTrigger>
                  <TabsTrigger value="specifications">{t('productDetail.specifications')}</TabsTrigger>
                  <TabsTrigger value="examples">{t('productDetail.examples')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.productDescription')}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {product.description}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('productDetail.descriptionText').replace('{productName}', product.name)}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('productDetail.technicalSpecifications')}</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-border">
                            <span className="font-medium">{key}:</span>
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ))}
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
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">{t('productDetail.pastExamples')}</h3>
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('productDetail.relatedProducts')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Card 
                      key={relatedProduct.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => {
                        const productUrl = relatedProduct.slug ? `/products/${relatedProduct.slug}` : `/products/${relatedProduct.id}`;
                        navigate(productUrl);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg mb-4 relative overflow-hidden">
                          {relatedProduct.image && relatedProduct.image !== '/placeholder.svg' ? (
                            <img 
                              src={relatedProduct.image} 
                              alt={relatedProduct.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {relatedProduct.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            ${typeof relatedProduct.price === 'number' ? relatedProduct.price.toFixed(2) : relatedProduct.price}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {relatedProduct.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 