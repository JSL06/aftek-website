import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Package, CheckCircle, XCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

import { UnifiedProduct } from '@/services/productService';
import FeaturesService from '@/services/featuresService';
import { supabase } from '@/integrations/supabase/client';

// Helper function to extract plain text from HTML content
const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to get translated category name from database
const getTranslatedCategory = async (category: string, currentLanguage: string): Promise<string> => {
  try {
    // If category is already in the target language, return it as is
    if (currentLanguage === 'en') {
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
      .eq('language_code', currentLanguage)
      .single();

    if (translationError || !translationData) {
      console.log('No translation found for category:', category, 'in language:', currentLanguage);
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
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const [translatedFeatures, setTranslatedFeatures] = useState<string[]>([]);
  const [translatedCategory, setTranslatedCategory] = useState<string>(product.category || '');
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Default behavior - navigate to product detail page using slug if available
      const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
      navigate(productUrl);
    }
  };

  // Translate features when language changes
  useEffect(() => {
    const translateFeatures = async () => {
      if (product.features && product.features.length > 0) {
        try {
          const translated = await FeaturesService.translateFeatureKeys(product.features, currentLanguage);
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

  // Translate category when language changes
  useEffect(() => {
    const translateCategory = async () => {
      if (product.category) {
        try {
          const translated = await getTranslatedCategory(product.category, currentLanguage);
          setTranslatedCategory(translated);
        } catch (error) {
          console.error('Error translating category:', error);
          setTranslatedCategory(product.category);
        }
      }
    };

    translateCategory();
  }, [product?.category, currentLanguage]);

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className={`bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group h-full flex flex-col ${className}`} style={{ aspectRatio: '1 / 1.3' }}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Product Image - Display actual image or placeholder */}
        <div 
          className={`${isCompact ? 'h-96' : 'h-[28rem]'} w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg overflow-hidden cursor-pointer relative group`}
          style={{ aspectRatio: '1 / 1.3' }}
          onClick={handleViewDetails}
        >
          {product.image && product.image !== '/placeholder.svg' ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder-icon');
                if (placeholder) {
                  placeholder.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          
          {/* Placeholder icon (shown when no image or image fails) */}
          <Package className={`${isCompact ? 'h-12 w-12' : 'h-16 w-16'} text-gray-400 placeholder-icon ${product.image && product.image !== '/placeholder.svg' ? 'hidden' : ''}`} />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Quick action overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 hover:bg-white text-gray-900 px-3 py-2 rounded-md font-medium">
              {t('products.viewDetails')}
            </div>
          </div>
        </div>
        
        <div className={`${isCompact ? 'p-3' : 'p-4'} flex flex-col h-full`}>
          {/* Product Name */}
          <h3 className={`font-bold text-foreground mb-2 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {product.name}
          </h3>
          
          {/* Product Features - Show first 3 features prominently */}
          {translatedFeatures && translatedFeatures.length > 0 ? (
            <div className="mb-2 flex-grow">
              <div className="space-y-1">
                {translatedFeatures.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {feature}
                    </span>
                  </div>
                ))}
                {translatedFeatures.length > 3 && (
                  <div className="text-xs text-muted-foreground/70 pl-4">
                    +{translatedFeatures.length - 3} more features
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Fallback when no features - maintain layout height */
            <div className="mb-2 flex-grow">
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-muted rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground/50">No features listed</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Bottom section - Always at the same position */}
          <div className="mt-2">
            {/* Stock Status and Category - Same row, smaller size */}
            <div className="mb-2 flex items-center gap-2">
              {product.inStock || product.in_stock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <CheckCircle className="h-2.5 w-2.5 mr-1" />
                  {t('products.inStock')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <XCircle className="h-2.5 w-2.5 mr-1" />
                  {t('products.outOfStock')}
                </span>
              )}
              
              {/* Category Badge - Same row as stock status */}
              {product.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  {translatedCategory}
                </span>
              )}
            </div>
            
            {/* Action Button - Red theme styling */}
            <Button 
              onClick={handleViewDetails}
              className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('products.viewDetails')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 