import { supabase } from '@/integrations/supabase/client';
import { ContentBlock } from '@/components/InlineArticleEditor';

export interface Article {
  id?: string;
  slug: string;
  featured_image?: string;
  read_time?: number;
  tags?: string[];
  content_blocks?: ContentBlock[];
  published_at?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Multilingual fields
  titles: Record<string, string>;
  contents: Record<string, string>;
  excerpts: Record<string, string>;
  authors_multilingual: Record<string, string>;
  categories_multilingual: Record<string, string>;
}

export interface MultilingualArticle {
  id?: string;
  slug: string;
  featured_image?: string;
  read_time?: number;
  tags?: string[];
  content_blocks?: ContentBlock[];
  published_at?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Multilingual fields
  titles: Record<string, string>;
  contents: Record<string, string>;
  excerpts: Record<string, string>;
  authors_multilingual: Record<string, string>;
  categories_multilingual: Record<string, string>;
}

class ArticleService {
  private articles: Article[] = [];

  async loadArticlesFromDatabase(): Promise<Article[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading articles:', error);
        return [];
      }

      this.articles = data || [];
      return this.articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  async getArticle(slug: string): Promise<Article | null> {
    // First check local cache
    let article = this.articles.find(a => a.slug === slug);
    
    if (!article) {
      // If not in cache, fetch from database
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          return null;
        }

        article = data;
        if (article) {
          this.articles.push(article);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        return null;
      }
    }

    return article || null;
  }

  async addArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single();

      if (error) {
        console.error('Error adding article:', error);
        return null;
      }

      const newArticle = data as Article;
      this.articles.unshift(newArticle);
      return newArticle;
    } catch (error) {
      console.error('Error adding article:', error);
      return null;
    }
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating article:', error);
        return null;
      }

      const updatedArticle = data as Article;
      
      // Update local cache
      const index = this.articles.findIndex(a => a.id === id);
      if (index !== -1) {
        this.articles[index] = updatedArticle;
      }

      return updatedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      return null;
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        return false;
      }

      // Remove from local cache
      this.articles = this.articles.filter(a => a.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  async getAdminArticles(): Promise<Article[]> {
    // For admin, return all articles
    return this.articles;
  }

  async getPublishedArticles(): Promise<Article[]> {
    // For public view, return only published articles
    return this.articles.filter(article => article.is_published);
  }

  // Helper function to convert database article to frontend article
  convertDatabaseToArticle(dbArticle: any): Article {
    return {
      id: dbArticle.id,
      slug: dbArticle.slug,
      featured_image: dbArticle.featured_image,
      read_time: dbArticle.read_time,
      tags: dbArticle.tags || [],
      content_blocks: dbArticle.content_blocks || [],
      published_at: dbArticle.published_at,
      is_published: dbArticle.is_published,
      created_at: dbArticle.created_at,
      updated_at: dbArticle.updated_at,
      titles: dbArticle.titles || {},
      contents: dbArticle.contents || {},
      excerpts: dbArticle.excerpts || {},
      authors_multilingual: dbArticle.authors_multilingual || {},
      categories_multilingual: dbArticle.categories_multilingual || {}
    };
  }

  // Helper function to convert frontend article to database format
  convertArticleToDatabase(article: Article): any {
    return {
      slug: article.slug,
      featured_image: article.featured_image,
      read_time: article.read_time,
      tags: article.tags || [],
      content_blocks: article.content_blocks || [],
      published_at: article.published_at,
      is_published: article.is_published,
      titles: article.titles,
      contents: article.contents,
      excerpts: article.excerpts,
      authors_multilingual: article.authors_multilingual,
      categories_multilingual: article.categories_multilingual
    };
  }
}

export const articleService = new ArticleService();
export default articleService;
