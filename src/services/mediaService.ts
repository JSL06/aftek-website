import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];
type MediaFileUpdate = Database['public']['Tables']['media_files']['Update'];
type PageBackground = Database['public']['Tables']['page_backgrounds']['Row'];
type PageBackgroundUpdate = Database['public']['Tables']['page_backgrounds']['Update'];
type StorageQuota = Database['public']['Functions']['check_storage_quota']['Returns'][0];

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaUploadOptions {
  file: File;
  pageId?: string;
  description?: string;
  isPublic?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

export interface BackgroundImageConfig {
  pageIdentifier: string;
  imageId?: string;
  imageUrl?: string;
  position?: string;
  size?: string;
  repeat?: string;
  attachment?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

class MediaService {
  private readonly BUCKET_NAME = 'media';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  /**
   * Upload a file to Supabase storage and create a media file record
   */
  async uploadFile(options: MediaUploadOptions): Promise<MediaFile> {
    const { file, pageId, description, isPublic = true, onProgress } = options;

    // Validate file
    this.validateFile(file);

    // Check storage quota before upload
    await this.checkStorageQuota();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${this.BUCKET_NAME}/${filename}`;

    try {
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            if (onProgress) {
              onProgress({
                loaded: progress.loaded,
                total: progress.total,
                percentage: Math.round((progress.loaded / progress.total) * 100)
              });
            }
          }
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get file metadata
      const { data: fileData } = await supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Get image dimensions if it's an image
      let width: number | null = null;
      let height: number | null = null;
      
      if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        const dimensions = await this.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      }

      // Create media file record
      const mediaFile: MediaFileInsert = {
        filename,
        original_filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        alt_text: file.name,
        description,
        tags: [],
        page_id: pageId,
        is_public: isPublic,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || null
      };

      const { data: insertData, error: insertError } = await supabase
        .from('media_files')
        .insert([mediaFile])
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      return insertData;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Get all media files with optional filtering
   */
  async getMediaFiles(options?: {
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    isPublic?: boolean;
  }): Promise<MediaFile[]> {
    let query = supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.search) {
      query = query.or(`filename.ilike.%${options.search}%,original_filename.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options?.isPublic !== undefined) {
      query = query.eq('is_public', options.isPublic);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching media files:', error);
      throw new Error(`Failed to fetch media files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get media file by ID
   */
  async getMediaFile(id: string): Promise<MediaFile | null> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching media file:', error);
      return null;
    }

    return data;
  }

  /**
   * Update media file
   */
  async updateMediaFile(id: string, updates: MediaFileUpdate): Promise<MediaFile | null> {
    const { data, error } = await supabase
      .from('media_files')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media file:', error);
      throw new Error(`Failed to update media file: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete media file and remove from storage
   */
  async deleteMediaFile(id: string): Promise<boolean> {
    try {
      // Get file info first
      const mediaFile = await this.getMediaFile(id);
      if (!mediaFile) {
        throw new Error('Media file not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([mediaFile.file_path]);

      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting media file:', error);
      throw error;
    }
  }

  /**
   * Get page background configuration
   */
  async getPageBackground(pageIdentifier: string): Promise<PageBackground | null> {
    const { data, error } = await supabase
      .from('page_backgrounds')
      .select('*')
      .eq('page_identifier', pageIdentifier)
      .single();

    if (error) {
      console.error('Error fetching page background:', error);
      return null;
    }

    return data;
  }

  /**
   * Update page background configuration
   */
  async updatePageBackground(pageIdentifier: string, config: BackgroundImageConfig): Promise<PageBackground | null> {
    const updates: PageBackgroundUpdate = {
      background_image_id: config.imageId,
      background_image_url: config.imageUrl,
      background_position: config.position,
      background_size: config.size,
      background_repeat: config.repeat,
      background_attachment: config.attachment,
      overlay_color: config.overlayColor,
      overlay_opacity: config.overlayOpacity,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('page_backgrounds')
      .update(updates)
      .eq('page_identifier', pageIdentifier)
      .select()
      .single();

    if (error) {
      console.error('Error updating page background:', error);
      throw new Error(`Failed to update page background: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all page backgrounds
   */
  async getAllPageBackgrounds(): Promise<PageBackground[]> {
    const { data, error } = await supabase
      .from('page_backgrounds')
      .select('*')
      .order('page_name');

    if (error) {
      console.error('Error fetching page backgrounds:', error);
      throw new Error(`Failed to fetch page backgrounds: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check storage quota and return status
   */
  async checkStorageQuota(bucketName: string = 'media'): Promise<{
    bucket_name: string;
    total_size: number;
    file_count: number;
    max_size: number;
    quota_type: string;
    usage_percentage: number;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('check_storage_quota', {
        bucket_name_param: bucketName
      });

      if (error) {
        console.error('Error checking storage quota:', error);
        throw new Error(`Failed to check storage quota: ${error.message}`);
      }

      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error checking storage quota:', error);
      throw new Error(`Failed to check storage quota: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageUsage(): Promise<{ current: number; max: number; percentage: number; status: string }> {
    const mediaQuota = await this.checkStorageQuota(this.BUCKET_NAME);

    if (!mediaQuota) {
      return { current: 0, max: 0, percentage: 0, status: 'UNKNOWN' };
    }

    return {
      current: mediaQuota.total_size,
      max: mediaQuota.max_size,
      percentage: mediaQuota.usage_percentage,
      status: mediaQuota.quota_type
    };
  }

  /**
   * Get public URL for a media file
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Download a media file
   */
  async downloadFile(filePath: string, filename?: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.formatFileSize(this.MAX_FILE_SIZE)}`);
    }

    const allowedTypes = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension detection'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const mediaService = new MediaService();
export default mediaService;
