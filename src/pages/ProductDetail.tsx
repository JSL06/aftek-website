import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Star, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
  const { productId } = useParams();
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate('/products');
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
        return;
      }

      setProduct(data);
      setLoading(false);

      // Fetch related products if they exist
      if (data.related_products && Array.isArray(data.related_products) && data.related_products.length > 0) {
        setLoadingRelated(true);
        const { data: relatedData, error: relatedError } = await supabase
          .from('products')
          .select('id, name, category, description, image, names')
          .in('id', data.related_products);
        
        if (!relatedError && relatedData) {
          setRelatedProducts(relatedData);
        }
        setLoadingRelated(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p>{t('products.loading')}</p>
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
            <p>Product not found</p>
            <Button onClick={() => navigate('/products')} className="mt-4">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const safeFeatures = Array.isArray(product.features) ? product.features : [];

  return (
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-24">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('ui.backToProducts')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="h-96 bg-gradient-accent flex items-center justify-center rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-elegant opacity-20"></div>
              <FileText className="h-24 w-24 text-white/80 relative z-10" />
              <span className="absolute bottom-4 left-4 text-white/60 text-sm font-medium z-10">
                {product.image || '[PRODUCT_IMAGE]'}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
                {product.rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg text-muted-foreground ml-2">{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Category Badge */}
              <div className="flex items-center mb-6">
                <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-primary font-medium">{product.category}</span>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price if available */}
              {product.price && (
                <div className="mb-6">
                  <span className="text-2xl text-green-600 font-semibold">{product.price}</span>
                </div>
              )}

              {/* Size if available */}
              {product.size && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Size</h3>
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                    {product.size}
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            {safeFeatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="flex flex-wrap gap-3">
                  {safeFeatures.map((feature: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button size="lg" className="flex-1">
                {t('ui.contactUs')}
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('ui.viewSpecs')}
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                  <p className="text-muted-foreground">
                    Detailed technical specifications and performance data for {product.name}.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Applications</h3>
                  <p className="text-muted-foreground">
                    Common applications and use cases for {product.name}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Products Section */}
        {(relatedProducts.length > 0 || loadingRelated) && (
          <div className="mt-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('ui.relatedProducts')}</h2>
                {loadingRelated ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('ui.loadingRelatedProducts')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <Card 
                        key={relatedProduct.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/products/${relatedProduct.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="h-32 bg-gradient-accent flex items-center justify-center rounded-lg mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-elegant opacity-20"></div>
                            <FileText className="h-8 w-8 text-white/80 relative z-10" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {relatedProduct.names?.[currentLanguage] || relatedProduct.name}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {relatedProduct.description}
                          </p>
                          <div className="mt-4">
                            <span className="text-xs text-primary font-medium">
                              {relatedProduct.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 