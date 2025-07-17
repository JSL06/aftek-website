import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductFilter, { ProductFilters } from '@/components/ProductFilter';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { UnifiedProduct } from '@/services/productService';
import aftekProductSummaryEnglish from '@/assets/Aftek_Product_Summary_English.pdf';
import aftekProductSummaryTChinese from '@/assets/Aftek_Product_Summary_TChinese.pdf';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Products = () => {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<UnifiedProduct[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({ search: '', category: [], features: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  // Update filtered products when products or filters change
  useEffect(() => {
    if (!products) return;
    
    let filtered = [...products];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product =>
        filters.category.includes(product.category)
      );
    }

    // Apply features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(product =>
        filters.features.some(filterFeature =>
          product.features.some(productFeature =>
            productFeature.toLowerCase().includes(filterFeature.toLowerCase())
          )
        )
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, filters]);

  // Get all unique categories
  const categories = [...new Set(products?.map(p => p.category) || [])];
  
  // Get all unique features
  const allFeatures = [...new Set(
    products?.flatMap(p => p.features || []) || []
  )];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleProductView = (product: UnifiedProduct) => {
    navigate(`/products/${product.id}`);
  };

  // Function to get the correct PDF URL based on current language
  const getProductSummaryPdfUrl = () => {
    switch (currentLanguage) {
      case 'zh-Hant':
        return aftekProductSummaryTChinese;
      case 'en':
      default:
        return aftekProductSummaryEnglish;
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 pt-24">
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-muted-foreground">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      <div className="container mx-auto p-8">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="uniform-page-title">{t('products.title') || 'Products'}</h1>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-8">
          <ProductFilter
            onFilterChange={handleFiltersChange}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <a 
                href={getProductSummaryPdfUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Product PDF
              </a>
            </Button>
          </div>
                </div>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleProductView}
                  variant="default"
                />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
              <div className="flex justify-center mb-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      if (page > totalPages) return null;
                      
                      return (
                        <PaginationItem key={page}>
                      <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                            {page}
                      </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                  </PaginationItem>
                    )}
                
                <PaginationItem>
                  <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
        )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-foreground mb-4">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', category: [], features: [] })}
            >
              Clear Filters
            </Button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Products;