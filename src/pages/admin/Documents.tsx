import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  isActive: boolean;
  order: number;
}

const categories = ['Company', 'Technical', 'Safety', 'Installation', 'Maintenance'];

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Document>({
    id: '',
    title: '',
    category: '',
    description: '',
    url: '',
    isActive: true,
    order: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('order', { ascending: true });
    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData(document);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    if (editingDocument && editingDocument.id) {
      const { error } = await supabase
        .from('documents')
        .update(formData)
        .eq('id', editingDocument.id);
      if (error) {
        alert('Error updating document');
      }
    } else {
      const { error } = await supabase
        .from('documents')
        .insert([{ ...formData }]);
      if (error) {
        alert('Error adding document');
    }
    }
    await fetchDocuments();
    setShowForm(false);
    setEditingDocument(null);
    setFormData({
      id: '',
      title: '',
      category: '',
      description: '',
      url: '',
      isActive: true,
      order: 1
    });
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setLoading(true);
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Error deleting document');
    }
    await fetchDocuments();
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingDocument(null);
    setFormData({
      id: '',
      title: '',
      category: '',
      description: '',
      url: '',
      isActive: true,
      order: documents.length + 1
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('documents')
      .update({ isActive: !current })
      .eq('id', id);
    if (error) {
      alert('Error toggling active state');
    }
    await fetchDocuments();
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
              Back to Documents
            </Button>
            <h1 className="text-2xl font-bold">
              {editingDocument?.id ? 'Edit Document' : 'Add New Document'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto p-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="url">Document URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="mt-1"
                  placeholder="/assets/document.pdf"
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
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
                <Button onClick={handleSave} className="flex-1" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Document'}
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
          <h1 className="text-2xl font-bold">Manage Documents</h1>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Documents Management</h1>
            <p className="text-muted-foreground">Manage your documents</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">{document.title}</h3>
                        <Badge variant={document.isActive ? "default" : "secondary"}>
                          {document.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{document.category}</Badge>
                        <Badge variant="outline">Order: {document.order}</Badge>
                      <p className="text-muted-foreground text-sm mb-2 mt-2 line-clamp-2">
                        {document.description}
                      </p>
                      <a href={document.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">View Document</a>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(document)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(document.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                        variant={document.isActive ? "destructive" : "default"}
                        className={document.isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}
                        onClick={() => toggleActive(document.id, document.isActive)}
                    >
                        {document.isActive ? (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
        {documents.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first document.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDocuments; 