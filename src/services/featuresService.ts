import { supabase } from '@/integrations/supabase/client';

export interface MasterFeature {
  id: string;
  feature_key: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureTranslation {
  id: string;
  feature_id: string;
  language_code: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureWithTranslations {
  id: string;
  feature_key: string;
  category: string;
  display_order: number;
  is_active: boolean;
  translations: Record<string, string>; // language_code -> display_name
}

export interface FeatureCategory {
  id: string;
  name: string;
  features: FeatureWithTranslations[];
}

export class FeaturesService {
  /**
   * Fetch all active features with their translations
   */
  static async getAllFeatures(): Promise<FeatureWithTranslations[]> {
    try {
      // Fetch all active features
      const { data: features, error: featuresError } = await supabase
        .from('master_features')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (featuresError) {
        console.error('Error fetching features:', featuresError);
        throw featuresError;
      }

      if (!features || features.length === 0) {
        return [];
      }

      // Fetch all translations for these features
      const featureIds = features.map(f => f.id);
      const { data: translations, error: translationsError } = await supabase
        .from('feature_translations')
        .select('*')
        .in('feature_id', featureIds);

      if (translationsError) {
        console.error('Error fetching translations:', translationsError);
        throw translationsError;
      }

      // Combine features with their translations
      const featuresWithTranslations: FeatureWithTranslations[] = features.map(feature => {
        const featureTranslations = translations?.filter(t => t.feature_id === feature.id) || [];
        const translationsMap: Record<string, string> = {};
        
        featureTranslations.forEach(translation => {
          translationsMap[translation.language_code] = translation.display_name;
        });

        return {
          id: feature.id,
          feature_key: feature.feature_key,
          category: feature.category,
          display_order: feature.display_order,
          is_active: feature.is_active,
          translations: translationsMap
        };
      });

      return featuresWithTranslations;
    } catch (error) {
      console.error('Error in getAllFeatures:', error);
      throw error;
    }
  }

  /**
   * Fetch features grouped by category
   */
  static async getFeaturesByCategory(): Promise<FeatureCategory[]> {
    try {
      const features = await this.getAllFeatures();
      
      // Group features by category
      const categoriesMap: Record<string, FeatureWithTranslations[]> = {};
      
      features.forEach(feature => {
        if (!categoriesMap[feature.category]) {
          categoriesMap[feature.category] = [];
        }
        categoriesMap[feature.category].push(feature);
      });

      // Convert to array format and sort features within each category
      const categories: FeatureCategory[] = Object.entries(categoriesMap).map(([categoryId, categoryFeatures]) => ({
        id: categoryId,
        name: this.getCategoryDisplayName(categoryId),
        features: categoryFeatures.sort((a, b) => a.display_order - b.display_order)
      }));

      // Sort categories by their first feature's display order
      return categories.sort((a, b) => {
        const aOrder = a.features[0]?.display_order || 0;
        const bOrder = b.features[0]?.display_order || 0;
        return aOrder - bOrder;
      });
    } catch (error) {
      console.error('Error in getFeaturesByCategory:', error);
      throw error;
    }
  }

  /**
   * Get category display names
   */
  private static getCategoryDisplayName(categoryId: string): string {
    const categoryNames: Record<string, string> = {
      'environment': 'Environment',
      'performance': 'Performance',
      'material': 'Material Type',
      'special': 'Special Features'
    };
    return categoryNames[categoryId] || categoryId;
  }

  /**
   * Search features by term (searches in all languages)
   */
  static async searchFeatures(searchTerm: string): Promise<FeatureWithTranslations[]> {
    try {
      if (!searchTerm.trim()) {
        return await this.getAllFeatures();
      }

      const features = await this.getAllFeatures();
      const searchLower = searchTerm.toLowerCase();
      
      return features.filter(feature => {
        // Search in feature key
        if (feature.feature_key.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in all translations
        return Object.values(feature.translations).some(
          translation => translation.toLowerCase().includes(searchLower)
        );
      });
    } catch (error) {
      console.error('Error in searchFeatures:', error);
      throw error;
    }
  }

  /**
   * Get features by IDs
   */
  static async getFeaturesByIds(featureIds: string[]): Promise<FeatureWithTranslations[]> {
    try {
      if (!featureIds || featureIds.length === 0) {
        return [];
      }

      const { data: features, error: featuresError } = await supabase
        .from('master_features')
        .select('*')
        .in('id', featureIds)
        .eq('is_active', true);

      if (featuresError) {
        console.error('Error fetching features by IDs:', featuresError);
        throw featuresError;
      }

      if (!features || features.length === 0) {
        return [];
      }

      // Fetch translations for these features
      const { data: translations, error: translationsError } = await supabase
        .from('feature_translations')
        .select('*')
        .in('feature_id', featureIds);

      if (translationsError) {
        console.error('Error fetching translations by IDs:', translationsError);
        throw translationsError;
      }

      // Combine features with their translations
      return features.map(feature => {
        const featureTranslations = translations?.filter(t => t.feature_id === feature.id) || [];
        const translationsMap: Record<string, string> = {};
        
        featureTranslations.forEach(translation => {
          translationsMap[translation.language_code] = translation.display_name;
        });

        return {
          id: feature.id,
          feature_key: feature.feature_key,
          category: feature.category,
          display_order: feature.display_order,
          is_active: feature.is_active,
          translations: translationsMap
        };
      });
    } catch (error) {
      console.error('Error in getFeaturesByIds:', error);
      throw error;
    }
  }

  /**
   * Translate feature keys to display names for a specific language
   * This is useful for displaying features in product details
   */
  static async translateFeatureKeys(featureKeys: string[], language: string = 'en'): Promise<string[]> {
    try {
      if (!featureKeys || featureKeys.length === 0) {
        return [];
      }

      // Get all features with translations
      const allFeatures = await this.getAllFeatures();
      
      // Create a map of feature_key -> translated display_name
      const featureKeyToDisplay: Record<string, string> = {};
      allFeatures.forEach(feature => {
        const displayName = feature.translations[language] || feature.translations['en'] || feature.feature_key;
        featureKeyToDisplay[feature.feature_key] = displayName;
      });

      // Translate the feature keys to display names
      return featureKeys.map(key => featureKeyToDisplay[key] || key);
    } catch (error) {
      console.error('Error in translateFeatureKeys:', error);
      // Return original keys if translation fails
      return featureKeys;
    }
  }

  /**
   * Get a single feature by its key with translations
   */
  static async getFeatureByKey(featureKey: string): Promise<FeatureWithTranslations | null> {
    try {
      const { data: feature, error: featuresError } = await supabase
        .from('master_features')
        .select('*')
        .eq('feature_key', featureKey)
        .eq('is_active', true)
        .single();

      if (featuresError || !feature) {
        return null;
      }

      // Fetch translations for this feature
      const { data: translations, error: translationsError } = await supabase
        .from('feature_translations')
        .select('*')
        .eq('feature_id', feature.id);

      if (translationsError) {
        console.error('Error fetching feature translations:', translationsError);
        return null;
      }

      // Combine feature with translations
      const translationsMap: Record<string, string> = {};
      translations?.forEach(translation => {
        translationsMap[translation.language_code] = translation.display_name;
      });

      return {
        id: feature.id,
        feature_key: feature.feature_key,
        category: feature.category,
        display_order: feature.display_order,
        is_active: feature.is_active,
        translations: translationsMap
      };
    } catch (error) {
      console.error('Error in getFeatureByKey:', error);
      return null;
    }
  }
}

export default FeaturesService;
