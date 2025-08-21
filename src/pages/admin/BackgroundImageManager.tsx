import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Image as ImageIcon, Settings, Eye, Download, Trash2, Upload, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mediaService, BackgroundImageConfig } from '@/services/mediaService';
import { Database } from '@/integrations/supabase/types';

type PageBackground = Database['public']['Tables']['page_backgrounds']['Row'];
type MediaFile = Database['public']['Tables']['media_files']['Row'];

interface BackgroundImageManagerProps {
  onBack?: () => void;
}

const BackgroundImageManager: React.FC<BackgroundImageManagerProps> = ({ onBack }) => {
  const [pageBackgrounds, setPageBackgrounds] = useState<PageBackground[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageBackground | null>(null);
  const [editingConfig, setEditingConfig] = useState<BackgroundImageConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [storageUsage, setStorageUsage] = useState<{ current: number; max: number; percentage: number; status: string } | null>(null);

  useEffect(() => {
    loadPageBackgrounds();
    loadMediaFiles();
    loadStorageUsage();
  }, []);

  const loadPageBackgrounds = async () => {
    try {
      const backgrounds = await mediaService.getAllPageBackgrounds();
      setPageBackgrounds(backgrounds);
    } catch (error) {
      console.error('Error loading page backgrounds:', error);
    }
  };

  const loadMediaFiles = async () => {
    try {
      const files = await mediaService.getMediaFiles({ isPublic: true });
      setMediaFiles(files);
    } catch (error) {
      console.error('Error loading media files:', error);
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

  const handleEditPage = (page: PageBackground) => {
    setSelectedPage(page);
    setEditingConfig({
      pageIdentifier: page.page_identifier,
      imageId: page.background_image_id || undefined,
      imageUrl: page.background_image_url || undefined,
      position: page.background_position,
      size: page.background_size,
      repeat: page.background_repeat,
      attachment: page.background_attachment,
      overlayColor: page.overlay_color || undefined,
      overlayOpacity: page.overlay_opacity
    });
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    setLoading(true);
    try {
      await mediaService.updatePageBackground(editingConfig.pageIdentifier, editingConfig);
      await loadPageBackgrounds();
      setSelectedPage(null);
      setEditingConfig(null);
    } catch (error) {
      console.error('Error saving background configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: MediaFile) => {
    setSelectedImage(image);
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        imageId: image.id,
        imageUrl: mediaService.getPublicUrl(image.file_path)
      });
    }
    setShowMediaLibrary(false);
  };

  const handleRemoveImage = () => {
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        imageId: undefined,
        imageUrl: undefined
      });
    }
    setSelectedImage(null);
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview background:', editingConfig);
  };

  const handleDownload = async (image: MediaFile) => {
    try {
      await mediaService.downloadFile(image.file_path, image.original_filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page background configuration? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await mediaService.deletePageBackground(pageId);
      await loadPageBackgrounds();
    } catch (error) {
      console.error('Error deleting page background:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMediaFiles = mediaFiles.filter(file => 
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  if (showMediaLibrary) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Button
              onClick={() => setShowMediaLibrary(false)}
              variant="secondary"
              className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Background Manager
            </Button>
            <h1 className="text-2xl font-bold">Select Background Image</h1>
            <p className="text-primary-foreground/80">Choose an image from your media library</p>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <div className="mb-6">
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMediaFiles.map((file) => (
              <Card 
                key={file.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleImageSelect(file)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded mb-3 flex items-center justify-center">
                    {file.mime_type.startsWith('image/') ? (
                      <img
                        src={mediaService.getPublicUrl(file.file_path)}
                        alt={file.alt_text || file.original_filename}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">{file.original_filename}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {file.description || 'No description'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMediaFiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No images found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          {onBack ? (
            <Button
              onClick={onBack}
              variant="secondary"
              className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link to="/admin/dashboard">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold">Background Image Manager</h1>
          <p className="text-primary-foreground/80">Manage background images for all pages</p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pages">Page Backgrounds</TabsTrigger>
            <TabsTrigger value="storage">Storage Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <div className="grid gap-6">
              {pageBackgrounds.map((page) => (
                <Card key={page.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          {page.background_image_url ? (
                            <img
                              src={page.background_image_url}
                              alt={`Background for ${page.page_name}`}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{page.page_name}</h3>
                            <Badge variant="outline">{page.page_identifier}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Position:</span> {page.background_position}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {page.background_size}
                            </div>
                            <div>
                              <span className="font-medium">Repeat:</span> {page.background_repeat}
                            </div>
                            <div>
                              <span className="font-medium">Attachment:</span> {page.background_attachment}
                            </div>
                          </div>
                          {page.overlay_color && (
                            <div className="mt-2">
                              <span className="font-medium">Overlay:</span> {page.overlay_color} ({page.overlay_opacity}%)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPage(page)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview()}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pageBackgrounds.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No page backgrounds configured yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            {storageUsage && (
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Background Images Storage</span>
                    <Badge variant={getStorageStatusColor(storageUsage.status) as any}>
                      {storageUsage.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used: {formatFileSize(storageUsage.current)}</span>
                      <span>Total: {formatFileSize(storageUsage.max)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          storageUsage.status === 'CRITICAL' ? 'bg-destructive' :
                          storageUsage.status === 'WARNING' ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {storageUsage.percentage.toFixed(1)}% used
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Configuration Dialog */}
        <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Background Configuration - {selectedPage?.page_name}</DialogTitle>
              <DialogDescription>
                Configure the background image and styling for this page.
              </DialogDescription>
            </DialogHeader>
            
            {editingConfig && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="position">Background Position</Label>
                    <Select
                      value={editingConfig.position}
                      onValueChange={(value) => setEditingConfig({...editingConfig, position: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center center">Center Center</SelectItem>
                        <SelectItem value="top left">Top Left</SelectItem>
                        <SelectItem value="top center">Top Center</SelectItem>
                        <SelectItem value="top right">Top Right</SelectItem>
                        <SelectItem value="center left">Center Left</SelectItem>
                        <SelectItem value="center right">Center Right</SelectItem>
                        <SelectItem value="bottom left">Bottom Left</SelectItem>
                        <SelectItem value="bottom center">Bottom Center</SelectItem>
                        <SelectItem value="bottom right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Background Size</Label>
                    <Select
                      value={editingConfig.size}
                      onValueChange={(value) => setEditingConfig({...editingConfig, size: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="100% 100%">100% 100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="repeat">Background Repeat</Label>
                    <Select
                      value={editingConfig.repeat}
                      onValueChange={(value) => setEditingConfig({...editingConfig, repeat: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-repeat">No Repeat</SelectItem>
                        <SelectItem value="repeat">Repeat</SelectItem>
                        <SelectItem value="repeat-x">Repeat X</SelectItem>
                        <SelectItem value="repeat-y">Repeat Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="attachment">Background Attachment</Label>
                    <Select
                      value={editingConfig.attachment}
                      onValueChange={(value) => setEditingConfig({...editingConfig, attachment: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scroll">Scroll</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Background Image</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      {editingConfig.imageUrl ? (
                        <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                          <img
                            src={editingConfig.imageUrl}
                            alt="Selected background"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          {editingConfig.imageUrl ? 'Change Image' : 'Select Image'}
                        </Button>
                        {editingConfig.imageUrl && (
                          <Button
                            variant="outline"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="overlayColor">Overlay Color</Label>
                      <Input
                        id="overlayColor"
                        type="color"
                        value={editingConfig.overlayColor || '#000000'}
                        onChange={(e) => setEditingConfig({...editingConfig, overlayColor: e.target.value})}
                        className="w-full h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="overlayOpacity">Overlay Opacity: {editingConfig.overlayOpacity}%</Label>
                      <Slider
                        id="overlayOpacity"
                        value={[editingConfig.overlayOpacity]}
                        onValueChange={(value) => setEditingConfig({...editingConfig, overlayOpacity: value[0]})}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSaveConfig} className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPage(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BackgroundImageManager;
