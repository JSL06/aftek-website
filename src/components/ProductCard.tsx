import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Package, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { cn } from '../lib/utils';

import { UnifiedProduct } from '@/services/productService';

interface ProductCardProps {
  product: UnifiedProduct;
  onViewDetails?: (product: UnifiedProduct) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  className = '',
  variant = 'default'
}) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Default behavior - navigate to product detail page using slug if available
      const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
      window.location.href = productUrl;
    }
  };

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
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
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
                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </span>
              <div className="flex items-center gap-2">
                {product.inStock || product.in_stock ? (
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
              <span className="font-medium">Model:</span> {product.model || product.sku}
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
          
          {/* Action Button */}
          <Button 
            variant="outline" 
            size={isCompact ? "sm" : "sm"} 
            className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
            onClick={handleViewDetails}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 