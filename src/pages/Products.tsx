import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { productService, UnifiedProduct } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const Products: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
    
    // Test database connection
    const testConnection = async () => {
      try {
        console.log('Products: Testing database connection...');
        
        // Test 1: Simple count query
        const { data: countData, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        console.log('Products: Count query result:', { countData, countError });
        
        // Test 2: Get first few products
        const { data: sampleData, error: sampleError } = await supabase
          .from('products')
          .select('id, name, category')
          .limit(3);
        console.log('Products: Sample query result:', { sampleData, sampleError });
        
        // Test 3: Check if we can access specific columns
        const { data: columnData, error: columnError } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        console.log('Products: Column access test:', { columnData, columnError });
        
        if (countError || sampleError || columnError) {
          console.error('Products: Database connection error:', { countError, sampleError, columnError });
        } else {
          console.log('Products: Database connection successful');
        }
      } catch (err) {
        console.error('Products: Connection test failed:', err);
      }
    };
    
    testConnection();
    
    // Listen for language changes and reload the page
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Products page: Language changed to:', event.detail);
      // Reload the entire page to ensure all text updates
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Products: Starting to load products...');
      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };
      console.log('Products: Filters:', filters);
      
      // Test direct database query first
      console.log('Products: Testing direct Supabase query...');
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      console.log('Products: Direct query result:', { testData, testError });
      
      const data = await productService.getProducts(filters);
      console.log('Products: Received data from service:', data);
      console.log('Products: Data length:', data?.length);
      console.log('Products: Data type:', typeof data);
      console.log('Products: Is array?', Array.isArray(data));
      setProducts(data || []);
    } catch (error) {
      console.error('Products: Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    loadProducts();
  };

  const handleViewDetails = (product: UnifiedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Get unique categories from actual products
  const getUniqueCategories = () => {
    const categories = products.map(product => product.category).filter(Boolean);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.map(category => ({
      value: category,
      label: category
    }));
  };

  const allCategories = [
    { value: 'all', label: t('products.filters.all') },
    ...getUniqueCategories()
  ];

  return (
    <div className="container mx-auto p-8 mt-20">
      <div className="flex flex-col items-center mb-4">
        <h1 className="uniform-page-title">{t('products.title')}</h1>
        <p className="text-lg text-muted-foreground text-center mt-4">
          {t('products.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-6 border border-border/50 rounded-lg bg-transparent backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('products.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder={t('products.filters.all')} />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="bg-primary text-primary-foreground">
              {t('products.searchButton')}
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              {t('products.clearButton')}
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-4">
            {t('products.noProductsFound')}
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            {t('products.clearFilters')}
          </Button>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Products; 