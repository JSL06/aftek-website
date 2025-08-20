import React, { useEffect } from 'react';
import { X, Package, CheckCircle, XCircle, Star, Tag, Link, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedProduct } from '@/services/productService';
import { cn } from '@/lib/utils';

// Helper function to extract plain text from HTML content
const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to safely render HTML content
const renderHtmlContent = (html: string): React.ReactElement => {
  if (!html) return <></>;
  
  return (
    <div 
      className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface ProductDetailsModalProps {
  product: UnifiedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Product Details</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Product Image and Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                  {product.image && product.image !== '/placeholder.svg' ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                
                {/* Quick Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {product.inStock || product.in_stock ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">In Stock</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Out of Stock</span>
                      </>
                    )}
                  </div>
                  
                  {product.showInFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                </div>

                {/* Model and SKU */}
                <div className="space-y-3">
                  {product.model && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium">Model:</span> {product.model}
                      </span>
                    </div>
                  )}
                  
                  {product.sku && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium">SKU:</span> {product.sku}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category */}
                {product.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                )}

                {/* Key Features - Force single column layout */}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="mt-6 w-full">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Key Features
                    </h3>
                    <div className="space-y-2 w-full">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg w-full min-w-0">
                          <span className="text-primary text-sm mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm text-foreground break-words min-w-0 flex-1">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Product Description - Added back at the bottom */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Description
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {renderHtmlContent(product.description)}
                </div>
              </div>
            )}

            {/* Specifications Section */}
            {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-primary text-lg mt-0.5">•</span>
                      <span className="text-sm text-foreground">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Section */}
            {product.applications && Array.isArray(product.applications) && product.applications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  Applications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.applications.map((app, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-primary text-lg mt-0.5">•</span>
                      <span className="text-sm text-foreground">{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Products Section */}
            {product.relatedProducts && Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  Related Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {product.relatedProducts.map((relatedProduct, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-foreground font-medium">{relatedProduct}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => {
              // Navigate to full product page
              const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
              window.open(productUrl, '_blank');
            }}
            className="bg-primary hover:bg-primary/90"
          >
            View Full Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
