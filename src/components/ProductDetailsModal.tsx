import React, { useEffect, useState } from 'react';
import { X, Package, CheckCircle, XCircle, Star, Tag, Link, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedProduct, productService } from '@/services/productService';
import { cn } from '@/lib/utils';
import FeaturesService from '@/services/featuresService';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  currentLanguage?: string; // Add language prop
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  currentLanguage = 'en' // Default to English
}) => {
  const { t } = useTranslation();
  const [relatedProductsData, setRelatedProductsData] = useState<UnifiedProduct[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [translatedFeatures, setTranslatedFeatures] = useState<string[]>([]);
  const [translatedCategory, setTranslatedCategory] = useState<string>('');
  const navigate = useNavigate();

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

  // Load related products data when product changes
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product?.related_products || !Array.isArray(product.related_products) || product.related_products.length === 0) {
        setRelatedProductsData([]);
        return;
      }

      try {
        setLoadingRelated(true);
        console.log('🔍 Loading related products for IDs:', product.related_products);
        
        // Fetch all products and filter by IDs - WITH CORRECT LANGUAGE
        const allProducts = await productService.getAllProducts(currentLanguage);
        const relatedProducts = allProducts.filter(p => product.related_products.includes(p.id));
        
        console.log('🔍 Found related products:', relatedProducts.map(p => ({ id: p.id, name: p.name })));
        setRelatedProductsData(relatedProducts);
      } catch (error) {
        console.error('Error loading related products:', error);
        setRelatedProductsData([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (isOpen && product) {
      loadRelatedProducts();
    }
  }, [product, isOpen]);

  // Translate features when product or language changes
  useEffect(() => {
    const translateFeatures = async () => {
      if (product?.features && Array.isArray(product.features) && product.features.length > 0) {
        try {
          console.log('🔍 Modal: Translating features for language:', currentLanguage);
          console.log('🔍 Modal: Raw features:', product.features);
          const translated = await FeaturesService.translateFeatureKeys(product.features, currentLanguage);
          console.log('🔍 Modal: Translated features:', translated);
          setTranslatedFeatures(translated);
        } catch (error) {
          console.error('Error translating features in modal:', error);
          setTranslatedFeatures(product.features);
        }
      } else {
        setTranslatedFeatures([]);
      }
    };

    if (isOpen && product) {
      translateFeatures();
    }
  }, [product?.features, currentLanguage, isOpen, product]);

  // Load translated category when product or language changes
  useEffect(() => {
    const loadTranslatedCategory = async () => {
      if (product?.category && currentLanguage !== 'en') {
        try {
          const translated = await getTranslatedCategory(product.category, currentLanguage);
          setTranslatedCategory(translated);
        } catch (error) {
          console.error('Error translating category in modal:', error);
          setTranslatedCategory(product.category);
        }
      } else {
        setTranslatedCategory(product?.category || '');
      }
    };

    if (isOpen && product) {
      loadTranslatedCategory();
    }
  }, [product?.category, currentLanguage, isOpen]);

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
      <div className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t('productDetails.title')}</h2>
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
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
                        <span className="text-sm font-medium text-green-600">{t('productDetails.inStock')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">{t('productDetails.outOfStock')}</span>
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
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {product.names?.[currentLanguage] || product.name}
                  </h1>
                </div>

                {/* Model and SKU */}
                <div className="space-y-3">
                  {product.model && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium">{t('productDetails.model')}:</span> {product.model}
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
                    <Badge variant="outline">
                      {translatedCategory || product.category}
                    </Badge>
                  </div>
                )}

                {/* Key Features - Moved to right side */}
                {translatedFeatures && translatedFeatures.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      {t('productDetails.keyFeatures')}
                    </h3>
                    <div className="space-y-2">
                      {translatedFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                          <span className="text-primary text-sm mt-0.5">•</span>
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Product Description */}
            {(product.descriptions?.[currentLanguage] || product.description) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('productDetails.productDescription')}
                </h3>
                <div className="text-muted-foreground leading-relaxed">
                  {renderHtmlContent(product.descriptions?.[currentLanguage] || product.description || '')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 -mx-6 px-6">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-primary text-lg mt-0.5">•</span>
                      <span className="text-sm text-foreground">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Section - Removed as property doesn't exist in UnifiedProduct interface */}

        </div> {/* Close content div */}

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            {t('productDetails.close')}
          </Button>
          <Button 
            onClick={() => {
              // Use HashRouter-compatible navigation
              const productUrl = `/products/${product.id}`;
              console.log('🔗 Navigating to product URL:', productUrl);
              
              // Method 1: Direct hash manipulation (most reliable with HashRouter)
              window.location.hash = productUrl;
              onClose();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            {t('productDetails.viewFullPage')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
