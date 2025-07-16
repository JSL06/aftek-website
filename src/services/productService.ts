import { supabase } from '@/integrations/supabase/client';
import unifiedProductsData from '@/data/unifiedProducts.json';

// Enhanced Product interface that combines both admin and website needs
export interface UnifiedProduct {
  id: string;
  name: string;
  slug?: string; // SEO-friendly URL slug
  description: string;
  image?: string;
  price: number;
  model: string;
  sku: string;
  inStock: boolean;
  in_stock: boolean; // For admin compatibility
  features: string[];
  showInProducts: boolean;
  showInFeatured: boolean;
  displayOrder: number;
  category: string;
  specifications?: Record<string, any>;
  dateAdded: string;
  tags?: string[];
  isActive: boolean;
  rating?: number;
  sizes?: string[];
  created_at: string;
  // Admin specific fields
  names?: { [key: string]: string };
  related_products?: string[];
}

// Storage mode - determines whether to use JSON or Database
export type StorageMode = 'json' | 'database' | 'hybrid';

class ProductService {
  private storageMode: StorageMode = 'json'; // Default to JSON for now
  private products: UnifiedProduct[] = [];
  private initialized = false;

  constructor() {
    this.initializeProducts();
  }

  // Generate SEO-friendly slug from product name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Ensure all products have slugs
  private ensureSlugs(products: UnifiedProduct[]): UnifiedProduct[] {
    return products.map(product => ({
      ...product,
      slug: product.slug || this.generateSlug(product.name)
    }));
  }

  // Initialize products from the chosen storage
  private async initializeProducts(): Promise<void> {
    if (this.initialized) return;

    try {
      // Always try database first for admin operations, fallback to JSON
      try {
        await this.loadFromDatabase();
        console.log('Loaded products from database');
        
        // Note: Auto-fix disabled to prevent startup delays
        // Use the "Fix UUIDs" button in admin panel if needed
      } catch (error) {
        console.warn('Database failed or empty, loading from JSON:', error);
        this.products = unifiedProductsData as UnifiedProduct[];
        console.log('Loaded products from JSON file');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize products:', error);
      // Fallback to JSON
      this.products = unifiedProductsData as UnifiedProduct[];
      this.initialized = true;
    }
  }

  // Load products from Supabase database
  private async loadFromDatabase(): Promise<void> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Convert database format to unified format
    this.products = (data || []).map(this.convertDatabaseToUnified.bind(this));
  }

  // Convert database product to unified format
  private convertDatabaseToUnified(dbProduct: any): UnifiedProduct {
    // Helper function to safely parse JSON strings from database
    const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any) => {
      try {
        return jsonString ? JSON.parse(jsonString) : defaultValue;
      } catch (error) {
        console.warn('Failed to parse JSON:', jsonString, error);
        return defaultValue;
      }
    };

    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description || '',
      image: dbProduct.image || '/placeholder.svg',
      price: typeof dbProduct.price === 'number' ? dbProduct.price : 0,
      model: dbProduct.model || dbProduct.sku || '',
      sku: dbProduct.sku || dbProduct.model || '',
      inStock: dbProduct.in_stock !== false,
      in_stock: dbProduct.in_stock !== false,
      features: safeJsonParse(dbProduct.features, []),
      showInProducts: dbProduct.showInProducts ?? true,
      showInFeatured: dbProduct.showInFeatured ?? false,
      displayOrder: dbProduct.displayOrder ?? 99,
      category: dbProduct.category || 'Others',
      specifications: safeJsonParse(dbProduct.specifications, {}),
      dateAdded: dbProduct.dateAdded || dbProduct.created_at || new Date().toISOString(),
      tags: dbProduct.tags || [],
      isActive: dbProduct.isActive !== false,
      rating: dbProduct.rating || 0,
      sizes: dbProduct.sizes || [],
      created_at: dbProduct.created_at || new Date().toISOString(),
      names: safeJsonParse(dbProduct.names, {}),
      related_products: safeJsonParse(dbProduct.related_products, [])
    };
  }

  // Convert unified format to database format
  private convertUnifiedToDatabase(product: UnifiedProduct): any {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      model: product.model,
      sku: product.sku,
      in_stock: product.inStock,
      features: JSON.stringify(product.features || []),
      category: product.category,
      specifications: JSON.stringify(product.specifications || {}),
      isActive: product.isActive,
      names: JSON.stringify(product.names || {}),
      related_products: JSON.stringify(product.related_products || []),
      created_at: product.created_at,
      showInFeatured: product.showInFeatured || false,
      displayOrder: product.displayOrder || 99
    };
  }

  // Get all products
  async getAllProducts(): Promise<UnifiedProduct[]> {
    await this.initializeProducts();
    return this.ensureSlugs([...this.products]);
  }

  // Get products for website display (filtered)
  async getWebsiteProducts(): Promise<UnifiedProduct[]> {
    await this.initializeProducts();
    return this.ensureSlugs(
      this.products
        .filter(product => product.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    );
  }

  // Get featured products
  async getFeaturedProducts(): Promise<UnifiedProduct[]> {
    await this.initializeProducts();
    return this.products
      .filter(product => product.showInFeatured && product.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Get products for admin (all products)
  async getAdminProducts(): Promise<UnifiedProduct[]> {
    await this.initializeProducts();
    return [...this.products].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Get product by ID
  async getProductById(id: string): Promise<UnifiedProduct | null> {
    await this.initializeProducts();
    const product = this.products.find(product => product.id === id);
    if (product) {
      return this.ensureSlugs([product])[0];
    }
    return null;
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<UnifiedProduct | null> {
    await this.initializeProducts();
    const productsWithSlugs = this.ensureSlugs(this.products);
    return productsWithSlugs.find(product => product.slug === slug) || null;
  }

  // Add new product
  async addProduct(productData: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    await this.initializeProducts();

    const newProduct: UnifiedProduct = {
      id: this.generateUUID(),
      name: productData.name || '',
      slug: productData.slug || this.generateSlug(productData.name || ''),
      description: productData.description || '',
      image: productData.image || '/placeholder.svg',
      price: productData.price || 0,
      model: productData.model || '',
      sku: productData.sku || productData.model || '',
      inStock: productData.inStock ?? true,
      in_stock: productData.inStock ?? true,
      features: productData.features || [],
      showInProducts: productData.showInProducts ?? true,
      showInFeatured: productData.showInFeatured ?? false,
      displayOrder: productData.displayOrder ?? this.products.length + 1,
      category: productData.category || 'Others',
      specifications: productData.specifications || {},
      dateAdded: new Date().toISOString(),
      tags: productData.tags || [],
      isActive: productData.isActive ?? true,
      rating: productData.rating || 0,
      sizes: productData.sizes || [],
      created_at: new Date().toISOString(),
      names: productData.names,
      related_products: productData.related_products
    };

    try {
      // Save to database
      const dbProduct = this.convertUnifiedToDatabase(newProduct);
      const { error } = await supabase
        .from('products')
        .insert([dbProduct]);

      if (error) {
        throw new Error(`Failed to add product: ${error.message}`);
      }

      // Add to local array
      this.products.push(newProduct);

      // Trigger real-time update
      this.notifyProductChange('productAdded', newProduct);

      console.log('✅ Product added successfully:', newProduct.name);
      return newProduct;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  }

  // Update existing product
  async updateProduct(id: string, updates: Partial<UnifiedProduct>): Promise<UnifiedProduct | null> {
    await this.initializeProducts();

    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Update the product
    this.products[index] = {
      ...this.products[index],
      ...updates,
      id, // Ensure ID doesn't change
      dateAdded: this.products[index].dateAdded, // Preserve original date
      // Ensure slug is updated if name changes
      slug: updates.name ? this.generateSlug(updates.name) : this.products[index].slug
    };

    try {
      // Persist only this product to database (more efficient)
      await this.persistSingleProduct(this.products[index]);

      // Trigger real-time update
      this.notifyProductChange('productUpdated', this.products[index]);

      console.log('✅ Product updated successfully:', this.products[index].name);
      return this.products[index];
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    await this.initializeProducts();

    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) {
      console.log(`Product with ID ${id} not found in local array`);
      return false;
    }

    const product = this.products[index];
    
    try {
      console.log(`🗑️ Deleting product: "${product.name}" (ID: ${id})`);
      
      // Strategy 1: Try direct UUID deletion first
      let deletedFromDB = false;
      
      try {
        const { error: directError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (!directError) {
          console.log(`✅ Direct UUID deletion successful for ${id}`);
          deletedFromDB = true;
        } else {
          console.log(`⚠️ Direct UUID deletion failed: ${directError.message}`);
        }
      } catch (error) {
        console.log(`⚠️ Direct deletion error: ${error.message}`);
      }

      // Strategy 2: If direct deletion failed, try deletion by name
      if (!deletedFromDB) {
        try {
          const { error: nameError } = await supabase
            .from('products')
            .delete()
            .eq('name', product.name);

          if (!nameError) {
            console.log(`✅ Name-based deletion successful for "${product.name}"`);
            deletedFromDB = true;
          } else {
            console.log(`⚠️ Name-based deletion failed: ${nameError.message}`);
          }
        } catch (error) {
          console.log(`⚠️ Name deletion error: ${error.message}`);
        }
      }

      // Strategy 3: If still not deleted, try to find and delete all matching records
      if (!deletedFromDB) {
        try {
          console.log(`🔍 Searching for product "${product.name}" in database...`);
          const { data: foundProducts, error: findError } = await supabase
            .from('products')
            .select('id, name')
            .eq('name', product.name);

          if (!findError && foundProducts && foundProducts.length > 0) {
            console.log(`Found ${foundProducts.length} matching record(s) in database`);
            
            for (const dbProduct of foundProducts) {
              try {
                const { error: deleteError } = await supabase
                  .from('products')
                  .delete()
                  .eq('id', dbProduct.id);

                if (!deleteError) {
                  console.log(`✅ Deleted database record: ${dbProduct.id}`);
                  deletedFromDB = true;
                } else {
                  console.log(`❌ Failed to delete record ${dbProduct.id}: ${deleteError.message}`);
                }
              } catch (error) {
                console.log(`❌ Error deleting record ${dbProduct.id}: ${error.message}`);
              }
            }
          } else {
            console.log(`No matching products found in database for "${product.name}"`);
          }
        } catch (error) {
          console.log(`⚠️ Search and delete error: ${error.message}`);
        }
      }

      // Strategy 4: Nuclear option - try to delete any product with similar name patterns
      if (!deletedFromDB) {
        try {
          console.log(`🔥 Nuclear deletion attempt for products containing "${product.name}"`);
          const { error: likeError } = await supabase
            .from('products')
            .delete()
            .like('name', `%${product.name}%`);

          if (!likeError) {
            console.log(`✅ Pattern-based deletion successful`);
            deletedFromDB = true;
          }
        } catch (error) {
          console.log(`⚠️ Pattern deletion error: ${error.message}`);
        }
      }

      // Always remove from local array regardless of database success
      this.products.splice(index, 1);
      console.log(`✅ Removed "${product.name}" from local array`);

      // Force a database reload to sync with any changes
      try {
        await this.loadFromDatabase();
        console.log(`🔄 Reloaded products from database`);
      } catch (error) {
        console.log(`⚠️ Failed to reload from database: ${error.message}`);
      }

      if (deletedFromDB) {
        console.log(`🎉 Successfully deleted "${product.name}" from both local and database`);
      } else {
        console.log(`⚠️ Product "${product.name}" removed locally but may still exist in database`);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Critical error during deletion:', error);
      
      // Emergency fallback - remove from local array anyway
      this.products.splice(index, 1);
      console.log(`🚨 Emergency removal of "${product.name}" from local array`);
      
      // Trigger real-time update even for emergency removal
      this.notifyProductChange('productDeleted', product);
      
      return true;
    }
  }

  // Update featured status
  async updateFeaturedStatus(id: string, showInFeatured: boolean): Promise<boolean> {
    return (await this.updateProduct(id, { showInFeatured })) !== null;
  }

  // Reorder featured products
  async reorderFeaturedProducts(productIds: string[]): Promise<boolean> {
    await this.initializeProducts();

    try {
      // Update display order for featured products
      for (let i = 0; i < productIds.length; i++) {
        await this.updateProduct(productIds[i], { displayOrder: i + 1 });
      }
      return true;
    } catch (error) {
      console.error('Error reordering products:', error);
      return false;
    }
  }

  // Persist changes to storage
  private async persistChanges(): Promise<void> {
    // Always persist to database for admin changes
    try {
      console.log('Syncing products to database...');
      
      // Get all existing product IDs
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id');

      // Delete all existing products if any exist
      if (existingProducts && existingProducts.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', existingProducts.map(p => p.id));
        
        if (deleteError) {
          throw deleteError;
        }
      }

      // Insert all current products into database
      if (this.products.length > 0) {
        const dbProducts = this.products.map(this.convertUnifiedToDatabase.bind(this));
        
        const { error } = await supabase
          .from('products')
          .insert(dbProducts);

        if (error) {
          throw error;
        }
      }

      console.log(`Successfully synced ${this.products.length} products to database`);
    } catch (error) {
      console.error('Failed to persist to database:', error);
      throw error;
    }
  }

  // Migrate from JSON to database (one-time operation)
  async migrateToDatabase(): Promise<void> {
    try {
      // Clear existing products in database
      await supabase.from('products').delete().neq('id', '');

      // Insert all JSON products into database
      const dbProducts = this.products.map(this.convertUnifiedToDatabase);
      
      const { error } = await supabase
        .from('products')
        .insert(dbProducts);

      if (error) {
        throw error;
      }

      console.log(`Successfully migrated ${this.products.length} products to database`);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Switch storage mode
  setStorageMode(mode: StorageMode): void {
    this.storageMode = mode;
    this.initialized = false;
    this.products = [];
  }

  // Get storage mode
  getStorageMode(): StorageMode {
    return this.storageMode;
  }

  // Search products
  async searchProducts(query: string): Promise<UnifiedProduct[]> {
    await this.initializeProducts();

    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  // Filter products by category
  async getProductsByCategory(category: string): Promise<UnifiedProduct[]> {
    await this.initializeProducts();
    return this.products.filter(product => 
      product.category === category && product.isActive
    );
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    await this.initializeProducts();
    const categories = new Set(this.products.map(product => product.category));
    return Array.from(categories).sort();
  }

  // Update single product in database (more efficient)
  private async persistSingleProduct(product: UnifiedProduct): Promise<void> {
    try {
      const dbProduct = this.convertUnifiedToDatabase(product);
      
      const { error } = await supabase
        .from('products')
        .upsert(dbProduct, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      console.log(`Successfully persisted product: ${product.name}`);
    } catch (error) {
      console.error('Failed to persist single product:', error);
      throw error;
    }
  }

  // Debug method to check database contents
  async debugDatabase(): Promise<void> {
    try {
      console.log('=== Database Debug Info ===');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Database query error:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('Sample database record:', data[0]);
        console.log('Database fields:', Object.keys(data[0]));
      } else {
        console.log('Database is empty');
      }

      // Test a simple insert
      const testProduct = {
        id: 'test-' + Date.now(),
        name: 'Test Product',
        description: 'Test description',
        category: 'Test Category',
        price: 10.99,
        features: JSON.stringify(['test feature']),
        specifications: JSON.stringify({ test: 'value' }),
        isActive: true,
        showInFeatured: false,
        displayOrder: 99,
        in_stock: true,
        created_at: new Date().toISOString()
      };

      console.log('Testing insert with:', testProduct);

      const { error: insertError } = await supabase
        .from('products')
        .insert([testProduct]);

      if (insertError) {
        console.error('Insert test failed:', insertError);
      } else {
        console.log('Insert test successful');
        
        // Clean up test product
        await supabase.from('products').delete().eq('id', testProduct.id);
      }

      console.log('=== End Debug Info ===');
    } catch (error) {
      console.error('Debug failed:', error);
    }
  }

  // Fix invalid UUID products in database
  async fixInvalidUUIDs(): Promise<void> {
    try {
      console.log('=== FIXING INVALID UUIDS ===');
      
      // Get all products from database
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
      }

      console.log(`Checking ${allProducts.length} products for invalid UUIDs...`);

      const invalidProducts = allProducts.filter(product => {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
        return !isValidUUID;
      });

      console.log(`Found ${invalidProducts.length} products with invalid UUIDs`);

      for (const product of invalidProducts) {
        console.log(`Fixing product: ${product.name} (ID: ${product.id})`);
        
        try {
          // Generate new UUID
          const newUUID = crypto.randomUUID();
          console.log(`  New UUID: ${newUUID}`);

          // Delete old record
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);

          if (deleteError) {
            console.error(`  Failed to delete old record:`, deleteError);
            continue;
          }

          // Insert with new UUID
          const { error: insertError } = await supabase
            .from('products')
            .insert([{
              ...product,
              id: newUUID
            }]);

          if (insertError) {
            console.error(`  Failed to insert with new UUID:`, insertError);
          } else {
            console.log(`  ✓ Successfully fixed ${product.name}`);
          }
        } catch (error) {
          console.error(`  Error fixing product ${product.name}:`, error);
        }
      }

      console.log('=== UUID FIX COMPLETE ===');
    } catch (error) {
      console.error('Fix invalid UUIDs failed:', error);
    }
  }

  // Auto-fix UUID issues during initialization
  private async autoFixUUIDs(): Promise<void> {
    try {
      console.log('=== AUTO-FIXING UUIDS ===');
      
      // Get all products from database
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) {
        console.error('Error fetching products for UUID fix:', fetchError);
        return;
      }

      if (!allProducts || allProducts.length === 0) {
        console.log('No products found in database');
        return;
      }

      console.log(`Checking ${allProducts.length} products for invalid UUIDs...`);

      const invalidProducts = allProducts.filter(product => {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
        return !isValidUUID;
      });

      if (invalidProducts.length === 0) {
        console.log('All products have valid UUIDs ✓');
        return;
      }

      console.log(`Found ${invalidProducts.length} products with invalid UUIDs`);

      for (const product of invalidProducts) {
        console.log(`Fixing product: ${product.name} (ID: ${product.id})`);
        
        try {
          // Generate new UUID
          const newUUID = crypto.randomUUID();
          
          // Convert to proper database format
          const dbProduct = this.convertUnifiedToDatabase({
            ...this.convertDatabaseToUnified(product),
            id: newUUID
          });

          // Delete old record by name (safer than invalid ID)
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('name', product.name);

          if (deleteError) {
            console.error(`  Failed to delete old record:`, deleteError);
          }

          // Insert with new UUID
          const { error: insertError } = await supabase
            .from('products')
            .insert([dbProduct]);

          if (insertError) {
            console.error(`  Failed to insert with new UUID:`, insertError);
          } else {
            console.log(`  ✓ Successfully fixed ${product.name} → ${newUUID}`);
          }
        } catch (error) {
          console.error(`  Error fixing product ${product.name}:`, error);
        }
      }

      console.log('=== UUID AUTO-FIX COMPLETE ===');
    } catch (error) {
      console.error('Auto-fix UUIDs failed:', error);
    }
  }

  // Force refresh products from database (bypass cache)
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing products from database...');
    this.initialized = false;
    this.products = [];
    await this.initializeProducts();
    console.log('✅ Force refresh complete');
  }

  // Generate UUID
  private generateUUID(): string {
    return crypto.randomUUID();
  }

  // Notify about product changes (real-time sync)
  private notifyProductChange(eventType: string, product: UnifiedProduct): void {
    console.log(`🔔 Dispatching ${eventType} event for:`, product.name);
    
    const event = new CustomEvent(eventType, {
      detail: product
    });
    
    window.dispatchEvent(event);
  }
}

// Export a singleton instance
export const productService = new ProductService();

// Export the class for testing
export { ProductService }; 