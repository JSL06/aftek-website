import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, ArrowLeft, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductFilter, { ProductFilters } from '@/components/ProductFilter';
import { useTranslation } from '@/hooks/useTranslation';

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
}

const FEATURE_OPTIONS = [
  'Waterproof',
  'UV Resistant',
  'Flexible',
  'Fast Cure',
  'High Strength',
  'Low Odor',
  'Eco-Friendly',
  'Chemical Resistant',
  'Easy Application',
  'Long Lifespan',
];

const Products = () => {
  const { currentLanguage } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  // Remove 'rating' from formData initial state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    features: [],
    image: '',
    in_stock: true,
    size: '',
  });

  const [filters, setFilters] = useState<ProductFilters>({ search: '', category: [], features: [] });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const categories = [
    'Waterproofing',
    'Sealants & Adhesives',
    'Redi-Mix G&M',
    'Flooring Systems',
    'Others (Insulation, Coatings)'
  ];

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products whenever products or filters change
    let filtered = [...products];
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        (product.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        (product.names?.[currentLanguage]?.toLowerCase() || '').includes(filters.search.toLowerCase())
      );
    }
    
    // Category filter - now handles multiple categories
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => filters.category.includes(product.category));
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, description, features, image, in_stock, size, specifications, names, related_products');
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      features: [],
      image: '',
      in_stock: true,
      size: '',
    });
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      features: Array.isArray(product.features)
        ? product.features
        : (typeof product.features === 'string' && product.features.length > 0)
          ? [product.features]
          : [],
      image: product.image || '',
      in_stock: product.in_stock !== false,
      size: product.size || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    // Only require product name
    if (!formData.name) {
      alert('Please enter a product name.');
      setLoading(false);
      return;
    }
    try {
      if (editingProduct && editingProduct.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            features: formData.features,
            image: formData.image,
            in_stock: formData.in_stock,
            size: formData.size
          })
          .eq('id', editingProduct.id);
        
        if (error) {
          console.error('Error updating product:', error);
          alert('Error updating product: ' + error.message);
        } else {
          alert('Product updated successfully!');
        }
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            category: formData.category,
            description: formData.description,
            features: formData.features,
            image: formData.image,
            in_stock: formData.in_stock,
            size: formData.size
          }]);
        
        if (error) {
          console.error('Error adding product:', error);
          alert('Error adding product: ' + error.message);
        } else {
          alert('Product added successfully!');
        }
      }
      
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.message || error));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      } else {
        alert('Product deleted successfully!');
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
    setLoading(false);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Sanitize file name
                      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                      const filePath = `products/${Date.now()}_${sanitizedFileName}`;
                      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                      });
                      if (error) {
                        alert('Error uploading image: ' + error.message);
                        return;
                      }
                      // Get public URL
                      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
                      setFormData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
                    }}
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Product" style={{ maxWidth: 200, marginTop: 8 }} />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                />
                <Label htmlFor="in_stock">In Stock</Label>
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  className="border rounded p-2 w-full"
                  value={formData.size}
                  onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                >
                  <option value="">Select size (optional)</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div>
                <Label>Features</Label>
                <select
                  multiple
                  className="border rounded p-2 w-full"
                  value={formData.features}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, features: selected }));
                  }}
                >
                  {FEATURE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple features.</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Product'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Products</h1>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>


        <ProductFilter onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const safeFeatures: string[] = Array.isArray(product.features)
                ? product.features as string[]
                : (typeof product.features === 'string' && product.features.length > 0)
                  ? [product.features]
                  : [];
              const displayName = product.names && product.names[currentLanguage] ? product.names[currentLanguage] : product.name;

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{displayName}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {safeFeatures.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {safeFeatures.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {safeFeatures.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{safeFeatures.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={product.in_stock ? "default" : "destructive"}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {products.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first product to the catalog.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Products; 