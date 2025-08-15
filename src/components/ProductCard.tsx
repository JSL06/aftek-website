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
    'others (insulation, coatings)': 'category.others',
    'others': 'category.others',
    'other': 'category.others',
    '其他（保温、涂料）': 'category.others',
    '其他（保溫、塗料）': 'category.others',
    '其他': 'category.others',
    'insulation & coatings': 'category.others',
    'insulation and coatings': 'category.others',
    '保温与涂料': 'category.others',
    '保溫與塗料': 'category.others',
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
    <Card className={`bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group h-full flex flex-col ${className}`}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Product Image - Display actual image or placeholder */}
        <div 
          className={`${isCompact ? 'h-48' : 'h-64'} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg overflow-hidden cursor-pointer relative group`}
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
        
        <div className={`${isCompact ? 'p-4' : 'p-6'} flex flex-col h-full`}>
          {/* Product Name */}
          <h3 className={`font-bold text-foreground mb-3 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {product.name}
          </h3>
          
          {/* Product Description - Exactly 2 lines with truncation */}
          <div className={`text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2 min-h-[3rem] max-h-[3rem] flex-grow overflow-hidden`}>
            {stripHtml(product.description)}
          </div>
          
          {/* Bottom section - Always at the same position */}
          <div className="mt-auto">
            {/* Stock Status Box */}
            <div className="bg-muted/50 rounded-lg p-2 mb-4 border border-border/50">
              <div className="flex items-center justify-center">
                {product.inStock || product.in_stock ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{t('products.inStock')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-xs text-red-600 font-medium">{t('products.outOfStock')}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Category Tags */}
            {product.category && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {getTranslatedCategory(product.category, t)}
                </span>
              </div>
            )}
            
            {/* Action Button */}
            <Button 
              onClick={handleViewDetails}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
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