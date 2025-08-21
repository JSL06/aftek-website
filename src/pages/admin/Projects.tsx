import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload, Image as ImageIcon, Building2, Calendar, MapPin, User, DollarSign, Clock, Star, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectService, MultilingualProject } from '@/services/projectService';
import { productService } from '@/services/productService';
import ModernRichTextEditor from '@/components/ModernRichTextEditor';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import FeaturesChecklist from '@/components/FeaturesChecklist';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Language configuration
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function AdminProjects() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  console.log('🔍 AdminProjects component rendered with projectId:', projectId);
  
  // Use dynamic categories from the database instead of hardcoded list
  const { categories: projectCategories } = useCategories('en');
  
  console.log('🔍 Categories loaded:', projectCategories);
  
  const [project, setProject] = useState<MultilingualProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProject, setOriginalProject] = useState<MultilingualProject | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // List view state when no projectId is provided
  const [projects, setProjects] = useState<MultilingualProject[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  // Load project when projectId changes
  useEffect(() => {
    if (projectId) {
      console.log('🔍 useEffect triggered with projectId:', projectId);
      
      const loadProjectWithTimeout = async () => {
        try {
          console.log('🔍 Loading project with ID:', projectId);
          setLoading(true);
          setLoadError(null);
          
          // Test database connection first
          console.log('🔍 Testing database connection...');
          const { data: testData, error: testError } = await supabase
            .from('projects')
            .select('id')
            .limit(1);
          
          if (testError) {
            console.error('🔍 Database connection error:', testError);
            setLoadError('Database connection failed: ' + testError.message);
            setLoading(false);
            return;
          }
          
          console.log('🔍 Database connection successful, test data:', testData);
          
          console.log('🔍 About to call projectService.getProject...');
          const projectData = await projectService.getProject(projectId);
          console.log('🔍 Project data received:', projectData);
          
          if (projectData) {
            console.log('🔍 Setting project state with data:', projectData.title);
            setProject(projectData);
            setOriginalProject(projectData);
            console.log('🔍 Project state updated successfully');
          } else {
            console.error('🔍 No project data returned');
            setLoadError('Project not found - the project ID may not exist in the database');
            toast.error('Project not found');
          }
        } catch (error) {
          console.error('🔍 Error loading project:', error);
          const errorMessage = error.message || 'Unknown error';
          setLoadError('Failed to load project: ' + errorMessage);
          toast.error('Failed to load project: ' + errorMessage);
        } finally {
          console.log('🔍 Setting loading to false');
          setLoading(false);
        }
      };
      
      loadProjectWithTimeout();
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (loading) {
          console.log('🔍 Loading timeout reached');
          setLoadError('Loading timeout - please check your connection and try again');
          setLoading(false);
        }
      }, 5000); // 5 second timeout for faster feedback
      
      return () => clearTimeout(timeout);
    } else {
      console.log('🔍 No projectId provided - loading projects list');
      // Load list of projects for the index page
      const loadList = async () => {
        try {
          setListLoading(true);
          setListError(null);
          const list = await projectService.getAdminProjects('en');
          setProjects(list);
        } catch (err: any) {
          console.error('🔍 Error loading projects list:', err);
          setListError(err?.message || 'Failed to load projects');
        } finally {
          setListLoading(false);
          setLoading(false);
        }
      };
      loadList();
    }
  }, [projectId]);

  // Load all products for selection
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);



  const updateBasicField = (field: string, value: any) => {
    if (project) {
      setProject({
        ...project,
        [field]: value
      });
    }
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
    if (project) {
      const fieldMap: Record<string, keyof MultilingualProject> = {
        'title': 'titles',
        'description': 'descriptions',
        'challenges': 'challenges_multilingual',
        'solutions': 'solutions_multilingual',
        'results': 'results_multilingual',
        'location': 'locations_multilingual',
        'client': 'clients_multilingual',
        'category': 'categories_multilingual',
        'completion_date': 'completion_dates_multilingual',
        'project_type': 'project_types_multilingual',
        'project_value': 'project_values_multilingual',
        'duration': 'durations_multilingual'
      };
      
      const multilingualField = fieldMap[field];
      if (multilingualField) {
        const currentValue = project[multilingualField] as Record<string, string> || {};
        setProject({
          ...project,
          [multilingualField]: {
            ...currentValue,
            [languageCode]: value
          }
        });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && project) {
    try {
        const fileName = `project-${project.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('project-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
        .from('project-images')
          .getPublicUrl(fileName);
      
        updateBasicField('image', publicUrl);
        toast.success('Image uploaded successfully');
    } catch (error) {
        console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      }
    }
  };

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && project) {
      try {
        const uploadedUrls: string[] = [];
        
        for (const file of files) {
          const fileName = `project-gallery-${project.id}-${Date.now()}-${Math.random()}`;
        const { data, error } = await supabase.storage
          .from('project-images')
            .upload(fileName, file);
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
          .from('project-images')
            .getPublicUrl(fileName);
          
          uploadedUrls.push(publicUrl);
        }
        
        const currentGallery = project.gallery_images || [];
        updateBasicField('gallery_images', [...currentGallery, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} images uploaded successfully`);
    } catch (error) {
        console.error('Error uploading gallery images:', error);
      toast.error('Failed to upload gallery images');
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    if (project && project.gallery_images) {
      const newGallery = [...project.gallery_images];
      newGallery.splice(index, 1);
      updateBasicField('gallery_images', newGallery);
    }
  };

  const reorderGalleryImage = (fromIndex: number, toIndex: number) => {
    if (project && project.gallery_images) {
      const newGallery = [...project.gallery_images];
      const [movedImage] = newGallery.splice(fromIndex, 1);
      newGallery.splice(toIndex, 0, movedImage);
      updateBasicField('gallery_images', newGallery);
    }
  };

  const addProductUsed = () => {
    if (project) {
      const currentProducts = project.products_used || [];
      updateBasicField('products_used', [...currentProducts, '']);
    }
  };

  const removeProductUsed = (index: number) => {
    if (project && project.products_used) {
      const newProducts = [...project.products_used];
      newProducts.splice(index, 1);
      updateBasicField('products_used', newProducts);
    }
  };

  const updateProductUsed = (index: number, value: string) => {
    if (project && project.products_used) {
      const newProducts = [...project.products_used];
      newProducts[index] = value;
      updateBasicField('products_used', newProducts);
    }
  };

  const handleSave = async () => {
    if (!project) return;
    
    try {
      setSaving(true);
      
      // Prepare data for saving - the project object already has all the multilingual fields
      await projectService.updateProject(project.id, project);
      toast.success('Project saved successfully');
      
      // Reload project to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await projectService.deleteProject(project.id);
        toast.success('Project deleted successfully');
        navigate('/admin/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading project...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment...</p>
          {loadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-800 text-sm font-medium">Error: {loadError}</p>
              <div className="mt-3 flex gap-2 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm"
                  variant="outline"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => navigate('/admin/projects')} 
                  size="sm"
                  variant="outline"
                >
                  Back to Projects
                </Button>
              </div>
            </div>
              )}
            </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Project</h2>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <div className="flex gap-2 justify-center">
                          <Button onClick={() => window.location.reload()}>
                Retry
             </Button>
            <Button variant="outline" onClick={() => navigate('/admin/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Index page: show list when no projectId
  if (!projectId) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
              </div>
        {listLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : listError ? (
          <div className="p-4 border rounded text-red-700 bg-red-50">{listError}</div>
        ) : projects.length === 0 ? (
          <div className="p-6 border rounded text-muted-foreground">No projects found.</div>
        ) : (
          <div className="grid gap-4">
            {projects.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate">{p.titles?.['en'] || p.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {p.category} {p.completion_date ? `• ${p.completion_date}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(`/admin/projects/edit/${p.id}`)}>Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/admin/projects')}>
            Back to Projects
          </Button>
              </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {projectId ? t('admin.projects.editProject') : t('admin.projects.addProject')}
            </h1>
            {projectId && (
              <p className="text-muted-foreground">ID: {project.id}</p>
            )}
          </div>
              </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                console.log('🔍 Testing database connection...');
                // Check database schema
                const { data, error } = await supabase
                  .from('projects')
                  .select('id, title')
                  .limit(1);
                
                console.log('🔍 Database test result:', { data, error });
                
                if (error) {
                  toast.error('Database error: ' + error.message);
                } else {
                  toast.success(`Database connection OK. Found ${data?.length || 0} projects.`);
                  if (data && data.length > 0) {
                    console.log('🔍 Sample project:', data[0]);
                  }
                }
              } catch (err) {
                console.error('🔍 Database test error:', err);
                toast.error('Database check failed: ' + err.message);
              }
            }}
          >
            Check DB
              </Button>
          {projectId && (
            <>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    console.log('🔍 Testing direct project fetch for ID:', projectId);
                    const { data, error } = await supabase
                      .from('projects')
                      .select('*')
                      .eq('id', projectId)
                      .single();
                    
                    console.log('🔍 Direct project fetch result:', { data, error });
                    
                    if (error) {
                      toast.error('Direct fetch error: ' + error.message);
                    } else {
                      toast.success('Direct fetch successful: ' + data.title);
                    }
                  } catch (err) {
                    console.error('🔍 Direct fetch error:', err);
                    toast.error('Direct fetch failed: ' + err.message);
                  }
                }}
              >
                Test Direct
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const { data, error } = await supabase.from('projects').select('id, title').limit(1);
                if (error) {
                  toast.error('DB Error: ' + error.message);
                } else {
                  toast.success(`DB OK. Found ${data?.length || 0} projects.`);
                }
              } catch (err) {
                toast.error('DB check failed');
              }
            }}
            className="mr-2"
          >
            Check DB
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('admin.projects.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('admin.projects.save')}
              </>
            )}
          </Button>
                </div>
              </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Basic Info - Left Sidebar */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Category */}
                 <div>
                <label className="block text-sm font-medium mb-2">Project Category</label>
                <Select onValueChange={(value) => updateBasicField('category', value)} defaultValue={project.category || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.names?.['en'] || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
               </div>

              {/* Project Type */}
                 <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <Input
                  value={project.project_type || ''}
                  onChange={(e) => updateBasicField('project_type', e.target.value)}
                  placeholder="e.g., Commercial Construction, Residential, Industrial"
                   />
                 </div>

              {/* Project Value */}
                 <div>
                <label className="block text-sm font-medium mb-2">Project Value</label>
                <Input
                  value={project.project_value || ''}
                  onChange={(e) => updateBasicField('project_value', e.target.value)}
                  placeholder="e.g., $1.5M USD"
                />
               </div>

              {/* Duration */}
                 <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Input
                  value={project.duration || ''}
                  onChange={(e) => updateBasicField('duration', e.target.value)}
                  placeholder="e.g., 12 months"
                />
               </div>

              {/* Completion Date */}
                             <div>
                <label className="block text-sm font-medium mb-2">Completion Date</label>
                <Input
                  type="date"
                  value={project.completion_date || ''}
                  onChange={(e) => updateBasicField('completion_date', e.target.value)}
                 />
               </div>

              {/* Project Features */}
                             <div>
                <label className="block text-sm font-medium mb-2">Project Features & Technologies</label>
                <FeaturesChecklist
                  features={[]}
                  selectedFeatures={project.features || []}
                  onFeaturesChange={(featureKeys) => {
                    updateBasicField('features', featureKeys);
                  }}
                  language="en"
                  placeholder="Search features..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Features selected here will be available in all languages.
                </p>
              </div>

              {/* Products Used */}
                             <div>
                <label className="block text-sm font-medium mb-2">Products Used</label>
                <div className="space-y-3">
                  {(project.products_used || []).map((productId, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={productId}
                        onValueChange={(value) => updateProductUsed(index, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No product</SelectItem>
                        {availableProducts.map(availableProduct => (
                            <SelectItem key={availableProduct.id} value={availableProduct.id}>
                              {availableProduct.names?.['en'] || availableProduct.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addProductUsed}
                    className="w-full"
                  >
                    Add Product
                   </Button>
                </div>
              </div>

              {/* Project Image */}
                             <div>
                <label className="block text-sm font-medium mb-2">Main Project Image</label>
                <div className="space-y-3">
                  {project.image && (
                    <div className="relative">
                      <img
                        src={project.image}
                        alt="Current project image"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => updateBasicField('image', '')}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Upload the main project image. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              {/* Gallery Images */}
                             <div>
                <label className="block text-sm font-medium mb-2">Gallery Images</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {project.gallery_images && project.gallery_images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Current gallery images (drag to reorder):</p>
                      <div className="grid grid-cols-2 gap-2">
                        {project.gallery_images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                              src={image} 
                              alt={`Gallery ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                            <Button
                            type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={() => removeGalleryImage(index)}
                          >
                            ×
                            </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  
                  <p className="text-xs text-muted-foreground">
                    Upload multiple images to create a project gallery. Drag images to reorder them.
                  </p>
                </div>
              </div>

              {/* Project Settings */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={project.isActive !== false}
                    onChange={(e) => updateBasicField('isActive', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active Project</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInFeatured"
                    checked={project.showInFeatured || false}
                    onChange={(e) => updateBasicField('showInFeatured', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showInFeatured" className="text-sm font-medium">Show in Featured</label>
                </div>

                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={project.displayOrder || 99}
                    onChange={(e) => updateBasicField('displayOrder', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first in lists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multilingual Content - Main Area */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multilingual Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full">
                {/* Language Tabs - Horizontal Layout */}
                <TabsList className="grid w-full grid-cols-7 h-12 mb-6">
                  {languages.map(lang => (
                    <TabsTrigger 
                      key={lang.code} 
                      value={lang.code} 
                      className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Language Content */}
                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.nativeName} - {lang.name}
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Project Title */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Type className="h-4 w-4 inline mr-2" />
                            Project Title ({lang.nativeName})
                          </label>
                                                     <Input
                             value={project.titles?.[lang.code] || ''}
                             onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                             placeholder="Enter project title..."
                             className="text-lg font-medium"
                           />
            </div>

                                                 {/* Project Description */}
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             <FileText className="h-4 w-4 inline mr-2" />
                             Project Description ({lang.nativeName})
                           </label>
                           <ModernRichTextEditor
                             value={project.descriptions?.[lang.code] || ''}
                             onChange={(value) => updateTranslation(lang.code, 'description', value)}
                             placeholder="Enter project description..."
                             height="200px"
                           />
              </div>
              
                         {/* Location */}
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             <MapPin className="h-4 w-4 inline mr-2" />
                             Location ({lang.nativeName})
                           </label>
                           <Input
                             value={project.locations_multilingual?.[lang.code] || ''}
                             onChange={(e) => updateTranslation(lang.code, 'location', e.target.value)}
                             placeholder="City, Country"
                           />
      </div>

                         {/* Client */}
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             <User className="h-4 w-4 inline mr-2" />
                             Client ({lang.nativeName})
                           </label>
                           <Input
                             value={project.clients_multilingual?.[lang.code] || ''}
                             onChange={(e) => updateTranslation(lang.code, 'client', e.target.value)}
                             placeholder="Client name"
                           />
      </div>

                         {/* Project Challenges */}
          <div>
                           <label className="block text-sm font-medium mb-2">
                             <FileText className="h-4 w-4 inline mr-2" />
                             Project Challenges ({lang.nativeName})
                           </label>
                           <ModernRichTextEditor
                             value={project.challenges_multilingual?.[lang.code] || ''}
                             onChange={(value) => updateTranslation(lang.code, 'challenges', value)}
                             placeholder="Describe the challenges faced in this project..."
                             height="150px"
                           />
          </div>

                         {/* Solutions */}
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             <FileText className="h-4 w-4 inline mr-2" />
                             Solutions ({lang.nativeName})
                           </label>
                           <ModernRichTextEditor
                             value={project.solutions_multilingual?.[lang.code] || ''}
                             onChange={(value) => updateTranslation(lang.code, 'solutions', value)}
                             placeholder="Describe the solutions implemented..."
                             height="150px"
                           />
              </div>

                         {/* Results */}
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             <FileText className="h-4 w-4 inline mr-2" />
                             Project Results ({lang.nativeName})
                           </label>
                           <ModernRichTextEditor
                             value={project.results_multilingual?.[lang.code] || ''}
                             onChange={(value) => updateTranslation(lang.code, 'results', value)}
                             placeholder="Describe the results and outcomes..."
                             height="150px"
                           />
                          </div>
                      </div>
                        </div>
                  </TabsContent>
                ))}
              </Tabs>
                </CardContent>
              </Card>
              </div>
          </div>
    </div>
  );
} 