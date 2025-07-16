import { useState, useEffect, useCallback } from 'react';
import { productService, UnifiedProduct } from '@/services/productService';

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
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Refreshing products...');
      
      // Load all products
      const allProducts = await productService.getAllProducts();
      console.log(`📦 Loaded ${allProducts.length} products`);
      setProducts(allProducts);
      
      // Load featured products
      const featured = await productService.getFeaturedProducts();
      console.log(`⭐ Loaded ${featured.length} featured products`);
      setFeaturedProducts(featured);
      
    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

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
    return products.filter(product => product.category === category && product.isActive);
  }, [products]);

  return {
    products: products.filter(p => p.isActive), // Only return active products for website
    featuredProducts,
    loading,
    error,
    refreshProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory
  };
}; 