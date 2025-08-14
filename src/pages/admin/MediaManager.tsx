import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, ArrowLeft, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  title: string;
  isActive: boolean;
  order: number;
}

const MediaManager = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<MediaItem>({
    id: '',
    url: '',
    type: 'image',
    title: '',
    isActive: true,
    order: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('order', { ascending: true });
      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data || []);
      }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    if (editingMedia && editingMedia.id) {
      const { error } = await supabase
        .from('media')
        .update(formData)
        .eq('id', editingMedia.id);
      if (error) {
        console.error('Error updating media:', error);
      }
    } else {
      const { error } = await supabase
        .from('media')
        .insert([{ ...formData }]);
      if (error) {
        console.error('Error adding media:', error);
      }
    }
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('order', { ascending: true });
    setMedia(data || []);
    setShowForm(false);
    setEditingMedia(null);
    setFormData({
      id: '',
      url: '',
      type: 'image',
      title: '',
      isActive: true,
      order: 1
    });
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting media:', error);
    }
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('order', { ascending: true });
    setMedia(data || []);
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingMedia(null);
    setFormData({
      id: '',
      url: '',
      type: 'image',
      title: '',
      isActive: true,
      order: media.length + 1
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('media')
      .update({ isActive: !current })
      .eq('id', id);
    if (error) {
      console.error('Error toggling media active state:', error);
    }
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('order', { ascending: true });
    setMedia(data || []);
    setLoading(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Button
              onClick={() => setShowForm(false)}
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Media Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Media title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="url">Media URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 border rounded px-2 py-1"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="1"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (Show on website)</Label>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Media
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Media Management</h1>
          <p className="text-primary-foreground/80">Manage images, videos, and media files</p>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="grid gap-6">
          {loading ? (
            <p>Loading media...</p>
          ) : media
            .sort((a, b) => a.order - b.order)
            .map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      {item.type === 'image' ? (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                        <span className="text-xs text-muted-foreground">Order: {item.order}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">URL: {item.url}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(item.id, item.isActive)}
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaManager;