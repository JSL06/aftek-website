import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Star, Tag, ArrowLeft, ExternalLink, Package, ShoppingCart, Check, ChevronRight, Home, Minus, Plus } from 'lucide-react';
import { productService, UnifiedProduct } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { productId } = useParams();
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItemQuantity, updateQuantity } = useCart();
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
        
        // Get related products from the same category
        const allProducts = await productService.getAllProducts();
        const related = allProducts
          .filter(p => p.id !== productData!.id && p.category === productData!.category && p.isActive)
          .slice(0, 3);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAdding(true);
    
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.-]+/g, '') || '0'),
        image: product.image,
        sku: product.sku || product.model || product.id,
        category: product.category,
        maxQuantity: 99
      };
      
      if (isInCart(product.id)) {
        const currentQuantity = getCartItemQuantity(product.id);
        updateQuantity(product.id, currentQuantity + quantity);
      } else {
        for (let i = 0; i < quantity; i++) {
          addToCart(cartProduct);
        }
      }
      
      setJustAdded(true);
      toast.success(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart`);
      
      setTimeout(() => {
        setIsAdding(false);
        setJustAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
      setIsAdding(false);
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

  const cartQuantity = getCartItemQuantity(product.id);
  const productInCart = isInCart(product.id);

  return (
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-24">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

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

              {/* SKU and Category */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {product.sku && (
                  <span className="text-sm text-muted-foreground">
                    SKU: <span className="font-mono">{product.sku}</span>
                  </span>
                )}
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
                    ✓ In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    ✗ Out of Stock
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
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
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

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 pt-6 border-t">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className={cn(
                      "flex-1 transition-all duration-200",
                      justAdded && "bg-green-500 hover:bg-green-600",
                      isAdding && "scale-95"
                    )}
                    onClick={handleAddToCart}
                    disabled={!(product.inStock || product.in_stock) || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Adding...
                      </>
                    ) : justAdded ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {productInCart ? `Add More (${cartQuantity} in cart)` : 'Add to Cart'}
                      </>
                    )}
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
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {product.description}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.name} is designed to meet the highest standards of quality and performance. 
                      This product combines innovative technology with reliable functionality to deliver 
                      exceptional results for your construction and building needs.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
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
                          Detailed specifications for {product.name} are being updated. 
                          Please contact us for more information.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
                    <p className="text-muted-foreground">
                      Customer reviews are coming soon. Be the first to share your experience with {product.name}.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Related Products</h2>
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
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {relatedProduct.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary">
                            ${typeof relatedProduct.price === 'number' ? relatedProduct.price.toFixed(2) : relatedProduct.price}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {relatedProduct.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    View All Products
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
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