import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, ArrowLeft, Image as ImageIcon, Video, Upload, Download, Search, Filter, Eye } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mediaService, MediaUploadOptions, UploadProgress } from '@/services/mediaService';
import { Database } from '@/integrations/supabase/types';
import BackgroundImageManager from '@/components/admin/BackgroundImageManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type MediaCategory = Database['public']['Tables']['media_categories']['Row'];

interface MediaManagerProps {
  onBack?: () => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { mediaId } = useParams<{ mediaId: string }>();
  const { t } = useAdminLanguage();
  

  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [pages, setPages] = useState<{id: string, name: string}[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBackgroundManager, setShowBackgroundManager] = useState(false);
  const [formData, setFormData] = useState<Partial<MediaFile>>({
    description: '',
    is_public: true,
    page_id: undefined
  });
  const [uploadData, setUploadData] = useState<{
    file: File | null;
    pageId: string;
    description: string;
    isPublic: boolean;
  }>({
    file: null,
    pageId: 'none',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [storageUsage, setStorageUsage] = useState<{ current: number; max: number; percentage: number; status: string } | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth') === 'true';
    setIsAuthenticated(authStatus);
    
    if (!authStatus) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // Only load data if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMedia();
      loadPages();
      loadStorageUsage();
    }
  }, [isAuthenticated]); // Removed t dependency since we're using useTranslation now

  const loadMedia = async () => {
    try {
      setLoading(true);
      const files = await mediaService.getMediaFiles();
      setMedia(files);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      // Define the available pages based on actual website pages
      const availablePages = [
        { id: 'home', name: t('nav.home') },
        { id: 'about', name: t('nav.about') },
        { id: 'products', name: t('nav.products') },
        { id: 'projects', name: t('nav.projects') },
        { id: 'articles', name: t('nav.articles') },
        { id: 'guide', name: t('nav.guide') },
        { id: 'contact', name: t('nav.contact') }
      ];
      setPages(availablePages);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const loadStorageUsage = async () => {
    try {
      const usage = await mediaService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading storage usage:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) return;

    setUploading(true);
    try {
      const uploadOptions: MediaUploadOptions = {
        file: uploadData.file,
        pageId: uploadData.pageId === 'none' ? undefined : uploadData.pageId,
        description: uploadData.description,
        isPublic: uploadData.isPublic
      };

      await mediaService.uploadFile(uploadOptions);
      
      toast.success(t('media.uploadSuccess'));
      setShowUploadDialog(false);
      setUploadData({
        file: null,
        pageId: 'none',
        description: '',
        isPublic: true
      });
      loadMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(t('media.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: MediaFile) => {
    setEditingMedia(item);
    setFormData({
      description: item.description || '',
      is_public: item.is_public,
      page_id: item.page_id || undefined
    });
    // Navigate to the edit URL
    navigate(`/admin/media/${item.id}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/media');
    setShowForm(false);
    setEditingMedia(null);
    setFormData({
      description: '',
      is_public: true,
      page_id: undefined
    });
  };

  const handleSave = async () => {
    if (!editingMedia) return;

    setLoading(true);
    try {
      await mediaService.updateMediaFile(editingMedia.id, formData);
      await loadMedia();
    setShowForm(false);
    setEditingMedia(null);
    setFormData({
        description: '',
        is_public: true,
        page_id: undefined
      });
      toast.success('Media updated successfully!');
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error(`Error updating media: ${error}`);
    } finally {
    setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await mediaService.deleteMediaFile(id);
      await loadMedia();
      await loadStorageUsage();
    } catch (error) {
      console.error('Error deleting media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: MediaFile) => {
    try {
      await mediaService.downloadFile(file.file_path, file.original_filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleAddNew = () => {
    setEditingMedia(null);
    setFormData({
      description: '',
      is_public: true,
      page_id: undefined
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    setLoading(true);
    try {
      await mediaService.updateMediaFile(id, { is_public: !current });
      await loadMedia();
    } catch (error) {
      console.error('Error toggling media active state:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = 
      item.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.page_id === selectedCategory; // Changed from category_id to page_id
    
    return matchesSearch && matchesCategory;
  });

  const getStorageStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'destructive';
      case 'WARNING': return 'warning';
      case 'OK': return 'default';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate unique URL for each image
  const generateImageUrl = (imageId: string) => {
    return `/media/${imageId}`;
  };

  // Check if we're editing a specific media item
  useEffect(() => {
    if (mediaId && media.length > 0) {
      const mediaItem = media.find(item => item.id === mediaId);
      if (mediaItem) {
        setEditingMedia(mediaItem);
        setFormData({
          description: mediaItem.description || '',
          is_public: mediaItem.is_public,
          page_id: mediaItem.page_id || undefined
        });
        setShowForm(true);
      }
    }
  }, [mediaId, media]);

  if (showBackgroundManager) {
    return (
      <BackgroundImageManager
        onBack={() => setShowBackgroundManager(false)}
      />
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Media
            </Button>
            <h1 className="text-2xl font-bold">
              {editingMedia?.id ? 'Edit Media' : 'Add New Media'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto p-8">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Media Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Image Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Image Preview</h3>
                  {editingMedia && editingMedia.mime_type.startsWith('image/') ? (
                    <div className="relative">
                      <img
                        src={mediaService.getPublicUrl(editingMedia.file_path)}
                        alt={editingMedia.original_filename}
                        className="w-full h-auto max-h-96 object-contain rounded-lg border"
                      />
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p><strong>File:</strong> {editingMedia.original_filename}</p>
                        <p><strong>Size:</strong> {formatFileSize(editingMedia.file_size)}</p>
                        {editingMedia.width && editingMedia.height && (
                          <p><strong>Dimensions:</strong> {editingMedia.width}×{editingMedia.height}</p>
                        )}
                        <p><strong>Type:</strong> {editingMedia.mime_type}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="h-16 w-16 text-muted-foreground" />
                      <p className="ml-2 text-muted-foreground">Video/File Preview</p>
                    </div>
                  )}
                  
                  {/* Direct URL for the image */}
                  {editingMedia && (
                    <div className="space-y-2">
                      <Label htmlFor="image-url">Image Preview</Label>
                      <div className="text-sm text-muted-foreground">
                        <p>This image is being edited at: <code>/admin/media/{editingMedia.id}</code></p>
                      </div>
                    </div>
                  )}
              </div>

                {/* Right Side - Edit Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Edit Details</h3>
              <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Media description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                    <Label htmlFor="page">Page</Label>
                    <Select
                      value={formData.page_id || 'none'}
                      onValueChange={(value) => setFormData({...formData, page_id: value === 'none' ? undefined : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Page</SelectItem>
                        {pages.map(page => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                  className="rounded"
                />
                    <Label htmlFor="is_public">Public (Show on website)</Label>
              </div>
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave} className="flex-1" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Media'}
                </Button>
                <Button 
                  variant="outline" 
                      onClick={handleBack}
                  className="flex-1"
                >
                  Cancel
                </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">{t('media.title')}</h1>
          <p className="mt-2 opacity-90">{t('media.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{t('media.uploadNewMedia')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('media.selectFile')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('media.descriptionLabel')}
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                    placeholder={t('media.descriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('media.page')}
                  </label>
                  <select
                    value={uploadData.pageId}
                    onChange={(e) => setUploadData({ ...uploadData, pageId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">{t('media.selectPage')}</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={uploadData.isPublic}
                    onChange={(e) => setUploadData({ ...uploadData, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    {t('media.public')}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpload}
                  disabled={!uploadData.file || !uploadData.pageId}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {t('media.upload')}
                </button>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  {t('media.cancel')}
                </button>
              </div>
        </div>
      </div>
        )}

        {editingMedia ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('media.editMedia')}</h2>
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← {t('media.backToMedia')}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Media Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('media.mediaDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('media.imagePreview')}</h4>
                    <img
                      src={editingMedia.file_path}
                      alt={editingMedia.original_filename}
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('media.fileInfo')}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                                              <div><span className="font-medium">{t('media.file')}:</span> {editingMedia.original_filename}</div>
                                              <div><span className="font-medium">{t('media.size')}:</span> {(editingMedia.file_size / 1024 / 1024).toFixed(2)} MB</div>
                                              <div><span className="font-medium">{t('media.dimensions')}:</span> {editingMedia.width}x{editingMedia.height}</div>
                                              <div><span className="font-medium">{t('media.type')}:</span> {editingMedia.mime_type}</div>
                    </div>
                    </div>
                  
                  <div className="text-sm text-gray-500">
                    {t('media.editingAt')}: <code>/admin/media/{editingMedia.id}</code>
                      </div>
                    </div>
                  </div>

              {/* Right: Edit Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('media.editDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('media.descriptionLabel')}
                    </label>
                    <textarea
                      value={editingMedia.description || ''}
                      onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                      placeholder={t('media.descriptionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('media.page')}
                    </label>
                    <select
                      value={editingMedia.page_id || ''}
                      onChange={(e) => setEditingMedia({ ...editingMedia, page_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">{t('media.selectPage')}</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublicEdit"
                      checked={editingMedia.is_public}
                      onChange={(e) => setEditingMedia({ ...editingMedia, is_public: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isPublicEdit" className="text-sm text-gray-700">
                      {t('media.public')}
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                    >
                      {t('media.saveMedia')}
                    </button>
                    <button
                      onClick={handleBack}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                    >
                                              {t('media.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowUploadDialog(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('media.uploadMedia')}
              </button>
            </div>

            {/* Media Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">{t('media.loading')}</div>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">{t('media.noMediaFound')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {media.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.file_path}
                        alt={item.original_filename}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                  </div>
                </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">{item.original_filename}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description || t('media.noDescription')}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        {(item.file_size / 1024 / 1024).toFixed(2)} MB • {item.width}x{item.height}
        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaManager;