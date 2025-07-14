import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductFilter, { ProductFilters } from '@/components/ProductFilter';
import PdfViewer from '@/components/PdfViewer';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Sparkles, Star, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
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

const Products = () => {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({ search: '', category: [], features: [] });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, description, features, image, in_stock, size, specifications, names, related_products, isActive')
          .eq('isActive', true);
        
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          console.log('Fetched products:', data);
          console.log('Product categories:', [...new Set(data?.map(p => p.category) || [])]);
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Filter products whenever products or filters change
  useEffect(() => {
    let filtered = [...products];
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        (product.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        (product.names?.[currentLanguage]?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(filters.search.toLowerCase())
      );
    }

    // Category filter - now handles multiple categories
    if (filters.category.length > 0) {
      console.log('Filtering by categories:', filters.category);
      console.log('Available categories:', [...new Set(products.map(p => p.category))]);
      filtered = filtered.filter(product => {
        const matches = filters.category.includes(product.category);
        console.log(`Product "${product.name}" category: "${product.category}" matches any of "${filters.category}": ${matches}`);
        return matches;
      });
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

    setFilteredProducts(filtered);
  }, [products, filters, currentLanguage]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const displayProducts = filteredProducts;

  return (
    <div className="min-h-screen pt-32 bg-gradient-subtle">
      <div className="container mx-auto px-6 mb-24">
        <div className="title-container">
          <h1 className="uniform-page-title">{t('products.title')}</h1>
        </div>
        {/* Product Filter */}
        <ProductFilter onFilterChange={handleFilterChange} />

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            <p>{t('products.loading')}</p>
          ) : displayProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="border-0 shadow-card hover:shadow-elegant transition-smooth group bg-white hover:bg-gray-50 cursor-pointer rounded-xl"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardContent className="p-0 overflow-hidden rounded-xl">
                {/* Product Image Placeholder */}
                <div className="h-56 bg-gradient-accent flex items-center justify-center group-hover:scale-105 transition-smooth relative overflow-hidden rounded-t-xl">
                  <div className="absolute inset-0 bg-gradient-elegant opacity-20 rounded-t-xl"></div>
                  <FileText className="h-16 w-16 text-white/80 relative z-10" />
                  <span className="absolute bottom-4 left-4 text-white/60 text-sm font-medium z-10">
                    {product.image || '[PRODUCT_IMAGE]'}
                  </span>
                </div>
                <div className="p-6 rounded-b-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-smooth">
                      {product.names && product.names[currentLanguage] ? product.names[currentLanguage] : product.name}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Category Badge */}
                  <div className="flex items-center mb-4">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-primary font-medium text-sm">{product.category}</span>
                  </div>

                  {/* Features */}
                  {(() => {
                    const safeFeatures = Array.isArray(product.features) ? product.features : [];
                    if (safeFeatures.length > 0) {
                      return (
                    <div className="flex flex-wrap gap-2 mb-6">
                          {safeFeatures.slice(0, 3).map((feature: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium hover:bg-primary/20 transition-smooth"
                        >
                          {feature}
                        </span>
                      ))}
                          {safeFeatures.length > 3 && (
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">
                              +{safeFeatures.length - 3} more
                        </span>
                      )}
                    </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Price if available */}
                  {product.price && (
                    <div className="mb-4">
                      <span className="text-green-600 font-semibold">{product.price}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t('ui.viewMore')}
                    </Button>
                    {/* Add PdfViewer or other actions if needed */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {t('products.showing').replace('{count}', displayProducts.length.toString()).replace('{total}', products.length.toString())}
          </p>
        </div>
        
        {/* Technical Support */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t('products.technicalSupport')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('products.technicalSupportDesc')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Products;