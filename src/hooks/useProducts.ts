import { useState, useEffect, useCallback } from 'react';
import { productService, UnifiedProduct } from '@/services/productService';
import { useTranslation } from '@/hooks/useTranslation';


export interface UseProductsReturn {
  products: UnifiedProduct[];
  featuredProducts: UnifiedProduct[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => UnifiedProduct | undefined;
  getProductBySlug: (slug: string) => UnifiedProduct | undefined;
  getProductsByCategory: (category: string) => UnifiedProduct[];
}

export const useProducts = (): UseProductsReturn => {
  const { currentLanguage } = useTranslation();
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Refreshing products...');
      console.log('🌐 Current language:', currentLanguage);
      
      // Load all products with translations from database
      const allProducts = await productService.getProducts({ language: currentLanguage });
      console.log(`📦 Loaded ${allProducts.length} products with database translations`);
      
      // Debug: Show first few products to verify translations
      if (allProducts.length > 0) {
        console.log('🔍 First product details:', {
          id: allProducts[0].id,
          originalName: allProducts[0].names?.en || 'No English name',
          translatedName: allProducts[0].name,
          originalDesc: allProducts[0].descriptions?.en || 'No English desc',
          translatedDesc: allProducts[0].description?.substring(0, 100) + '...'
        });
      }
      
      // The products now come with proper names/descriptions from the database
      // No need to apply hardcoded translations
      setProducts(allProducts);
      
      // Load featured products with translations
      const featured = await productService.getFeaturedProducts(currentLanguage);
      console.log(`⭐ Loaded ${featured.length} featured products with translations`);
      
      // Featured products also come with proper translations
      setFeaturedProducts(featured);
      
    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Refresh products when language changes
  useEffect(() => {
    if (currentLanguage) {
      console.log('🌐 Language changed, refreshing products with new translations');
      refreshProducts();
    }
  }, [currentLanguage, refreshProducts]);

  // Listen for product updates from admin interface
  useEffect(() => {
    const handleProductUpdate = () => {
      console.log('🔔 Product update detected, refreshing...');
      refreshProducts();
    };

    // Listen for custom events from admin interface
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('productDeleted', handleProductUpdate);
    window.addEventListener('productAdded', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('productDeleted', handleProductUpdate);
      window.removeEventListener('productAdded', handleProductUpdate);
    };
  }, [refreshProducts]);

  // Helper functions
  const getProductById = useCallback((id: string): UnifiedProduct | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductBySlug = useCallback((slug: string): UnifiedProduct | undefined => {
    return products.find(product => product.slug === slug);
  }, [products]);

  const getProductsByCategory = useCallback((category: string): UnifiedProduct[] => {
    return products.filter(product => product.category === category);
  }, [products]);

  return {
    products: products, // Return all products
    featuredProducts,
    loading,
    error,
    refreshProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory
  };
}; 