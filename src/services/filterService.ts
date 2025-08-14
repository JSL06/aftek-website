import { supabase } from '../integrations/supabase/client';

export interface FilterOption {
  id: string;
  type: string;
  value: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const filterService = {
  async getFilterOptions(type?: string): Promise<FilterOption[]> {
    let query = supabase
      .from('filter_options')
      .select('*')
      .order('type', { ascending: true })
      .order('display_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }

    return data || [];
  },

  async getFilterOption(id: string): Promise<FilterOption | null> {
    const { data, error } = await supabase
      .from('filter_options')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching filter option:', error);
      throw error;
    }

    return data;
  },

  async createFilterOption(filterOption: Omit<FilterOption, 'id' | 'created_at' | 'updated_at'>): Promise<FilterOption> {
    const { data, error } = await supabase
      .from('filter_options')
      .insert([filterOption])
      .select()
      .single();

    if (error) {
      console.error('Error creating filter option:', error);
      throw error;
    }

    return data;
  },

  async updateFilterOption(id: string, updates: Partial<FilterOption>): Promise<FilterOption> {
    const { data, error } = await supabase
      .from('filter_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating filter option:', error);
      throw error;
    }

    return data;
  },

  async deleteFilterOption(id: string): Promise<void> {
    const { error } = await supabase
      .from('filter_options')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting filter option:', error);
      throw error;
    }
  },

  async getFilterOptionsByType(type: string): Promise<FilterOption[]> {
    const { data, error } = await supabase
      .from('filter_options')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching filter options by type:', error);
      throw error;
    }

    return data || [];
  },

  async getFeatures(): Promise<string[]> {
    // Get features from the filter_options table
    try {
      const features = await this.getFilterOptionsByType('feature');
      return features.map(f => f.value);
    } catch (error) {
      console.error('Error fetching features from database:', error);
      // Fallback to default features if database query fails
      return [
        'Energy Efficient',
        'Sustainable Design',
        'Smart Technology',
        'Modular Construction',
        'Green Building',
        'LEED Certified',
        'BIM Implementation',
        'Prefabricated Components',
        'Renewable Energy',
        'Water Conservation',
        'Waste Management',
        'Accessibility',
        'Security Systems',
        'HVAC Systems',
        'Lighting Design'
      ];
    }
  }
}; 