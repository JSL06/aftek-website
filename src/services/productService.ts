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
  language?: string;
}

export const productService = {
  async getAllProducts(language?: string): Promise<UnifiedProduct[]> {
    try {
      console.log(`Product service: getAllProducts called with language: ${language || 'en'}`);
      
      // Use the new getProducts method which properly handles translations for all languages
      const products = await this.getProducts({ language });
      
      console.log(`Product service: getAllProducts returned ${products.length} products with proper translations`);
      return products;
    } catch (err) {
      console.error('Product service: Error in getAllProducts:', err);
      throw err;
    }
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

      // Language filtering will be handled by the translation system
      if (filters?.language) {
        console.log(`Product service: Language filter ${filters.language} specified`);
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

      // Get translations for all products
      const productIds = data.map(p => p.id);
      const { data: translations, error: translationError } = await supabase
        .from('product_translations')
        .select('*')
        .in('product_id', productIds);

      if (translationError) {
        console.error('productService: Error fetching product translations:', translationError);
        // Don't throw here - we still have the main product data
        console.warn('productService: Translations failed to fetch, but products were retrieved');
      }

      // Organize translations by product ID
      const translationsByProduct: Record<string, { names: Record<string, string>, descriptions: Record<string, string> }> = {};
      
      if (translations) {
        translations.forEach(translation => {
          if (!translationsByProduct[translation.product_id]) {
            translationsByProduct[translation.product_id] = { names: {}, descriptions: {} };
          }
          if (translation.name) {
            translationsByProduct[translation.product_id].names[translation.language_code] = translation.name;
          }
          if (translation.description) {
            translationsByProduct[translation.product_id].descriptions[translation.language_code] = translation.description;
          }
        });
      }

      // Transform the data to match UnifiedProduct interface
      const transformedData = data.map(product => {
        console.log('productService: Processing product:', product);
        const productTranslations = translationsByProduct[product.id] || { names: {}, descriptions: {} };
        
        // Always use the first available translation or fallback to original
        let displayName = product.name; // fallback to original
        let displayDescription = product.description; // fallback to original
        
        if (filters?.language) {
          // For ALL languages including English, use the translations table
          displayName = productTranslations.names[filters.language] || product.name;
          displayDescription = productTranslations.descriptions[filters.language] || product.description;
        } else {
          // If no specific language requested, use the first available translation
          const firstLanguage = Object.keys(productTranslations.names)[0];
          if (firstLanguage) {
            displayName = productTranslations.names[firstLanguage] || product.name;
            displayDescription = productTranslations.descriptions[firstLanguage] || product.description;
          }
        }
        
        return {
          ...product,
          name: displayName, // This will be displayed on the website
          description: displayDescription, // This will be displayed on the website
          features: product.features || [],
          price: product.price || 0,
          inStock: product.inStock || product.in_stock || false,
          image: product.image || product.image_url || '',
          names: productTranslations.names,
          descriptions: productTranslations.descriptions
        };
      });
      
      console.log('productService: Transformed data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('productService: Exception in getProducts:', error);
      throw error;
    }
  },

  async getProduct(id: string, language?: string): Promise<UnifiedProduct | null> {
    try {
      console.log('Product service: Fetching product with ID:', id, 'for language:', language || 'en');

      // 1. Get the main product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) {
        console.error('Product service: Error fetching main product:', productError);
        throw productError;
      }

      if (!product) return null;

      // 2. Get translations for this product
      const { data: translations, error: translationError } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', id);

      if (translationError) {
        console.error('Product service: Error fetching translations:', translationError);
        // Don't throw here - we still have the main product data
        console.warn('Product service: Translations failed to fetch, but product was retrieved');
      }

      console.log('Product service: Raw translations data:', translations);

      // 3. Organize translations into names and descriptions
      const names: Record<string, string> = {};
      const descriptions: Record<string, string> = {};

      if (translations) {
        translations.forEach(translation => {
          console.log('Product service: Processing translation:', translation);
          if (translation.name) {
            names[translation.language_code] = translation.name;
          }
          if (translation.description) {
            descriptions[translation.language_code] = translation.description;
          }
        });
      }

      console.log('Product service: Organized names:', names);
      console.log('Product service: Organized descriptions:', descriptions);

      // 4. Transform the data to match UnifiedProduct interface
      const targetLanguage = language || 'en';
      
      // Ensure we have at least one translation to display
      let displayName = product.name; // fallback to original
      let displayDescription = product.description; // fallback to original
      
      if (Object.keys(names).length > 0) {
        // If we have translations, use the target language or first available
        displayName = names[targetLanguage] || Object.values(names)[0] || product.name;
        displayDescription = descriptions[targetLanguage] || Object.values(descriptions)[0] || product.description;
      }
      
      const unifiedProduct: UnifiedProduct = {
        ...product,
        // Use translated content for display, fallback to original
        name: displayName,
        description: displayDescription,
        features: product.features || [],
        price: product.price || 0,
        inStock: product.inStock || product.in_stock || false,
        image: product.image || product.image_url || '',
        names,
        descriptions
      };

      console.log('Product service: Successfully fetched product with translations:', unifiedProduct);
      return unifiedProduct;

    } catch (error) {
      console.error('Product service: Error in getProduct:', error);
      throw error;
    }
  },

  async createProduct(product: Omit<UnifiedProduct, 'id' | 'created_at' | 'updated_at'>): Promise<UnifiedProduct> {
    try {
      console.log('Product service: Creating new product:', product);

      // Extract multilingual content from product
      const { names, descriptions, ...productData } = product;
      
      // 1. Insert into the main products table
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) {
        console.error('Product service: Error creating main product:', productError);
        throw productError;
      }

      console.log('Product service: Created main product:', newProduct);

      // 2. Handle multilingual content insertion
      if (names || descriptions) {
        console.log('Product service: Processing multilingual content for new product');
        
        const productId = newProduct.id;
        const translationsToInsert: any[] = [];

        // Process names
        if (names) {
          for (const [languageCode, name] of Object.entries(names)) {
            if (name && typeof name === 'string') {
              translationsToInsert.push({
                product_id: productId,
                language_code: languageCode,
                name: name,
                description: null
              });
            }
          }
        }

        // Process descriptions
        if (descriptions) {
          for (const [languageCode, description] of Object.entries(descriptions)) {
            if (description && typeof description === 'string') {
              // Check if we already have a translation record for this language
              const existingIndex = translationsToInsert.findIndex(t => t.language_code === languageCode);
              if (existingIndex >= 0) {
                // Update existing record
                translationsToInsert[existingIndex].description = description;
              } else {
                // Create new record
                translationsToInsert.push({
                  product_id: productId,
                  language_code: languageCode,
                  name: null,
                  description: description
                });
              }
            }
          }
        }

        // Insert all translations
        if (translationsToInsert.length > 0) {
          console.log('Product service: Inserting translations:', translationsToInsert);
          const { error: translationError } = await supabase
            .from('product_translations')
            .insert(translationsToInsert);

          if (translationError) {
            console.error('Product service: Error inserting translations:', translationError);
            // Don't throw here - the main product was created successfully
            console.warn('Product service: Translations failed to insert, but product was created');
          }
        }
      }

      // Transform the data to match UnifiedProduct interface
      const transformedProduct: UnifiedProduct = {
        ...newProduct,
        features: newProduct.features || [],
        price: newProduct.price || 0,
        inStock: newProduct.inStock || newProduct.in_stock || false,
        image: newProduct.image || newProduct.image_url || '',
      };

      console.log('Product service: Successfully created product:', transformedProduct);
      return transformedProduct;

    } catch (error) {
      console.error('Product service: Error in createProduct:', error);
      throw error;
    }
  },

  async updateProduct(id: string, updates: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    try {
      console.log('Product service: Updating product with ID:', id);
      console.log('Product service: Updates to apply:', updates);

      // Extract multilingual content from updates
      const { names, descriptions, ...productUpdates } = updates;
      
      // 1. Update the main product table (non-multilingual fields)
      if (Object.keys(productUpdates).length > 0) {
        console.log('Product service: Updating main product table with:', productUpdates);
        
        // Filter out undefined/null values and map field names correctly
        const cleanUpdates: any = {};
        Object.entries(productUpdates).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Map camelCase to database column names if needed
            cleanUpdates[key] = value;
          }
        });
        
        if (Object.keys(cleanUpdates).length > 0) {
          console.log('Product service: Clean updates to apply:', cleanUpdates);
          
          // Use a simpler update approach without .select().single()
          const { error: productError } = await supabase
            .from('products')
            .update(cleanUpdates)
            .eq('id', id);

          if (productError) {
            console.error('Product service: Error updating main product:', productError);
            throw productError;
          }
          console.log('Product service: Main product updated successfully');
        }
      }

      // 2. Handle multilingual content updates - CRITICAL FIX
      if (names || descriptions) {
        console.log('Product service: Processing multilingual updates');
        
        // Get existing translations to preserve unchanged fields
        const { data: existingTranslations, error: fetchError } = await supabase
          .from('product_translations')
          .select('*')
          .eq('product_id', id);
        
        if (fetchError) {
          console.error('Product service: Error fetching existing translations:', fetchError);
          throw fetchError;
        }
        
        // Create a map of existing translations by language
        const existingByLanguage: Record<string, any> = {};
        if (existingTranslations) {
          existingTranslations.forEach(translation => {
            existingByLanguage[translation.language_code] = translation;
          });
        }
        
        // Process names (product names in different languages)
        if (names) {
          console.log('Product service: Processing names object:', names);
          console.log('Product service: Names object keys:', Object.keys(names));
          console.log('Product service: Names object values:', Object.values(names));
          
          for (const [languageCode, name] of Object.entries(names)) {
            console.log(`Product service: Updating name for language ${languageCode}:`, name);
            console.log(`Product service: Name type: ${typeof name}, length: ${name?.length}`);
            
            // Get existing translation or create new one
            const existing = existingByLanguage[languageCode] || {};
            
            // Upsert into product_translations table, preserving existing description
            const { error: translationError } = await supabase
              .from('product_translations')
              .upsert({
                product_id: id,
                language_code: languageCode,
                name: name || null,
                description: existing.description || null // Preserve existing description
              }, {
                onConflict: 'product_id,language_code'
              });

            if (translationError) {
              console.error(`Product service: Error updating name for ${languageCode}:`, translationError);
              throw translationError;
            }
            console.log(`Product service: Successfully updated name for ${languageCode}`);
          }
        }

        // Process descriptions (product descriptions in different languages)
        if (descriptions) {
          for (const [languageCode, description] of Object.entries(descriptions)) {
            console.log(`Product service: Updating description for language ${languageCode}:`, description);
            
            // Get existing translation or create new one
            const existing = existingByLanguage[languageCode] || {};
            
            // Upsert into product_translations table, preserving existing name
            const { error: translationError } = await supabase
              .from('product_translations')
              .upsert({
                product_id: id,
                language_code: languageCode,
                name: existing.name || null, // Preserve existing name
                description: description || null
              }, {
                onConflict: 'product_id,language_code'
              });

            if (translationError) {
              console.error(`Product service: Error updating description for ${languageCode}:`, translationError);
              throw translationError;
            }
            console.log(`Product service: Successfully updated description for ${languageCode}`);
          }
        }
      }

      // 3. Fetch and return the updated product
      console.log('Product service: Fetching updated product');
      const { data: finalProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Product service: Error fetching final product:', fetchError);
        throw fetchError;
      }

      // 4. Get translations for the final product
      const { data: translations, error: translationError } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', id);

      if (translationError) {
        console.error('Product service: Error fetching translations:', translationError);
        // Don't throw here - we still have the main product
      }

      // 5. Organize translations into names and descriptions
      const finalNames: Record<string, string> = {};
      const finalDescriptions: Record<string, string> = {};

      if (translations) {
        translations.forEach(translation => {
          if (translation.name) {
            finalNames[translation.language_code] = translation.name;
          }
          if (translation.description) {
            finalDescriptions[translation.language_code] = translation.description;
          }
        });
      }

      // 6. Return the complete updated product
      const updatedProduct: UnifiedProduct = {
        ...finalProduct,
        features: finalProduct.features || [],
        price: finalProduct.price || 0,
        inStock: finalProduct.inStock || finalProduct.in_stock || false,
        image: finalProduct.image || finalProduct.image_url || '',
        names: finalNames,
        descriptions: finalDescriptions
      };

      console.log('Product service: Successfully updated product:', updatedProduct);
      return updatedProduct;

    } catch (error) {
      console.error('Product service: Error in updateProduct:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      console.log(`Product service: Deleting product with ID: ${id}`);

      // Delete translations first (due to foreign key constraint)
      const { error: translationError } = await supabase
        .from('product_translations')
        .delete()
        .eq('product_id', id);

      if (translationError) {
        console.error('Product service: Error deleting product translations:', translationError);
        // Don't throw here - we still want to try to delete the main product
        console.warn('Product service: Translations failed to delete, but will continue with product deletion');
      }

      // Delete the main product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (productError) {
        console.error('Product service: Error deleting main product:', productError);
        throw productError;
      }

      console.log('Product service: Successfully deleted product and its translations');
    } catch (error) {
      console.error('Product service: Error in deleteProduct:', error);
      throw error;
    }
  },

  async uploadProductImage(file: File, productId: string): Promise<string> {
    try {
      console.log(`Product service: Uploading image for product ${productId}:`, file.name);

      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Product service: Error uploading image:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Product service: Successfully uploaded image:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Product service: Error in uploadProductImage:', error);
      throw error;
    }
  },

  async getFeaturedProducts(language?: string): Promise<UnifiedProduct[]> {
    try {
      console.log('Product service: Fetching featured products');

      // Get featured products from the main table
      const { data: featuredProducts, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('showInFeatured', true)
        .order('created_at', { ascending: false });

      if (productError) {
        console.error('Product service: Error fetching featured products:', productError);
        throw productError;
      }

      if (!featuredProducts || featuredProducts.length === 0) {
        console.log('Product service: No featured products found');
        return [];
      }

      // Get translations for all featured products
      const productIds = featuredProducts.map(p => p.id);
      const { data: translations, error: translationError } = await supabase
        .from('product_translations')
        .select('*')
        .in('product_id', productIds);

      if (translationError) {
        console.error('Product service: Error fetching featured product translations:', translationError);
        // Don't throw here - we still have the main product data
        console.warn('Product service: Translations failed to fetch, but featured products were retrieved');
      }

      // Organize translations by product ID
      const translationsByProduct: Record<string, { names: Record<string, string>, descriptions: Record<string, string> }> = {};
      
      if (translations) {
        translations.forEach(translation => {
          if (!translationsByProduct[translation.product_id]) {
            translationsByProduct[translation.product_id] = { names: {}, descriptions: {} };
          }
          if (translation.name) {
            translationsByProduct[translation.product_id].names[translation.language_code] = translation.name;
          }
          if (translation.description) {
            translationsByProduct[translation.product_id].descriptions[translation.language_code] = translation.description;
          }
        });
      }

      // Transform the data to match UnifiedProduct interface
      const transformedProducts = featuredProducts.map(product => {
        const productTranslations = translationsByProduct[product.id] || { names: {}, descriptions: {} };
        
        // If a specific language is requested, use that language's content
        let displayName = product.name; // fallback to original
        let displayDescription = product.description; // fallback to original
        
        if (language) {
          // For ALL languages including English, use the translations table
          displayName = productTranslations.names[language] || product.name;
          displayDescription = productTranslations.descriptions[language] || product.description;
        }
        
        return {
          ...product,
          name: displayName, // This will be displayed on the website
          description: displayDescription, // This will be displayed on the website
          features: product.features || [],
          price: product.price || 0,
          inStock: product.inStock || product.in_stock || false,
          image: product.image || product.image_url || '',
          names: productTranslations.names,
          descriptions: productTranslations.descriptions
        };
      });

      console.log(`Product service: Successfully loaded ${transformedProducts.length} featured products with translations`);
      return transformedProducts;

    } catch (error) {
      console.error('Product service: Error in getFeaturedProducts:', error);
      throw error;
    }
  },

  async addProduct(product: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    try {
      console.log('Product service: Adding new product:', product);

      // Extract multilingual content from product
      const { names, descriptions, ...productData } = product;
      
      // 1. Insert into the main products table
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) {
        console.error('Product service: Error creating main product:', productError);
        throw productError;
      }

      console.log('Product service: Created main product:', newProduct);

      // 2. Handle multilingual content insertion
      if (names || descriptions) {
        console.log('Product service: Processing multilingual content for new product');
        
        const productId = newProduct.id;
        const translationsToInsert: any[] = [];

        // Process names
        if (names) {
          for (const [languageCode, name] of Object.entries(names)) {
            if (name && typeof name === 'string') {
              translationsToInsert.push({
                product_id: productId,
                language_code: languageCode,
                name: name,
                description: null
              });
            }
          }
        }

        // Process descriptions
        if (descriptions) {
          for (const [languageCode, description] of Object.entries(descriptions)) {
            if (description && typeof description === 'string') {
              // Check if we already have a translation record for this language
              const existingIndex = translationsToInsert.findIndex(t => t.language_code === languageCode);
              if (existingIndex >= 0) {
                // Update existing record
                translationsToInsert[existingIndex].description = description;
              } else {
                // Create new record
                translationsToInsert.push({
                  product_id: productId,
                  language_code: languageCode,
                  name: null,
                  description: description
                });
              }
            }
          }
        }

        // Insert all translations
        if (translationsToInsert.length > 0) {
          console.log('Product service: Inserting translations:', translationsToInsert);
          const { error: translationError } = await supabase
            .from('product_translations')
            .insert(translationsToInsert);

          if (translationError) {
            console.error('Product service: Error inserting translations:', translationError);
            // Don't throw here - the main product was created successfully
            console.warn('Product service: Translations failed to insert, but product was created');
          }
        }
      }

      // Transform the data to match UnifiedProduct interface
      const transformedProduct: UnifiedProduct = {
        ...newProduct,
        features: newProduct.features || [],
        price: newProduct.price || 0,
        inStock: newProduct.inStock || newProduct.in_stock || false,
        image: newProduct.image || newProduct.image_url || '',
      };

      console.log('Product service: Successfully created product:', transformedProduct);
      return transformedProduct;

    } catch (error) {
      console.error('Product service: Error in addProduct:', error);
      throw error;
    }
  },

  async debugDatabase(): Promise<void> {
    try {
      console.log('Product service: Debugging database...');
      
      // Debug main products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (productsError) {
        console.error('Product service: Database debug error for products:', productsError);
      } else {
        console.log('Product service: Database debug result for products:', products);
      }

      // Debug translations table
      const { data: translations, error: translationsError } = await supabase
        .from('product_translations')
        .select('*')
        .limit(10);

      if (translationsError) {
        console.error('Product service: Database debug error for translations:', translationsError);
      } else {
        console.log('Product service: Database debug result for translations:', translations);
      }

      // Test the RPC function
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_products_with_translations', { target_language: 'zh-Hant' });
        if (rpcError) {
          console.error('Product service: RPC function test error:', rpcError);
        } else {
          console.log('Product service: RPC function test result:', rpcResult);
        }
      } catch (rpcError) {
        console.error('Product service: RPC function test exception:', rpcError);
      }

    } catch (error) {
      console.error('Product service: Error in debugDatabase:', error);
    }
  },

  async forceRefresh(): Promise<void> {
    try {
      console.log('Product service: Force refresh requested for products');
      
      // This method is called by the admin interface to force a refresh
      // We'll log it for now since the actual refresh is handled by loadProducts()
      // In the future, this could trigger a cache invalidation or re-fetch
      
      // Optionally, we could clear any cached data here
      console.log('Product service: Force refresh completed');
    } catch (error) {
      console.error('Product service: Error in forceRefresh:', error);
      throw error;
    }
  },

  async updateFeaturedStatus(id: string, showInFeatured: boolean): Promise<boolean> {
    try {
      console.log(`Product service: Updating featured status for product ${id} to ${showInFeatured}`);

      const { data, error } = await supabase
        .from('products')
        .update({ showInFeatured })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Product service: Error updating featured status:', error);
        throw error;
      }

      console.log('Product service: Successfully updated featured status:', data);
      return !!data;
    } catch (error) {
      console.error('Product service: Error in updateFeaturedStatus:', error);
      throw error;
    }
  }
};

