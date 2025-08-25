import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { projectService } from '@/services/projectService';
import { articleService } from '@/services/articleService';

export interface AdminCounts {
  products: number;
  projects: number;
  articles: number;
  media: number;
  translations: number;
}

export const useAdminCounts = () => {
  const [counts, setCounts] = useState<AdminCounts>({
    products: 0,
    projects: 0,
    articles: 0,
    media: 0,
    translations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products count
      const products = await productService.getProducts();
      const productsCount = products.length;

      // Fetch projects count
      const projects = await projectService.getAdminProjects();
      const projectsCount = projects.length;

      // Fetch articles count
      const articles = await articleService.getAdminArticles();
      const articlesCount = articles.length;

      // For now, set media to 0 (can be implemented later)
      const mediaCount = 0;

      // Calculate translations count (products * languages)
      const languagesCount = 6; // en, zh-Hant, ja, ko, th, vi
      const translationsCount = productsCount * languagesCount;

      setCounts({
        products: productsCount,
        projects: projectsCount,
        articles: articlesCount,
        media: mediaCount,
        translations: translationsCount
      });

    } catch (err) {
      console.error('Error fetching admin counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch counts');
      // Set default counts on error
      setCounts({
        products: 0,
        projects: 0,
        articles: 0,
        media: 0,
        translations: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // Listen for product updates to refresh counts
  useEffect(() => {
    const handleProductUpdate = () => {
      console.log('🔄 Admin counts: Product update detected, refreshing counts...');
      fetchCounts();
    };

    // Listen for custom events from admin interface
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('productDeleted', handleProductUpdate);
    window.addEventListener('productAdded', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('productDeleted', handleProductUpdate);
      window.removeEventListener('productAdded', handleProductUpdate);
    };
  }, []);

  const refreshCounts = () => {
    fetchCounts();
  };

  return {
    counts,
    loading,
    error,
    refreshCounts
  };
};
