import { ProductFilters } from '@/components/ProductFilter';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features?: string | string[] | null;
  image?: string;
  price?: number;
  rating?: number;
  in_stock?: boolean;
  created_at?: string;
  size?: string;
  names?: { [key: string]: string };
  isActive?: boolean;
}

export const filterProducts = (
  products: Product[], 
  filters: ProductFilters, 
  currentLanguage: string
): Product[] => {
  let filtered = [...products];

  // Search filter
  if (filters.search) {
    filtered = filtered.filter(product =>
      (product.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (product.names?.[currentLanguage]?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(filters.search.toLowerCase())
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(product => 
      product.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Features filter
  if (filters.features.length > 0) {
    filtered = filtered.filter(product => {
      const safeFeatures = Array.isArray(product.features)
        ? product.features
        : typeof product.features === 'string' && product.features.length > 0
          ? [product.features]
          : [];
      return filters.features.some(feature => safeFeatures.includes(feature));
    });
  }

  return filtered;
}; 