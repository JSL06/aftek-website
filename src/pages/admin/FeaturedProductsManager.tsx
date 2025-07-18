import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Package, GripVertical, Save, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';

const FeaturedProductsManager = () => {
  const { t } = useTranslation();
  const { products, featuredProducts, loading, updateProductFeaturedStatus, reorderFeaturedProducts } = useProducts();
  const [localChanges, setLocalChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleFeaturedToggle = (productId: string, newValue: boolean) => {
    setLocalChanges(prev => ({ ...prev, [productId]: newValue }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Apply all changes
      for (const [productId, showInFeatured] of Object.entries(localChanges)) {
        await updateProductFeaturedStatus(productId, showInFeatured);
      }
      setLocalChanges({});
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(localChanges).length > 0;

  const getEffectiveFeaturedStatus = (productId: string, currentStatus: boolean): boolean => {
    return localChanges.hasOwnProperty(productId) ? localChanges[productId] : currentStatus;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-muted-foreground">{t('admin.featuredProducts.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('admin.featuredProducts.title')}</h1>
              <p className="text-muted-foreground">{t('admin.featuredProducts.description')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Preview Mode</span>
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
            </div>
            {hasUnsavedChanges && (
              <Button onClick={saveChanges} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Object.values(localChanges).filter(Boolean).length + 
                     featuredProducts.filter(p => !localChanges.hasOwnProperty(p.id) || localChanges[p.id]).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Featured Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <GripVertical className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{hasUnsavedChanges ? Object.keys(localChanges).length : 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Changes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {previewMode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Homepage Carousel Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(product => getEffectiveFeaturedStatus(product.id, product.showInFeatured))
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .slice(0, 6)
                  .map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="compact"
                      className="pointer-events-none"
                    />
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Management */}
        <Card>
          <CardHeader>
            <CardTitle>Product Featured Status</CardTitle>
            <p className="text-muted-foreground">
              Toggle products to show/hide them in the homepage featured section
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => {
                const isFeatured = getEffectiveFeaturedStatus(product.id, product.showInFeatured);
                const hasChange = localChanges.hasOwnProperty(product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      hasChange ? 'border-yellow-300 bg-yellow-50' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        {product.image && product.image !== '/placeholder.svg' ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          {hasChange && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              Modified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {product.price} • {product.model}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {isFeatured ? 'Featured' : 'Not Featured'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Display Order: {product.displayOrder}
                        </p>
                      </div>
                      <Switch
                        checked={isFeatured}
                        onCheckedChange={(checked) => handleFeaturedToggle(product.id, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Save reminder */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-6 right-6">
            <Card className="shadow-lg border-yellow-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                  <Button size="sm" onClick={saveChanges} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProductsManager; 