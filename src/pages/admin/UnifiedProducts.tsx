import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, ArrowLeft, Package, Star, Eye, RefreshCw, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService, UnifiedProduct } from '@/services/productService';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

const FEATURE_OPTIONS = [
  // Application Environment
  'Indoor Use', 'Outdoor Use', 'Underwater', 'High Traffic Areas', 'Chemical Exposure',
  
  // Performance Properties
  'Waterproof', 'UV Resistant', 'Flexible', 'Fast Cure', 'High Strength', 'Low Odor',
  'Chemical Resistant', 'Temperature Resistant',
  
  // Base Type
  'Polyurethane', 'Silicone', 'Acrylic', 'Epoxy', 'Hybrid', 'Cement Based',
  
  // Special Features
  'Eco Friendly', 'Fire Resistant', 'Anti Microbial', 'Self Leveling', 'Quick Setting', 'Paintable'
];

const CATEGORIES = [
  'Waterproofing',
  'Sealants & Adhesives',
  'Redi-Mix G&M',
  'Flooring Systems',
  'Others (Insulation, Coatings)'
];

const UnifiedProducts = () => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UnifiedProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);

  const [formData, setFormData] = useState<Partial<UnifiedProduct>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    model: '',
    sku: '',
    features: [],
    inStock: true,
    showInFeatured: false,
    isActive: true,
    image: '/placeholder.svg',
    tags: []
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products when search/filter criteria change
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, showInactiveProducts]);

  const loadProducts = async () => {
    console.log('Loading products...');
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      console.log('Loaded products:', allProducts.length);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.features.some(feature => feature.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by active status
    if (!showInactiveProducts) {
      filtered = filtered.filter(product => product.isActive);
    }

    setFilteredProducts(filtered);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      model: '',
      sku: '',
      features: [],
      inStock: true,
      showInFeatured: false,
      isActive: true,
      image: '/placeholder.svg',
      tags: []
    });
    setShowForm(true);
  };

  const handleEdit = (product: UnifiedProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      model: product.model,
      sku: product.sku,
      features: [...product.features],
      inStock: product.inStock,
      showInFeatured: product.showInFeatured,
      isActive: product.isActive,
      image: product.image || '/placeholder.svg',
      tags: product.tags ? [...product.tags] : []
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.category) {
      toast.error('Product category is required');
      return;
    }

    setLoading(true);
    try {
      console.log('Saving product with data:', formData);
      
      if (editingProduct) {
        // Update existing product
        const updated = await productService.updateProduct(editingProduct.id, formData);
        if (updated) {
          toast.success('Product updated successfully');
        } else {
          throw new Error('Product update returned null');
        }
      } else {
        // Add new product
        await productService.addProduct(formData);
        toast.success('Product added successfully');
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Save error details:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`${editingProduct ? 'Failed to update' : 'Failed to add'} product: ${errorMessage}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      setLoading(true);
      console.log(`🗑️ Admin: Deleting product "${name}" (${id})`);
      
      await productService.deleteProduct(id);
      
      // Force refresh to ensure we get the latest state from database
      await productService.forceRefresh();
      
      // Reload the admin interface
      await loadProducts();
      
      toast.success(`${name} deleted successfully`);
      console.log(`✅ Admin: Product "${name}" deletion complete`);
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('❌ Admin: Error deleting product:', error);
    }
    setLoading(false);
  };

  const toggleFeaturedStatus = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateFeaturedStatus(id, !currentStatus);
      toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} featured list`);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error('Error updating featured status:', error);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateProduct(id, { isActive: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Error updating product status:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Link to="/admin/unified-products">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Enter model number"
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <Label>Features</Label>
                <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {FEATURE_OPTIONS.map(feature => (
                      <label key={feature} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.features?.includes(feature) || false}
                          onChange={(e) => {
                            const features = formData.features || [];
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, features: [...features, feature] }));
                            } else {
                              setFormData(prev => ({ ...prev, features: features.filter(f => f !== feature) }));
                            }
                          }}
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.features?.length || 0} features
                </p>
              </div>

              <div>
                <Label>Related Products</Label>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Auto-suggest products with similar tags
                        const currentTags = formData.features || [];
                        const suggestions = products
                          .filter(p => p.id !== formData.id && p.isActive)
                          .filter(p => {
                            const productTags = p.features || [];
                            return productTags.some(tag => currentTags.includes(tag));
                          })
                          .slice(0, 5)
                          .map(p => p.id);
                        
                        setFormData(prev => ({
                          ...prev,
                          related_products: [...new Set([...(prev.related_products || []), ...suggestions])]
                        }));
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Auto-Suggest by Tags
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Auto-suggest products from same category
                        const suggestions = products
                          .filter(p => p.id !== formData.id && p.isActive && p.category === formData.category)
                          .slice(0, 5)
                          .map(p => p.id);
                        
                        setFormData(prev => ({
                          ...prev,
                          related_products: [...new Set([...(prev.related_products || []), ...suggestions])]
                        }));
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Auto-Suggest by Category
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, related_products: [] }))}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {products
                        .filter(p => p.id !== formData.id && p.isActive)
                        .map(product => (
                          <label key={product.id} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted rounded">
                            <input
                              type="checkbox"
                              checked={formData.related_products?.includes(product.id) || false}
                              onChange={(e) => {
                                const relatedProducts = formData.related_products || [];
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    related_products: [...relatedProducts, product.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    related_products: relatedProducts.filter(id => id !== product.id)
                                  }));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-muted-foreground ml-2">({product.category})</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {product.features?.slice(0, 2).join(', ')}
                            </Badge>
                          </label>
                        ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.related_products?.length || 0} related products
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInFeatured"
                    checked={formData.showInFeatured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInFeatured: checked }))}
                  />
                  <Label htmlFor="showInFeatured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
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
          <h1 className="text-2xl font-bold">Unified Products Management</h1>
          <p className="text-primary-foreground/80">
            Manage all products from a single source - changes reflect immediately on website
          </p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadProducts} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={async () => await productService.debugDatabase()} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Debug DB
            </Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                try {
                  await productService.fixInvalidUUIDs();
                  toast.success('UUID fix completed! Check console for details.');
                  await loadProducts();
                } catch (error) {
                  toast.error('Failed to fix UUIDs');
                  console.error('UUID fix error:', error);
                }
                setLoading(false);
              }} 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Fix UUIDs
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search by name, description, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category Filter</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="showInactive"
                  checked={showInactiveProducts}
                  onCheckedChange={setShowInactiveProducts}
                />
                <Label htmlFor="showInactive">Show Inactive</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading && !showForm ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={`hover:shadow-lg transition-shadow ${!product.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        {product.showInFeatured && <Badge className="bg-yellow-500"><Star className="h-3 w-3" /></Badge>}
                        {!product.isActive && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    {product.related_products && product.related_products.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Related:</span>
                        <span className="font-medium text-xs">
                          {product.related_products.length} products
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() => productService.updateProduct(product.id, { isActive: !product.isActive }).then(loadProducts)}
                      />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.showInFeatured}
                        onCheckedChange={() => toggleFeaturedStatus(product.id, product.showInFeatured)}
                      />
                      <span className="text-sm font-medium">Featured</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'Get started by adding your first product to the catalog.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UnifiedProducts; 