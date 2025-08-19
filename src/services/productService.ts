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
      console.log('🔍 Fetching translations for product IDs:', productIds);
      
      const { data: translations, error: translationError } = await supabase
        .from('product_translations')
        .select('*')
        .in('product_id', productIds);

      if (translationError) {
        console.error('productService: Error fetching product translations:', translationError);
        // Don't throw here - we still have the main product data
        console.warn('productService: Translations failed to fetch, but products were retrieved');
      }

      console.log('🔍 Raw translations data:', translations);
      console.log('🔍 Number of translations found:', translations?.length || 0);

      // Organize translations by product ID
      const translationsByProduct: Record<string, { names: Record<string, string>, descriptions: Record<string, string> }> = {};
      
      if (translations) {
        translations.forEach(translation => {
          console.log('🔍 Processing translation:', {
            product_id: translation.product_id,
            language_code: translation.language_code,
            name: translation.name,
            description: translation.description?.substring(0, 50) + '...'
          });
          
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

      console.log('🔍 Organized translations by product:', translationsByProduct);

      // Transform the data to match UnifiedProduct interface
      const transformedData = data.map(product => {
        console.log('🔍 Processing product:', product.id);
        const productTranslations = translationsByProduct[product.id] || { names: {}, descriptions: {} };
        console.log('🔍 Product translations:', productTranslations);
        
        // Always use the first available translation or fallback to original
        let displayName = product.name; // fallback to original
        let displayDescription = product.description; // fallback to original
        
        if (filters?.language) {
          // For ALL languages including English, use the translations table
          displayName = productTranslations.names[filters.language] || product.name;
          displayDescription = productTranslations.descriptions[filters.language] || product.description;
          console.log(`🔍 Language ${filters.language}: name="${displayName}", desc="${displayDescription?.substring(0, 50)}..."`);
        } else {
          // If no specific language requested, prioritize current language or first available
          // CRITICAL FIX: Always prefer translations over original product data
          const availableLanguages = Object.keys(productTranslations.names);
          if (availableLanguages.length > 0) {
            // Try to use the current language first, then fallback to first available
            const currentLang = 'en'; // Default to English if no language specified
            displayName = productTranslations.names[currentLang] || 
                         productTranslations.names[availableLanguages[0]] || 
                         product.name;
            displayDescription = productTranslations.descriptions[currentLang] || 
                               productTranslations.descriptions[availableLanguages[0]] || 
                               product.description;
            console.log(`🔍 Using translation: name="${displayName}", desc="${displayDescription?.substring(0, 50)}..."`);
          } else {
            console.log(`🔍 No translations available, using original: name="${displayName}", desc="${displayDescription?.substring(0, 50)}..."`);
          }
        }
        
        // CRITICAL FIX: Ensure we're not falling back to original data if translations exist
        if (Object.keys(productTranslations.names).length > 0) {
          // If we have translations, always use them over original product data
          const primaryLanguage = filters?.language || 'en';
          displayName = productTranslations.names[primaryLanguage] || 
                       Object.values(productTranslations.names)[0] || 
                       displayName;
          displayDescription = productTranslations.descriptions[primaryLanguage] || 
                             Object.values(productTranslations.descriptions)[0] || 
                             displayDescription;
          console.log(`🔍 CRITICAL: Final override with translations: name="${displayName}", desc="${displayDescription?.substring(0, 50)}..."`);
        }
        
        const transformedProduct = {
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
        
        console.log(`🔍 Final transformed product ${product.id}:`, {
          originalName: product.name,
          finalName: transformedProduct.name,
          originalDesc: product.description?.substring(0, 50) + '...',
          finalDesc: transformedProduct.description?.substring(0, 50) + '...',
          availableNames: productTranslations.names,
          availableDescriptions: Object.keys(productTranslations.descriptions)
        });
        
        return transformedProduct;
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

      console.log('Product service: Main product data:', product);

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
      console.log('Product service: Number of translations found:', translations?.length || 0);

      // 3. Organize translations into names and descriptions
      const names: Record<string, string> = {};
      const descriptions: Record<string, string> = {};

      if (translations && translations.length > 0) {
        translations.forEach(translation => {
          console.log('Product service: Processing translation:', translation);
          if (translation.name && translation.name.trim() !== '') {
            names[translation.language_code] = translation.name;
            console.log(`Product service: Added name for ${translation.language_code}: "${translation.name}"`);
          }
          if (translation.description && translation.description.trim() !== '') {
            descriptions[translation.language_code] = translation.description;
            console.log(`Product service: Added description for ${translation.language_code}: "${translation.description.substring(0, 50)}..."`);
          }
        });
      } else {
        console.log('Product service: No translations found in database');
      }

      console.log('Product service: Final organized names object:', names);
      console.log('Product service: Final organized descriptions object:', descriptions);
      console.log('Product service: Names object keys:', Object.keys(names));
      console.log('Product service: Descriptions object keys:', Object.keys(descriptions));

      // 4. Transform the data to match UnifiedProduct interface
      const targetLanguage = language || 'en';
      
      // CRITICAL FIX: Always prioritize translations over original product data
      let displayName: string;
      let displayDescription: string;
      
      if (Object.keys(names).length > 0) {
        // If we have translations, ALWAYS use them over original product data
        displayName = names[targetLanguage] || Object.values(names)[0];
        console.log(`Product service: Using translated name: "${displayName}" (from translations table)`);
      } else {
        // Only use original product data if NO translations exist
        displayName = product.name;
        console.log(`Product service: No name translations available, using original product name: "${product.name}"`);
      }
      
      if (Object.keys(descriptions).length > 0) {
        // If we have translations, ALWAYS use them over original product data
        displayDescription = descriptions[targetLanguage] || Object.values(descriptions)[0];
        console.log(`Product service: Using translated description: "${displayDescription?.substring(0, 50)}..." (from translations table)`);
      } else {
        // Only use original product data if NO translations exist
        displayDescription = product.description;
        console.log(`Product service: No description translations available, using original product description: "${product.description?.substring(0, 50)}..."`);
      }
      
      // CRITICAL FIX: Final override to ensure translations are never overwritten
      if (Object.keys(names).length > 0) {
        // If translations exist, they take absolute priority
        const finalName = names[targetLanguage] || Object.values(names)[0];
        if (finalName !== displayName) {
          console.log(`Product service: CRITICAL: Final name override: "${displayName}" → "${finalName}"`);
          displayName = finalName;
        }
      }
      
      if (Object.keys(descriptions).length > 0) {
        // If translations exist, they take absolute priority
        const finalDescription = descriptions[targetLanguage] || Object.values(descriptions)[0];
        if (finalDescription !== displayDescription) {
          console.log(`Product service: CRITICAL: Final description override: "${displayDescription?.substring(0, 50)}..." → "${finalDescription?.substring(0, 50)}..."`);
          displayDescription = finalDescription;
        }
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
      console.log('Product service: UNIFIED SAVE - Starting update for product ID:', id);
      console.log('Product service: UNIFIED SAVE - All updates to apply:', updates);

      // Extract all content from updates
      const { names, descriptions, ...basicFields } = updates;

      // UNIFIED APPROACH: Save everything in one operation like descriptions do
      console.log('Product service: UNIFIED SAVE - Processing all fields together');

      // 1. Get existing translations to preserve unchanged fields
      const { data: existingTranslations, error: fetchError } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', id);
      
      if (fetchError) {
        console.error('Product service: UNIFIED SAVE - Error fetching existing translations:', fetchError);
        throw fetchError;
      }
      
      const existingByLanguage: Record<string, { name?: string | null, description?: string | null }> = {};
      (existingTranslations || []).forEach(t => {
        existingByLanguage[t.language_code] = { name: t.name, description: t.description };
      });

      // 2. UNIFIED SAVE: Process ALL translations (names + descriptions) together
      if (names || descriptions) {
        console.log('Product service: UNIFIED SAVE - Processing multilingual content');
        
        // Get all language codes that need updates
        const allLanguages = new Set([
          ...(names ? Object.keys(names) : []),
          ...(descriptions ? Object.keys(descriptions) : [])
        ]);
        
        console.log('Product service: UNIFIED SAVE - Languages to update:', Array.from(allLanguages));
        
        // Process each language in one unified operation
        for (const languageCode of allLanguages) {
          console.log(`Product service: UNIFIED SAVE - Processing language: ${languageCode}`);
          
          const existing = existingByLanguage[languageCode] || {};
          const newName = names?.[languageCode] || existing.name;
          const newDescription = descriptions?.[languageCode] || existing.description;
          
          console.log(`Product service: UNIFIED SAVE - ${languageCode}: name="${newName}", description="${newDescription?.substring(0, 50)}..."`);
          
          // UNIFIED UPSERT: Save both name and description together (like descriptions do)
          const { error: translationError } = await supabase
            .from('product_translations')
            .upsert({
              product_id: id,
              language_code: languageCode,
              name: newName || null,
              description: newDescription || null
            }, {
              onConflict: 'product_id,language_code'
            });

          if (translationError) {
            console.error(`Product service: UNIFIED SAVE - Error updating ${languageCode}:`, translationError);
            throw translationError;
          }
          console.log(`Product service: UNIFIED SAVE - Successfully updated ${languageCode}`);
        }
      }

      // 3. UNIFIED SAVE: Update basic fields (category, model, etc.) together
      if (Object.keys(basicFields).length > 0) {
        console.log('Product service: UNIFIED SAVE - Updating basic fields:', basicFields);
        
        // Clean and prepare basic field updates
        const cleanBasicUpdates: any = {};
        Object.entries(basicFields).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            cleanBasicUpdates[key] = value;
          }
        });
        
        if (Object.keys(cleanBasicUpdates).length > 0) {
          console.log('Product service: UNIFIED SAVE - Clean basic updates:', cleanBasicUpdates);
          
          const { error: basicError } = await supabase
            .from('products')
            .update(cleanBasicUpdates)
            .eq('id', id);

          if (basicError) {
            console.error('Product service: UNIFIED SAVE - Error updating basic fields:', basicError);
            throw basicError;
          }
          console.log('Product service: UNIFIED SAVE - Basic fields updated successfully');
        }
      }

      // 4. UNIFIED SAVE: Mirror English content to base table for reliability
      if (names?.['en'] || descriptions?.['en']) {
        console.log('Product service: UNIFIED SAVE - Mirroring English content to base table');
        
        const baseUpdates: any = {};
        if (names?.['en']) {
          baseUpdates.name = names['en'].trim();
          console.log(`Product service: UNIFIED SAVE - Mirroring English name: "${names['en']}"`);
        }
        if (descriptions?.['en']) {
          baseUpdates.description = descriptions['en'].trim();
          console.log(`Product service: UNIFIED SAVE - Mirroring English description: "${descriptions['en'].substring(0, 50)}..."`);
        }
        
        if (Object.keys(baseUpdates).length > 0) {
          const { error: mirrorError } = await supabase
            .from('products')
            .update(baseUpdates)
            .eq('id', id);

          if (mirrorError) {
            console.error('Product service: UNIFIED SAVE - Error mirroring to base table:', mirrorError);
            throw mirrorError;
          }
          console.log('Product service: UNIFIED SAVE - English content mirrored to base table');
        }
      }

      // 5. UNIFIED SAVE: Fetch final result (same as descriptions do)
      console.log('Product service: UNIFIED SAVE - Fetching final product');
      const { data: finalProduct, error: finalFetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (finalFetchError) {
        console.error('Product service: UNIFIED SAVE - Error fetching final product:', finalFetchError);
        throw finalFetchError;
      }

      // 6. UNIFIED SAVE: Get final translations (same as descriptions do)
      const { data: finalTranslations, error: finalTransError } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', id);

      if (finalTransError) {
        console.error('Product service: UNIFIED SAVE - Error fetching final translations:', finalTransError);
        // Don't throw here - we still have the main product
      }

      // 7. UNIFIED SAVE: Organize final data (same as descriptions do)
      const finalNames: Record<string, string> = {};
      const finalDescriptions: Record<string, string> = {};

      if (finalTranslations) {
        finalTranslations.forEach(translation => {
          if (translation.name) {
            finalNames[translation.language_code] = translation.name;
          }
          if (translation.description) {
            finalDescriptions[translation.language_code] = translation.description;
          }
        });
      }

      // 8. UNIFIED SAVE: Return complete product (same as descriptions do)
      const updatedProduct: UnifiedProduct = {
        ...finalProduct,
        features: finalProduct.features || [],
        price: finalProduct.price || 0,
        inStock: finalProduct.inStock || finalProduct.in_stock || false,
        image: finalProduct.image || finalProduct.image_url || '',
        names: finalNames,
        descriptions: finalDescriptions
      };

      console.log('Product service: UNIFIED SAVE - Successfully completed all updates:', updatedProduct);
      return updatedProduct;

    } catch (error) {
      console.error('Product service: UNIFIED SAVE - Error in updateProduct:', error);
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
      // FIX: Handle missing showInFeatured column gracefully
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only add the showInFeatured filter if the column exists
      // For now, just get all products and filter in memory
      const { data: allProducts, error: productError } = await query;

      if (productError) {
        console.error('Product service: Error fetching products:', productError);
        throw productError;
      }

      if (!allProducts || allProducts.length === 0) {
        console.log('Product service: No products found');
        return [];
      }

      // Filter featured products in memory (since showInFeatured column might not exist)
      const featuredProducts = allProducts.filter(p => {
        // If showInFeatured column exists, use it; otherwise show all products
        return p.showInFeatured === true || p.showInFeatured === undefined;
      });

      if (featuredProducts.length === 0) {
        console.log('Product service: No featured products found');
        return [];
      }

      console.log(`Product service: Found ${featuredProducts.length} featured products out of ${allProducts.length} total`);

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

