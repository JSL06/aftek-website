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
  
  // Separate language columns for titles
  title_en: string;
  title_zh_hant: string;
  title_ja: string;
  title_ko: string;
  title_th: string;
  title_vi: string;
  
  // Separate language columns for excerpts
  excerpt_en: string;
  excerpt_zh_hant: string;
  excerpt_ja: string;
  excerpt_ko: string;
  excerpt_th: string;
  excerpt_vi: string;
  
  // Separate language columns for authors
  author_en: string;
  author_zh_hant: string;
  author_ja: string;
  author_ko: string;
  author_th: string;
  author_vi: string;
  
  // Separate language columns for categories
  category_en: string;
  category_zh_hant: string;
  category_ja: string;
  category_ko: string;
  category_th: string;
  category_vi: string;
  
  // Separate language columns for content blocks
  content_blocks_en?: ContentBlock[];
  content_blocks_zh_hant?: ContentBlock[];
  content_blocks_ja?: ContentBlock[];
  content_blocks_ko?: ContentBlock[];
  content_blocks_th?: ContentBlock[];
  content_blocks_vi?: ContentBlock[];
  
  // Related data
  tags?: ArticleTag[];
  images?: ArticleImage[];
  
  // New fields for related content
  related_products?: string[];
  related_links?: Array<{ title: string; url: string; description?: string }>;
  custom_buttons?: Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>;
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
  
  // Separate language columns for titles
  title_en: string;
  title_zh_hant: string;
  title_ja: string;
  title_ko: string;
  title_th: string;
  title_vi: string;
  
  // Separate language columns for excerpts
  excerpt_en: string;
  excerpt_zh_hant: string;
  excerpt_ja: string;
  excerpt_ko: string;
  excerpt_th: string;
  excerpt_vi: string;
  
  // Separate language columns for authors
  author_en: string;
  author_zh_hant: string;
  author_ja: string;
  author_ko: string;
  author_th: string;
  author_vi: string;
  
  // Separate language columns for categories
  category_en: string;
  category_zh_hant: string;
  category_ja: string;
  category_ko: string;
  category_th: string;
  category_vi: string;
  
  // Separate language columns for content blocks
  content_blocks_en?: ContentBlock[];
  content_blocks_zh_hant?: ContentBlock[];
  content_blocks_ja?: ContentBlock[];
  content_blocks_ko?: ContentBlock[];
  content_blocks_th?: ContentBlock[];
  content_blocks_vi?: ContentBlock[];
  
  // Related data
  tags?: ArticleTag[];
  images?: ArticleImage[];
  
  // New fields for related content
  related_products?: string[];
  related_links?: Array<{ title: string; url: string; description?: string }>;
  custom_buttons?: Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>;
}

class ArticleService {
  private articles: Article[] = [];
  private tags: ArticleTag[] = [];

  async loadArticlesFromDatabase(): Promise<Article[]> {
    try {
      // First, get articles without complex joins to avoid foreign key issues
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (articlesError) {
        console.error('Error loading articles:', articlesError);
        return [];
      }

      // Then, get tags separately
      const { data: tagsData, error: tagsError } = await supabase
        .from('article_tags')
        .select('*');

      if (tagsError) {
        console.error('Error loading tags:', tagsError);
      }

      // Get article-tag relationships
      const { data: junctionData, error: junctionError } = await supabase
        .from('article_tags_junction')
        .select('*');

      if (junctionError) {
        console.error('Error loading article-tag relationships:', junctionError);
      }

      // Get article images
      const { data: imagesData, error: imagesError } = await supabase
        .from('article_images')
        .select('*');

      if (imagesError) {
        console.error('Error loading article images:', imagesError);
      }

      // Transform the data to match our interface
      this.articles = (articlesData || []).map(article => {
        // Find tags for this article
        const articleTags = junctionData
          ?.filter(j => j.article_id === article.id)
          ?.map(j => tagsData?.find(t => t.id === j.tag_id))
          ?.filter(Boolean) || [];

        // Find images for this article
        const articleImages = imagesData
          ?.filter(img => img.article_id === article.id) || [];

        return {
          ...article,
          tags: articleTags,
          images: articleImages
        };
      });
      
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
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          return null;
        }

        article = data as Article;
        
        if (article) {
          // Ensure content_blocks is properly parsed
          if (typeof article.content_blocks === 'string') {
            try {
              article.content_blocks = JSON.parse(article.content_blocks);
            } catch (e) {
              console.warn('Failed to parse content_blocks:', e);
              article.content_blocks = [];
            }
          }
          
          // Ensure other JSONB fields are properly parsed
          if (typeof article.titles === 'string') {
            try {
              article.titles = JSON.parse(article.titles);
            } catch (e) {
              article.titles = {};
            }
          }
          
          if (typeof article.contents === 'string') {
            try {
              article.contents = JSON.parse(article.contents);
            } catch (e) {
              article.contents = {};
            }
          }
          
          if (typeof article.excerpts === 'string') {
            try {
              article.excerpts = JSON.parse(article.excerpts);
            } catch (e) {
              article.excerpts = {};
            }
          }
          
          if (typeof article.authors_multilingual === 'string') {
            try {
              article.authors_multilingual = JSON.parse(article.authors_multilingual);
            } catch (e) {
              article.authors_multilingual = {};
            }
          }
          
          if (typeof article.categories_multilingual === 'string') {
            try {
              article.categories_multilingual = JSON.parse(article.categories_multilingual);
            } catch (e) {
              article.categories_multilingual = {};
            }
          }
          
          if (typeof article.related_products === 'string') {
            try {
              article.related_products = JSON.parse(article.related_products);
            } catch (e) {
              article.related_products = [];
            }
          }
          
          if (typeof article.related_links === 'string') {
            try {
              article.related_links = JSON.parse(article.related_links);
            } catch (e) {
              article.related_links = [];
            }
          }
          
          if (typeof article.custom_buttons === 'string') {
            try {
              article.custom_buttons = JSON.parse(article.custom_buttons);
            } catch (e) {
              article.custom_buttons = [];
            }
          }
          
          this.articles.push(article);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        return null;
      }
    }

    return article || null;
  }

  async getArticleById(id: string): Promise<Article | null> {
    // First check local cache
    let article = this.articles.find(a => a.id === id);
    
    if (!article) {
      // If not in cache, fetch from database
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching article by ID:', error);
          return null;
        }

        article = data as Article;
        
        if (article) {
          // Ensure content_blocks is properly parsed
          if (typeof article.content_blocks === 'string') {
            try {
              article.content_blocks = JSON.parse(article.content_blocks);
            } catch (e) {
              console.warn('Failed to parse content_blocks:', e);
              article.content_blocks = [];
            }
          }
          
          // Ensure other JSONB fields are properly parsed
          if (typeof article.titles === 'string') {
            try {
              article.titles = JSON.parse(article.titles);
            } catch (e) {
              article.titles = {};
            }
          }
          
          if (typeof article.contents === 'string') {
            try {
              article.contents = JSON.parse(article.contents);
            } catch (e) {
              article.contents = {};
            }
          }
          
          if (typeof article.excerpts === 'string') {
            try {
              article.excerpts = JSON.parse(article.excerpts);
            } catch (e) {
              article.excerpts = {};
            }
          }
          
          if (typeof article.authors_multilingual === 'string') {
            try {
              article.authors_multilingual = JSON.parse(article.authors_multilingual);
            } catch (e) {
              article.authors_multilingual = {};
            }
          }
          
          if (typeof article.categories_multilingual === 'string') {
            try {
              article.categories_multilingual = JSON.parse(article.categories_multilingual);
            } catch (e) {
              article.categories_multilingual = {};
            }
          }
          
          if (typeof article.related_products === 'string') {
            try {
              article.related_products = JSON.parse(article.related_products);
            } catch (e) {
              article.related_products = [];
            }
          }
          
          if (typeof article.related_links === 'string') {
            try {
              article.related_links = JSON.parse(article.related_links);
            } catch (e) {
              article.related_links = [];
            }
          }
          
          if (typeof article.custom_buttons === 'string') {
            try {
              article.custom_buttons = JSON.parse(article.custom_buttons);
            } catch (e) {
              article.custom_buttons = [];
            }
          }
          
          this.articles.push(article);
        }
      } catch (error) {
        console.error('Error fetching article by ID:', error);
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

      // Only send fields that exist in the database
      const articleData: any = {
        slug,
        featured_image: article.featured_image,
        read_time: article.read_time,
        published_at: article.published_at,
        is_published: article.is_published,
        titles: article.titles,
        contents: article.contents,
        excerpts: article.excerpts,
        authors_multilingual: article.authors_multilingual,
        categories_multilingual: article.categories_multilingual,
        content_blocks: article.content_blocks,
        related_products: article.related_products,
        related_links: article.related_links,
        custom_buttons: article.custom_buttons
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
      // Only send fields that exist in the database
      const validUpdates: any = {};
      
      // Basic fields
      if (updates.slug !== undefined) validUpdates.slug = updates.slug;
      if (updates.featured_image !== undefined) validUpdates.featured_image = updates.featured_image;
      if (updates.read_time !== undefined) validUpdates.read_time = updates.read_time;
      if (updates.published_at !== undefined) validUpdates.published_at = updates.published_at;
      if (updates.is_published !== undefined) validUpdates.is_published = updates.is_published;
      
      // Multilingual fields
      if (updates.titles !== undefined) validUpdates.titles = updates.titles;
      if (updates.contents !== undefined) validUpdates.contents = updates.contents;
      if (updates.excerpts !== undefined) validUpdates.excerpts = updates.excerpts;
      if (updates.authors_multilingual !== undefined) validUpdates.authors_multilingual = updates.authors_multilingual;
      if (updates.categories_multilingual !== undefined) validUpdates.categories_multilingual = updates.categories_multilingual;
      
      // Content blocks
      if (updates.content_blocks !== undefined) validUpdates.content_blocks = updates.content_blocks;
      
      // Related content fields
      if (updates.related_products !== undefined) validUpdates.related_products = updates.related_products;
      if (updates.related_links !== undefined) validUpdates.related_links = updates.related_links;
      if (updates.custom_buttons !== undefined) validUpdates.custom_buttons = updates.custom_buttons;
      
      const { data, error } = await supabase
        .from('articles')
        .update(validUpdates)
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
    // Ensure articles are loaded first
    if (this.articles.length === 0) {
      await this.loadArticlesFromDatabase();
    }
    return this.articles;
  }

  async getPublishedArticles(): Promise<Article[]> {
    // For public view, return only published articles
    // Ensure articles are loaded first
    if (this.articles.length === 0) {
      await this.loadArticlesFromDatabase();
    }
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
