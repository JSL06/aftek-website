import { supabase } from '@/integrations/supabase/client';
import { ContentBlock } from '@/components/InlineArticleEditor';

export interface ArticleTag {
  id: string;
  name: string;
  created_at?: string;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  order_index: number;
  created_at?: string;
}

export interface Article {
  id?: string;
  slug: string;
  featured_image?: string;
  read_time?: number;
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
  
  // Content blocks for inline editor
  content_blocks?: ContentBlock[];
  
  // Related data
  tags?: ArticleTag[];
  images?: ArticleImage[];
}

export interface MultilingualArticle {
  id?: string;
  slug: string;
  featured_image?: string;
  read_time?: number;
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
  
  // Content blocks for inline editor
  content_blocks?: ContentBlock[];
  
  // Related data
  tags?: ArticleTag[];
  images?: ArticleImage[];
}

class ArticleService {
  private articles: Article[] = [];
  private tags: ArticleTag[] = [];

  async loadArticlesFromDatabase(): Promise<Article[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          tags:article_tags_junction(
            tag:article_tags(*)
          ),
          images:article_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading articles:', error);
        return [];
      }

      // Transform the data to match our interface
      this.articles = (data || []).map(article => ({
        ...article,
        tags: article.tags?.map((t: any) => t.tag) || [],
        images: article.images || []
      }));
      
      return this.articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  async loadTagsFromDatabase(): Promise<ArticleTag[]> {
    try {
      const { data, error } = await supabase
        .from('article_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading tags:', error);
        return [];
      }

      this.tags = data || [];
      return this.tags;
    } catch (error) {
      console.error('Error loading tags:', error);
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
          .select(`
            *,
            tags:article_tags_junction(
              tag:article_tags(*)
            ),
            images:article_images(*)
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          return null;
        }

        article = {
          ...data,
          tags: data.tags?.map((t: any) => t.tag) || [],
          images: data.images || []
        };
        
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
      // Generate slug from English title if not provided
      let slug = article.slug;
      if (!slug && article.titles?.en) {
        slug = this.generateSlug(article.titles.en);
      }

      const articleData = {
        ...article,
        slug
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
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

  async uploadImage(file: File, articleId?: string): Promise<string | null> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `article-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // If articleId is provided, save image record
      if (articleId) {
        await this.saveImageRecord(articleId, publicUrl, file.name);
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  async saveImageRecord(articleId: string, imageUrl: string, altText?: string, caption?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('article_images')
        .insert([{
          article_id: articleId,
          image_url: imageUrl,
          alt_text: altText,
          caption: caption,
          order_index: 0
        }]);

      if (error) {
        console.error('Error saving image record:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving image record:', error);
      return false;
    }
  }

  async updateArticleTags(articleId: string, tagIds: string[]): Promise<boolean> {
    try {
      // First, remove all existing tag associations
      const { error: deleteError } = await supabase
        .from('article_tags_junction')
        .delete()
        .eq('article_id', articleId);

      if (deleteError) {
        console.error('Error removing existing tags:', deleteError);
        return false;
      }

      // Then, add new tag associations
      if (tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          article_id: articleId,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('article_tags_junction')
          .insert(tagAssociations);

        if (insertError) {
          console.error('Error adding new tags:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating article tags:', error);
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

  async getAllTags(): Promise<ArticleTag[]> {
    if (this.tags.length === 0) {
      return await this.loadTagsFromDatabase();
    }
    return this.tags;
  }

  // Helper function to generate slug from title
  generateSlug(title: string): string {
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Check if slug exists and append number if needed
    let finalSlug = slug;
    let counter = 1;
    
    while (this.articles.some(a => a.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  }

  // Helper function to convert database article to frontend article
  convertDatabaseToArticle(dbArticle: any): Article {
    return {
      id: dbArticle.id,
      slug: dbArticle.slug,
      featured_image: dbArticle.featured_image,
      read_time: dbArticle.read_time,
      published_at: dbArticle.published_at,
      is_published: dbArticle.is_published,
      created_at: dbArticle.created_at,
      updated_at: dbArticle.updated_at,
      titles: dbArticle.titles || {},
      contents: dbArticle.contents || {},
      excerpts: dbArticle.excerpts || {},
      authors_multilingual: dbArticle.authors_multilingual || {},
      categories_multilingual: dbArticle.categories_multilingual || {},
      content_blocks: dbArticle.content_blocks || [],
      tags: dbArticle.tags || [],
      images: dbArticle.images || []
    };
  }

  // Helper function to convert frontend article to database format
  convertArticleToDatabase(article: Article): any {
    return {
      slug: article.slug,
      featured_image: article.featured_image,
      read_time: article.read_time,
      published_at: article.published_at,
      is_published: article.is_published,
      titles: article.titles,
      contents: article.contents,
      excerpts: article.excerpts,
      authors_multilingual: article.authors_multilingual,
      categories_multilingual: article.categories_multilingual,
      content_blocks: article.content_blocks || []
    };
  }
}

export const articleService = new ArticleService();
export default articleService;
