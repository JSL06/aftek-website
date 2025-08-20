import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Package, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

import { UnifiedProduct } from '@/services/productService';

// Helper function to extract plain text from HTML content
const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to get translated category name
const getTranslatedCategory = (category: string, t: (key: string) => string): string => {
  // Debug: Log the category being processed
  console.log('Processing category:', category);
  
  // Normalize the category string (trim, lowercase for comparison)
  const normalizedCategory = category?.trim().toLowerCase();
  
  // Map database categories to translation keys
  const categoryMap: Record<string, string> = {
    // Database categories (what comes from the database)
    'waterproofing': 'category.waterproofing',
    '防水': 'category.waterproofing',
    'sealants & adhesives': 'category.sealants_adhesives',
    'sealants and adhesives': 'category.sealants_adhesives',
    '密封剂与胶黏剂': 'category.sealants_adhesives',
    '密封劑與膠黏劑': 'category.sealants_adhesives',
    'redi-mix g&m': 'category.redimix',
    'redi-mix': 'category.redimix',
    'flooring systems': 'category.flooring',
    'flooring': 'category.flooring',
    '地板系统': 'category.flooring',
    '地板系統': 'category.flooring',
    'other specialties': 'category.others',
    'others': 'category.others',
    'other': 'category.others',
    '其他（保温、涂料）': 'category.others',
    '其他（保溫、塗料）': 'category.others',
    '其他': 'category.others',
    '其他专业': 'category.others',
    '其他專業': 'category.others',
    'architectural coatings': 'category.architectural_coatings',
    '建筑涂料': 'category.architectural_coatings',
    '建築塗料': 'category.architectural_coatings',
    'stucco': 'category.stucco',
    '灰泥': 'category.stucco',
    'sound insulation': 'category.sound_insulation',
    '隔音材料': 'category.sound_insulation',
    'textured paints': 'category.textured_paints',
    '纹理涂料': 'category.textured_paints',
    '紋理塗料': 'category.textured_paints',
    'butyl tape': 'category.butyl_tape',
    '丁基胶带': 'category.butyl_tape',
    '丁基膠帶': 'category.butyl_tape',
    'construction chemicals': 'category.construction_chemicals',
    '建筑化学品': 'category.construction_chemicals',
    '建築化學品': 'category.construction_chemicals',
    'building materials': 'category.building_materials',
    '建筑材料': 'category.building_materials',
    '建築材料': 'category.building_materials',
    'industrial coatings': 'category.industrial_coatings',
    '工业涂料': 'category.industrial_coatings',
    '工業塗料': 'category.industrial_coatings',
    'maintenance products': 'category.maintenance_products',
    '维护产品': 'category.maintenance_products',
    '維護產品': 'category.maintenance_products'
  };
  
  // Try exact match first
  let translationKey = categoryMap[category];
  
  // If no exact match, try normalized match
  if (!translationKey && normalizedCategory) {
    translationKey = categoryMap[normalizedCategory];
  }
  
  // If still no match, try partial matching
  if (!translationKey) {
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalizedCategory?.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedCategory || '')) {
        translationKey = value;
        break;
      }
    }
  }
  
  if (translationKey) {
    const translated = t(translationKey);
    console.log(`Found translation key: ${translationKey}, translated to: ${translated}`);
    // If translation returns the key itself, use the original category
    return translated !== translationKey ? translated : category;
  }
  
  // Debug: Log when no translation is found
  console.log('No translation found for category:', category);
  return category;
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
  const { t } = useTranslation();
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Default behavior - navigate to product detail page using slug if available
      const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
      navigate(productUrl);
    }
  };

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
          {(() => {
            console.log(`🔍 ProductCard ${product.id}: Features debug:`, {
              features: product.features,
              featuresType: typeof product.features,
              isArray: Array.isArray(product.features),
              length: Array.isArray(product.features) ? product.features.length : 'not array'
            });
            return null;
          })()}
          {Array.isArray(product.features) && product.features.length > 0 ? (
            <div className="mb-2 flex-grow">
              <div className="space-y-1">
                {product.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {feature}
                    </span>
                  </div>
                ))}
                {product.features.length > 3 && (
                  <div className="text-xs text-muted-foreground/70 pl-4">
                    +{product.features.length - 3} more features
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
          
          {/* Bottom section - Compact layout with small gap */}
          <div className="mt-auto">
            {/* Stock Status and Category - Compact row */}
            <div className="mb-1 flex items-center gap-1">
              {product.inStock || product.in_stock ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <CheckCircle className="h-2.5 w-2.5 mr-1" />
                  {t('products.inStock')}
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <XCircle className="h-2.5 w-2.5 mr-1" />
                  {t('products.outOfStock')}
                </span>
              )}
              
              {/* Category Badge - Compact styling */}
              {product.category && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  {getTranslatedCategory(product.category, t)}
                </span>
              )}
            </div>
            
            {/* Action Button - Compact spacing */}
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