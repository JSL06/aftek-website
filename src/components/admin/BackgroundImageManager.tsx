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

  const filteredMediaFiles = mediaFiles.filter(file => 
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedPage && editingConfig) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Button
              onClick={() => {
                setSelectedPage(null);
                setEditingConfig(null);
                setSelectedImage(null);
              }}
              variant="secondary"
              className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Background Manager
            </Button>
            <h1 className="text-2xl font-bold">Edit Background: {selectedPage.page_name}</h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Background Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Selection */}
                <div>
                  <Label>Background Image</Label>
                  <div className="mt-2 space-y-3">
                    {editingConfig.imageUrl ? (
                      <div className="relative">
                        <img
                          src={editingConfig.imageUrl}
                          alt="Background preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="absolute top-2 right-2 space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowMediaLibrary(true)}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-32 border-dashed"
                        onClick={() => setShowMediaLibrary(true)}
                      >
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p>Select Background Image</p>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Background Properties */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Position</Label>
                    <Select
                      value={editingConfig.position}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center center">Center</SelectItem>
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
                    <Label>Size</Label>
                    <Select
                      value={editingConfig.size}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="100%">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Repeat</Label>
                    <Select
                      value={editingConfig.repeat}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, repeat: value })}
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
                    <Label>Attachment</Label>
                    <Select
                      value={editingConfig.attachment}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, attachment: value })}
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

                {/* Overlay Settings */}
                <div>
                  <Label>Overlay Color</Label>
                  <div className="mt-2 space-y-3">
                    <Input
                      type="color"
                      value={editingConfig.overlayColor || '#000000'}
                      onChange={(e) => setEditingConfig({ ...editingConfig, overlayColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <div>
                      <Label>Overlay Opacity: {editingConfig.overlayOpacity}</Label>
                      <Slider
                        value={[editingConfig.overlayOpacity || 0]}
                        onValueChange={([value]) => setEditingConfig({ ...editingConfig, overlayOpacity: value })}
                        max={1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Saving...' : 'Save Background Configuration'}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-96 rounded border relative"
                  style={{
                    backgroundImage: editingConfig.imageUrl ? `url(${editingConfig.imageUrl})` : 'none',
                    backgroundPosition: editingConfig.position,
                    backgroundSize: editingConfig.size,
                    backgroundRepeat: editingConfig.repeat,
                    backgroundAttachment: editingConfig.attachment,
                    backgroundColor: '#f0f0f0'
                  }}
                >
                  {editingConfig.overlayColor && editingConfig.overlayOpacity && editingConfig.overlayOpacity > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: editingConfig.overlayColor,
                        opacity: editingConfig.overlayOpacity
                      }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-semibold">{selectedPage.page_name}</p>
                      <p className="text-sm">Background Preview</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Media Library Dialog */}
        <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Background Image</DialogTitle>
              <DialogDescription>
                Choose an image from your media library to use as the background for this page.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {filteredMediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded p-2 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleImageSelect(file)}
                  >
                    <img
                      src={mediaService.getPublicUrl(file.file_path)}
                      alt={file.alt_text || file.original_filename}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {file.original_filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.width && file.height ? `${file.width}×${file.height}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                          {page.background_image_id ? (
                            <ImageIcon className="h-8 w-8 text-primary" />
                          ) : (
                            <div className="text-muted-foreground text-center text-xs">
                              <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{page.page_name}</h3>
                            <Badge variant={page.background_image_id ? "default" : "secondary"}>
                              {page.background_image_id ? "Configured" : "No Background"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Page ID: {page.page_identifier}
                          </p>
                          {page.background_image_id && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Position: {page.background_position} | Size: {page.background_size}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Repeat: {page.background_repeat} | Attachment: {page.background_attachment}
                              </p>
                              {page.overlay_color && (
                                <p className="text-xs text-muted-foreground">
                                  Overlay: {page.overlay_color} ({page.overlay_opacity * 100}%)
                                </p>
                              )}
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
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            {storageUsage && (
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Media Storage</span>
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
                  {storageUsage.status === 'CRITICAL' && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                      ⚠️ Storage is nearly full! Consider upgrading your Supabase plan or removing unused files.
                    </div>
                  )}
                  {storageUsage.status === 'WARNING' && (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                      ⚠️ Storage usage is getting high. Consider cleaning up unused files.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BackgroundImageManager;
