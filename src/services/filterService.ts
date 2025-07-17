import { supabase } from '@/integrations/supabase/client';

export interface FilterOption {
  id: string;
  type: string;
  value: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

class FilterService {
  private filterOptions: FilterOption[] = [];
  private initialized = false;

  constructor() {
    this.initializeFilterOptions();
  }

  private async initializeFilterOptions(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.loadFromDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing filter options:', error);
    }
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('filter_options')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.filterOptions = data || [];
    } catch (error) {
      console.error('Error loading filter options from database:', error);
      this.filterOptions = [];
    }
  }

  async getFilterOptionsByType(type: string): Promise<string[]> {
    await this.initializeFilterOptions();
    return this.filterOptions
      .filter(option => option.type === type && option.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(option => option.value);
  }

  async getAllFilterOptions(): Promise<FilterOption[]> {
    await this.initializeFilterOptions();
    return [...this.filterOptions];
  }

  async getCategories(): Promise<string[]> {
    return this.getFilterOptionsByType('category');
  }

  async getFeatures(): Promise<string[]> {
    return this.getFilterOptionsByType('feature');
  }

  async getLocations(): Promise<string[]> {
    return this.getFilterOptionsByType('location');
  }

  async getProjectTypes(): Promise<string[]> {
    return this.getFilterOptionsByType('project_type');
  }

  async forceRefresh(): Promise<void> {
    this.initialized = false;
    await this.initializeFilterOptions();
  }

  // Admin functions for managing filter options
  async addFilterOption(type: string, value: string): Promise<FilterOption> {
    try {
      const { data, error } = await supabase
        .from('filter_options')
        .insert({
          type,
          value: value.trim(),
          display_order: this.filterOptions.filter(opt => opt.type === type).length + 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      this.filterOptions.push(data);
      return data;
    } catch (error) {
      console.error('Error adding filter option:', error);
      throw error;
    }
  }

  async updateFilterOption(id: string, updates: Partial<FilterOption>): Promise<FilterOption | null> {
    try {
      const { data, error } = await supabase
        .from('filter_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this.filterOptions = this.filterOptions.map(opt => 
        opt.id === id ? data : opt
      );

      return data;
    } catch (error) {
      console.error('Error updating filter option:', error);
      throw error;
    }
  }

  async deleteFilterOption(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('filter_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.filterOptions = this.filterOptions.filter(opt => opt.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting filter option:', error);
      throw error;
    }
  }

  async toggleFilterOptionActive(id: string): Promise<boolean> {
    try {
      const option = this.filterOptions.find(opt => opt.id === id);
      if (!option) throw new Error('Filter option not found');

      const { error } = await supabase
        .from('filter_options')
        .update({ is_active: !option.is_active })
        .eq('id', id);

      if (error) throw error;

      this.filterOptions = this.filterOptions.map(opt => 
        opt.id === id ? { ...opt, is_active: !opt.is_active } : opt
      );

      return !option.is_active;
    } catch (error) {
      console.error('Error toggling filter option:', error);
      throw error;
    }
  }
}

export const filterService = new FilterService(); 