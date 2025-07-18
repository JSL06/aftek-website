import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2, Edit, Trash2, Plus, MapPin, Calendar, Save, Upload, Star, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import { productService } from '@/services/productService';
import { filterService } from '@/services/filterService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LanguageSelector, { Language, LANGUAGES } from '@/components/LanguageSelector';
import MultilingualFormField from '@/components/MultilingualFormField';
import TranslationStatus from '@/components/TranslationStatus';
import { useTranslation } from '@/hooks/useTranslation';

const AdminProjects = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant');
  const { projects, loading, addProject, updateProject, deleteProject, refetch } = useAdminProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    category: '',
    client: '',
    completion_date: '',
    project_type: '',
    image: '',
    features: [] as string[],
    products_used: [] as string[],
    project_value: '',
    duration: '',
    description: '',
    challenges: '',
    solutions: '',
    results: '',
    isActive: true,
    showInFeatured: false,
    displayOrder: 99,
    // Multilingual content
    translations: {} as Record<string, any>
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    
    // Prepare translations data
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        title: lang.code === 'en' ? project.title : (project.titles?.[lang.code] || ''),
        description: lang.code === 'en' ? project.description : (project.descriptions?.[lang.code] || ''),
        challenges: lang.code === 'en' ? project.challenges : (project.challenges_multilingual?.[lang.code] || ''),
        solutions: lang.code === 'en' ? project.solutions : (project.solutions_multilingual?.[lang.code] || ''),
        results: lang.code === 'en' ? project.results : (project.results_multilingual?.[lang.code] || ''),
        location: project.location || '',
        category: project.category || '',
        client: project.client || ''
      };
    });

    setFormData({
      title: project.title,
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
      description: project.description || '',
      challenges: project.challenges,
      solutions: project.solutions,
      results: project.results,
      isActive: project.isActive,
      showInFeatured: project.showInFeatured,
      displayOrder: project.displayOrder,
      translations
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({
      title: '',
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
      description: '',
      challenges: '',
      solutions: '',
      results: '',
      isActive: true,
      showInFeatured: false,
      displayOrder: projects.length + 1,
      translations: {}
    });
    setShowForm(true);
  };

  const handleTranslationChange = (language: Language, fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: {
          ...prev.translations[language],
          [fieldName]: value
        }
      }
    }));
  };



  const handleSave = async () => {
    // Validate required fields for current language
    const currentLangData = formData.translations[selectedLanguage] || {};
    if (!currentLangData.title && !formData.title) {
      toast.error('Please enter a project title.');
      return;
    }

    setSaving(true);
    try {
      // Prepare project data with multilingual content
      const projectData: Partial<Project> = {
        title: formData.title || currentLangData.title,
        location: formData.location,
        category: formData.category,
        client: formData.client,
        completion_date: formData.completion_date,
        project_type: formData.project_type,
        image: formData.image,
        features: formData.features,
        products_used: formData.products_used,
        project_value: formData.project_value,
        duration: formData.duration,
        challenges: formData.challenges || currentLangData.challenges,
        solutions: formData.solutions || currentLangData.solutions,
        results: formData.results || currentLangData.results,
        isActive: formData.isActive,
        showInFeatured: formData.showInFeatured,
        displayOrder: formData.displayOrder,
        titles: {},
        descriptions: {},
        challenges_multilingual: {},
        solutions_multilingual: {},
        results_multilingual: {}
      };

      // Add multilingual content
      LANGUAGES.forEach(lang => {
        const langData = formData.translations[lang.code];
        if (langData?.title) {
          projectData.titles![lang.code] = langData.title;
        }
        if (langData?.description) {
          projectData.descriptions![lang.code] = langData.description;
        }
        if (langData?.challenges) {
          projectData.challenges_multilingual![lang.code] = langData.challenges;
        }
        if (langData?.solutions) {
          projectData.solutions_multilingual![lang.code] = langData.solutions;
        }
        if (langData?.results) {
          projectData.results_multilingual![lang.code] = langData.results;
        }
      });

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await addProject(projectData);
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
              <CardTitle>项目详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="bg-background border-b border-border pb-4 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              {/* Translation Status */}
              <div className="bg-muted p-4 rounded-lg">
                <TranslationStatus
                  translations={formData.translations}
                  requiredFields={['title', 'description']}
                />
              </div>



              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">
                  {t('admin.dashboard.currentSelection')}: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </h3>
                
                <div className="space-y-6">
                  <MultilingualFormField
                    label={t('admin.projects.projectTitle')}
                    fieldName="title"
                    type="text"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <MultilingualFormField
                    label={t('admin.projects.description')}
                    fieldName="description"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={true}
                  />

                  <MultilingualFormField
                    label="项目挑战"
                    fieldName="challenges"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />

                  <MultilingualFormField
                    label="解决方案"
                    fieldName="solutions"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />

                  <MultilingualFormField
                    label="项目成果"
                    fieldName="results"
                    type="textarea"
                    translations={formData.translations}
                    onTranslationChange={handleTranslationChange}
                    currentLanguage={selectedLanguage}
                    required={false}
                  />
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">{t('admin.projects.category')} *</Label>
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
                  <Label htmlFor="location">{t('admin.projects.location')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="client">{t('admin.projects.client')}</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="mt-1"
                    placeholder="Client name"
                  />
                </div>
              </div>



              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="completion_date">{t('admin.projects.completionDate')}</Label>
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



              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">{t('admin.projects.active')} (Show on website)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInFeatured"
                    checked={formData.showInFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInFeatured: checked }))}
                  />
                  <Label htmlFor="showInFeatured">{t('admin.projects.featured')}</Label>
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
                      {t('admin.projects.save')}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="flex-1"
                >
                  {t('admin.products.cancel')}
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
          <h1 className="text-2xl font-bold">{t('admin.projects.title')}</h1>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">选择编辑语言:</span>
            </div>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.code as Language)}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">项目管理</h1>
            <p className="text-muted-foreground">管理建筑项目和案例研究</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            添加新项目
          </Button>
        </div>
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