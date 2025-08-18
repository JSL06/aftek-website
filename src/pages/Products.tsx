import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { UnifiedProduct } from '@/services/productService';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Products: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const { products, loading, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Listen for language changes and force reload to ensure all translations are loaded
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Products page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = () => {
    // Search is handled by the filteredProducts computed value
    // No need to call any function
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    // Filters are applied automatically via filteredProducts
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
      {loading || products.length === 0 ? (
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
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredProducts.map((product) => (
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