import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Edit, Trash2, Plus, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  client: string;
  completionDate: string;
  isActive: boolean;
  order: number;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Taipei Metro Extension',
      location: 'Taipei, Taiwan',
      category: 'Infrastructure',
      description: 'Major metro extension project with waterproofing and sealing solutions.',
      client: 'Taipei Metro',
      completionDate: '2023',
      isActive: true,
      order: 1
    },
    {
      id: '2',
      title: 'Industrial Complex Renovation',
      location: 'Ho Chi Minh City, Vietnam',
      category: 'Industrial',
      description: 'Large-scale industrial facility renovation with epoxy flooring systems.',
      client: 'Vietnam Industrial Corp',
      completionDate: '2022',
      isActive: true,
      order: 2
    },
    {
      id: '3',
      title: 'Semiconductor Facility',
      location: 'Singapore',
      category: 'High-Tech',
      description: 'Clean room installation and specialized coating applications.',
      client: 'Singapore Semiconductor Ltd',
      completionDate: '2023',
      isActive: true,
      order: 3
    }
  ]);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Project>({
    id: '',
    title: '',
    location: '',
    category: '',
    description: '',
    client: '',
    completionDate: '',
    isActive: true,
    order: 1
  });

  const categories = ['Infrastructure', 'Industrial', 'Commercial', 'Residential', 'High-Tech', 'Healthcare'];

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingProject) {
      setProjects(prev => prev.map(proj => 
        proj.id === editingProject.id ? formData : proj
      ));
    } else {
      setProjects(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingProject(null);
    setFormData({
      id: '',
      title: '',
      location: '',
      category: '',
      description: '',
      client: '',
      completionDate: '',
      isActive: true,
      order: 1
    });
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(proj => proj.id !== id));
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({
      id: '',
      title: '',
      location: '',
      category: '',
      description: '',
      client: '',
      completionDate: '',
      isActive: true,
      order: projects.length + 1
    });
    setShowForm(true);
  };

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
              {editingProject?.id ? 'Edit Project' : 'Add New Project'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                    className="mt-1"
                    placeholder="2023"
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
                  Save Project
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
        <div className="grid gap-6">
          {projects
            .sort((a, b) => a.order - b.order)
            .map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant={project.isActive ? "default" : "secondary"}>
                          {project.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge variant="outline">Order: {project.order}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 mb-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {project.completionDate}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
                      <p className="text-xs text-muted-foreground">Client: {project.client}</p>
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
                      onClick={() => handleDelete(project.id)}
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

export default AdminProjects; 