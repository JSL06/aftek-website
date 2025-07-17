import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2, Edit, Trash2, Plus, MapPin, Calendar, Save, Upload, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import { productService } from '@/services/productService';
import { filterService } from '@/services/filterService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminProjects = () => {
  const { projects, loading, addProject, updateProject, deleteProject, refetch } = useAdminProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    name: '',
    description: '',
    location: '',
    category: '',
    client: '',
    completion_date: '',
    project_type: '',
    image: '',
    features: [],
    products_used: [],
    project_value: '',
    duration: '',
    challenges: '',
    solutions: '',
    results: '',
    isActive: true,
    showInFeatured: false,
    displayOrder: 99
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      name: project.name,
      description: project.description,
      location: project.location,
      category: project.category,
      client: project.client,
      completion_date: project.completion_date,
      project_type: project.project_type,
      image: project.image,
      features: project.features || [],
      products_used: project.products_used || [],
      project_value: project.project_value,
      duration: project.duration,
      challenges: project.challenges,
      solutions: project.solutions,
      results: project.results,
      isActive: project.isActive,
      showInFeatured: project.showInFeatured,
      displayOrder: project.displayOrder
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      name: '',
      description: '',
      location: '',
      category: '',
      client: '',
      completion_date: '',
      project_type: '',
      image: '',
      features: [],
      products_used: [],
      project_value: '',
      duration: '',
      challenges: '',
      solutions: '',
      results: '',
      isActive: true,
      showInFeatured: false,
      displayOrder: projects.length + 1
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please enter a project title.');
      return;
    }

    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        toast.success('Project updated successfully!');
      } else {
        await addProject(formData);
        toast.success('Project added successfully!');
      }
      
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error saving project: ' + (error.message || error));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteProject(id);
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project: ' + (error.message || error));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Sanitize file name
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `projects/${Date.now()}_${sanitizedFileName}`;
      
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        toast.error('Error uploading image: ' + error.message);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  // Products Used Management
  const addProductUsed = () => {
    setFormData(prev => ({
      ...prev,
      products_used: [...(prev.products_used || []), '']
    }));
  };

  const updateProductUsed = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      products_used: (prev.products_used || []).map((p, i) => i === index ? value : p)
    }));
  };

  const removeProductUsed = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products_used: (prev.products_used || []).filter((_, i) => i !== index)
    }));
  };

  // Load available products and filter options
  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, categoriesData, featuresData] = await Promise.all([
          productService.getAllProducts(),
          filterService.getCategories(),
          filterService.getFeatures()
        ]);
        setAvailableProducts(products);
        setCategories(categoriesData);
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            <Button
              onClick={() => setShowForm(false)}
              variant="secondary"
              className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <h1 className="text-2xl font-bold">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select category</option>
                                            {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="mt-1"
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                  placeholder="Project description"
                />
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="completion_date">Completion Year</Label>
                  <Input
                    id="completion_date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                    className="mt-1"
                    placeholder="2023"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1"
                    placeholder="24 months"
                  />
                </div>
                <div>
                  <Label htmlFor="project_value">Project Value</Label>
                  <Input
                    id="project_value"
                    value={formData.project_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_value: e.target.value }))}
                    className="mt-1"
                    placeholder="$1.5M USD"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project_type">Project Type</Label>
                <Input
                  id="project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g., Commercial Construction"
                />
              </div>

              {/* Features */}
              <div>
                <Label>Features & Technologies</Label>
                <div className="mt-2 space-y-2">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select feature</option>
                        {features.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Products Used */}
              <div>
                <Label>Products Used</Label>
                <div className="mt-2 space-y-2">
                  {(formData.products_used || []).map((product, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={product}
                        onChange={(e) => updateProductUsed(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select product</option>
                        {availableProducts.map(availableProduct => (
                          <option key={availableProduct.id} value={availableProduct.name}>
                            {availableProduct.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProductUsed(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addProductUsed}>
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Project Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Project" 
                      className="max-w-xs h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Detailed Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="challenges">Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                    className="mt-1"
                    rows={3}
                    placeholder="What challenges were faced in this project?"
                  />
                </div>

                <div>
                  <Label htmlFor="solutions">Solutions</Label>
                  <Textarea
                    id="solutions"
                    value={formData.solutions}
                    onChange={(e) => setFormData(prev => ({ ...prev, solutions: e.target.value }))}
                    className="mt-1"
                    rows={3}
                    placeholder="How were the challenges solved?"
                  />
                </div>

                <div>
                  <Label htmlFor="results">Results</Label>
                  <Textarea
                    id="results"
                    value={formData.results}
                    onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
                    className="mt-1"
                    rows={3}
                    placeholder="What were the project outcomes and achievements?"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active (Show on website)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInFeatured"
                    checked={formData.showInFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInFeatured: checked }))}
                  />
                  <Label htmlFor="showInFeatured">Featured Project</Label>
                </div>

                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 99 }))}
                    className="mt-1"
                    min="1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Project
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={saving}
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
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects Management</h1>
              <p className="text-primary-foreground/80">Manage construction projects and case studies</p>
            </div>
            <Button onClick={handleAddNew} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading projects...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <Badge variant={project.isActive ? "default" : "secondary"}>
                            {project.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{project.category}</Badge>
                          {project.showInFeatured && (
                            <Badge className="bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline">Order: {project.displayOrder}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mb-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {project.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {project.completion_date}
                          </div>
                          {project.client && (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {project.client}
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{project.description}</p>
                        {project.features && project.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {project.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        {project.project_value && (
                          <p className="text-xs text-primary font-medium">Value: {project.project_value}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id, project.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {projects.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects found. Add your first project to get started.</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Project
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects; 