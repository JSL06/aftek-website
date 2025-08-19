import { useState, useEffect } from 'react';
import { categoryService, MultilingualCategory } from '@/services/categoryService';

export const useCategories = (languageCode: string = 'en') => {
  const [categories, setCategories] = useState<MultilingualCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getCategories(languageCode);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [languageCode]);

  const refreshCategories = () => {
    loadCategories();
  };

  return {
    categories,
    loading,
    error,
    refreshCategories
  };
};
