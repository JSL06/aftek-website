import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { UnifiedProduct } from '@/services/productService';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Products: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const { products, loading, refreshProducts } = useProducts();
  const { categories: allCategoriesData } = useCategories(currentLanguage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for product updates from admin panel
  useEffect(() => {
    const handleProductUpdate = () => {
      console.log('🔄 Products page: Product updated, refreshing data...');
      refreshProducts();
      toast.success('Products refreshed automatically');
    };

    window.addEventListener('productUpdated', handleProductUpdate);
    return () => window.removeEventListener('productUpdated', handleProductUpdate);
  }, [refreshProducts]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (product: UnifiedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Use categories from the product_categories table (same as admin page)
  // Filter to show only active categories on the frontend
  // Use translated names based on current language
  const allCategories = [
    { value: 'all', label: t('products.filters.all') },
    ...allCategoriesData
      .filter(category => category.is_active === true)
      .map(category => ({
        value: category.name, // Keep original name for filtering
        label: category.names[currentLanguage] || category.name // Show translated name, fallback to original
      }))
  ];

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: 'url(/aftek-website/src/assets/17580.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      {/* Title Section with Special Background */}
      <div 
        className="relative py-16 mb-12"
        style={{
          backgroundImage: 'url(/aftek-website/src/assets/pexels-pixabay-159306.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {t('products.title')}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-6xl">

      {/* Filters */}
      <div className="mb-6 p-6 border border-border rounded-lg bg-white/90 backdrop-blur-sm shadow-elegant">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('products.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/50 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/50 border-border focus:border-primary focus:ring-primary/20">
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
      ) : products.length === 0 ? (
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-4">No products found. Loading...</p>
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
          <p className="text-muted-foreground mb-4">{t('products.noProductsFound')}</p>
          <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} variant="outline">
            Clear Filters
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
    </div>
  );
};

export default Products; 