import { supabase } from '@/integrations/supabase/client';

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MultilingualCategory extends ProductCategory {
  names: Record<string, string>;
  descriptions: Record<string, string>;
}

export class CategoryService {
  // Get all categories with translations for a specific language
  async getCategories(languageCode: string = 'en'): Promise<MultilingualCategory[]> {
    try {
      // Get base categories
      const { data: categories, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Get translations for all categories
      const { data: translations, error: translationsError } = await supabase
        .from('category_translations')
        .select('*')
        .in('category_id', categories?.map(c => c.id) || []);

      if (translationsError) throw translationsError;

      // Organize translations by category
      const translationsByCategory: Record<string, CategoryTranslation[]> = {};
      translations?.forEach(translation => {
        if (!translationsByCategory[translation.category_id]) {
          translationsByCategory[translation.category_id] = [];
        }
        translationsByCategory[translation.category_id].push(translation);
      });

      // Build multilingual categories
      return (categories || []).map(category => {
        const categoryTranslations = translationsByCategory[category.id] || [];
        
        const names: Record<string, string> = {};
        const descriptions: Record<string, string> = {};

        categoryTranslations.forEach(translation => {
          names[translation.language_code] = translation.name;
          if (translation.description) {
            descriptions[translation.language_code] = translation.description;
          }
        });

        return {
          ...category,
          names,
          descriptions
        };
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get a single category with translations
  async getCategory(id: string, languageCode: string = 'en'): Promise<MultilingualCategory | null> {
    try {
      // Get base category
      const { data: category, error: categoryError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (categoryError) throw categoryError;

      // Get translations
      const { data: translations, error: translationsError } = await supabase
        .from('category_translations')
        .select('*')
        .eq('category_id', id);

      if (translationsError) throw translationsError;

      // Organize translations
      const names: Record<string, string> = {};
      const descriptions: Record<string, string> = {};

      translations?.forEach(translation => {
        names[translation.language_code] = translation.name;
        if (translation.description) {
          descriptions[translation.language_code] = translation.description;
        }
      });

      return {
        ...category,
        names,
        descriptions
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Create a new category with translations
  async createCategory(categoryData: Partial<ProductCategory>, translations: Record<string, { name: string; description?: string }>): Promise<MultilingualCategory> {
    try {
      // Create base category
      const { data: category, error: categoryError } = await supabase
        .from('product_categories')
        .insert({
          name: categoryData.name || '',
          description: categoryData.description || null,
          display_order: categoryData.display_order || 0,
          is_active: categoryData.is_active ?? true,
          parent_id: categoryData.parent_id || null
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Create translations
      const translationPromises = Object.entries(translations).map(([languageCode, data]) =>
        supabase
          .from('category_translations')
          .insert({
            category_id: category.id,
            language_code,
            name: data.name,
            description: data.description || null
          })
      );

      await Promise.all(translationPromises);

      // Return the complete category
      return this.getCategory(category.id) as Promise<MultilingualCategory>;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update a category and its translations
  async updateCategory(id: string, categoryData: Partial<ProductCategory>, translations: Record<string, { name: string; description?: string }>): Promise<MultilingualCategory> {
    try {
      // Update base category
      if (Object.keys(categoryData).length > 0) {
        const { error: categoryError } = await supabase
          .from('product_categories')
          .update(categoryData)
          .eq('id', id);

        if (categoryError) throw categoryError;
      }

      // Update translations
      if (Object.keys(translations).length > 0) {
        const translationPromises = Object.entries(translations).map(([languageCode, data]) =>
          supabase
            .from('category_translations')
            .upsert({
              category_id: id,
              language_code,
              name: data.name,
              description: data.description || null
            }, {
              onConflict: 'category_id,language_code'
            })
        );

        await Promise.all(translationPromises);
      }

      // Return the updated category
      return this.getCategory(id) as Promise<MultilingualCategory>;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete a category (this will also delete translations due to CASCADE)
  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Toggle category active status
  async toggleCategoryActive(id: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling category active status:', error);
      throw error;
    }
  }

  // Reorder categories
  async reorderCategories(orderedIds: string[]): Promise<void> {
    try {
      const updatePromises = orderedIds.map((id, index) =>
        supabase
          .from('product_categories')
          .update({ display_order: index + 1 })
          .eq('id', id)
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
