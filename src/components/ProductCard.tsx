import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, Package, CheckCircle, XCircle, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  image: string;
  price: string;
  model: string;
  inStock: boolean;
  features: string[];
  showInProducts: boolean;
  showInFeatured: boolean;
  displayOrder: number;
  category?: string;
  specifications?: Record<string, string>;
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  className = '',
  variant = 'default'
}) => {
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Default behavior - navigate to product detail page using slug if available
      const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
      window.location.href = productUrl;
    }
  };

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Integrate with cart system
      setIsAdding(true);
      
      // Convert Product to cart-compatible format
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g, '')), // Extract numeric value
        image: product.image,
        sku: product.model,
        category: product.category,
        maxQuantity: 99
      };
      
      addToCart(cartProduct);
      
      // Show success animation
      setJustAdded(true);
      setTimeout(() => {
        setIsAdding(false);
        setJustAdded(false);
      }, 1500);
    }
  };

  const cartQuantity = getCartItemQuantity(product.id);
  const productInCart = isInCart(product.id);

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className={`bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group ${className}`}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className={`relative ${isCompact ? 'h-48' : 'h-64'} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg overflow-hidden`}>
          {product.image && product.image !== '/placeholder.svg' ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className={`${isCompact ? 'h-12 w-12' : 'h-16 w-16'} text-gray-400`} />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Quick action overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!isCompact && (
                <Button
                  size="sm"
                  className={cn(
                    "bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-200",
                    justAdded && "bg-green-500 hover:bg-green-600",
                    isAdding && "scale-95"
                  )}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding}
                >
                  {isAdding ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : justAdded ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className={`${isCompact ? 'p-4' : 'p-6'}`}>
          {/* Product Name */}
          <h3 className={`font-bold text-foreground mb-3 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {product.name}
          </h3>
          
          {/* Product Description */}
          <p className={`text-muted-foreground text-sm mb-4 leading-relaxed ${isCompact ? 'line-clamp-2' : ''}`}>
            {product.description}
          </p>
          
          {/* Specifications Box */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 border border-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className={`font-bold text-foreground ${isCompact ? 'text-base' : 'text-lg'}`}>
                {product.price}
              </span>
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              <span className="font-medium">Model:</span> {product.model}
            </div>
            
            {/* Features List */}
            {!isCompact && (
              <ul className="space-y-1">
                {product.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {/* Compact view - show first 2 features */}
            {isCompact && product.features.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Key Features:</span>
                <div className="mt-1">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {feature}
                    </div>
                  ))}
                  {product.features.length > 2 && (
                    <span className="text-xs text-muted-foreground/70">
                      +{product.features.length - 2} more features
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size={isCompact ? "sm" : "sm"} 
              className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors"
              onClick={handleViewDetails}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <Button 
              size={isCompact ? "sm" : "sm"} 
              className={cn(
                "flex-1 bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200",
                justAdded && "bg-green-500 hover:bg-green-600",
                isAdding && "scale-95"
              )}
              disabled={!product.inStock || isAdding}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Adding...
                </>
              ) : justAdded ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Added {productInCart && cartQuantity > 1 && `(${cartQuantity})`}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {productInCart ? `Add to Cart (${cartQuantity})` : 'Add to Cart'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 