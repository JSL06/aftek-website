import { supabase } from '../integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  translations?: Record<string, any>;
}

export interface UnifiedProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  image_url?: string;
  price?: number | string;
  features?: string[];
  model?: string;
  sku?: string;
  inStock?: boolean;
  in_stock?: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
  translations?: Record<string, any>;
  names?: Record<string, any>;
  descriptions?: Record<string, any>;
  isActive?: boolean;
  showInFeatured?: boolean;
  tags?: string[];
  related_products?: string[];
}

export interface ProductFilter {
  category?: string;
  search?: string;
}

export const productService = {
  async getAllProducts(): Promise<UnifiedProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Transform the data to match UnifiedProduct interface
    return (data || []).map(product => ({
      ...product,
      features: product.features || [],
      price: product.price || 0,
      inStock: product.inStock || product.in_stock || false,
      image: product.image || product.image_url || '',
    }));
  },

  async getProducts(filters?: ProductFilter): Promise<UnifiedProduct[]> {
    console.log('productService: Starting getProducts with filters:', filters);
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      console.log('productService: Executing query...');
      const { data, error } = await query;
      console.log('productService: Query result - data:', data, 'error:', error);

      if (error) {
        console.error('productService: Error fetching products:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('productService: No data returned from query');
        return [];
      }

      console.log('productService: Raw data received:', data.length, 'products');

      // Transform the data to match UnifiedProduct interface
      const transformedData = data.map(product => {
        console.log('productService: Processing product:', product);
        return {
          ...product,
          features: product.features || [],
          price: product.price || 0,
          inStock: product.inStock || product.in_stock || false,
          image: product.image || product.image_url || '',
        };
      });
      
      console.log('productService: Transformed data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('productService: Exception in getProducts:', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<UnifiedProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    if (!data) return null;

    // Transform the data to match UnifiedProduct interface
    return {
      ...data,
      features: data.features || [],
      price: data.price || 0,
      inStock: data.inStock || data.in_stock || false,
      image: data.image || data.image_url || '',
    };
  },

  async createProduct(product: Omit<UnifiedProduct, 'id' | 'created_at' | 'updated_at'>): Promise<UnifiedProduct> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
  },

  async updateProduct(id: string, updates: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async uploadProductImage(file: File, productId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async getFeaturedProducts(): Promise<UnifiedProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('showInFeatured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    // Transform the data to match UnifiedProduct interface
    return (data || []).map(product => ({
      ...product,
      features: product.features || [],
      price: product.price || 0,
      inStock: product.inStock || product.in_stock || false,
      image: product.image || product.image_url || '',
    }));
  },

  async addProduct(product: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    return data;
  },

  async debugDatabase(): Promise<void> {
    console.log('Debugging database...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Database debug error:', error);
    } else {
      console.log('Database debug result:', data);
    }
  },

  async forceRefresh(): Promise<void> {
    // This method is called by the admin interface to force a refresh
    // We'll just log it for now since the actual refresh is handled by loadProducts()
    console.log('Force refresh requested for products');
  },

  async updateFeaturedStatus(id: string, showInFeatured: boolean): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .update({ showInFeatured })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }

    return !!data;
  }
}; 