import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2, Edit, Trash2, Plus, MapPin, Calendar, Save, Upload, Star, Globe } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import FeaturesChecklist from '@/components/FeaturesChecklist';

const AdminProjects = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const { projects, loading, addProject, updateProject, deleteProject, refetch } = useAdminProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    category: '',
    client: '',
    completion_date: '',
    project_type: '',
    image: '',
    gallery_images: [] as string[],
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          filterService.getCategories()
        ]);
        setAvailableProducts(products);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Auto-open edit form when projectId is in URL
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        handleEdit(project);
      }
    }
  }, [projectId, projects]);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    
    // Update URL to include project ID for refresh persistence
    navigate(`/admin/projects/edit/${project.id}`);
    
    // Prepare translations data - load from existing multilingual fields
    const translations: Record<string, any> = {};
    LANGUAGES.forEach(lang => {
      translations[lang.code] = {
        // Use existing multilingual data if available, otherwise fallback to main fields
        title: project.titles?.[lang.code] || (lang.code === 'en' ? project.title : ''),
        description: project.descriptions?.[lang.code] || (lang.code === 'en' ? project.description : ''),
        challenges: project.challenges_multilingual?.[lang.code] || (lang.code === 'en' ? project.challenges : ''),
        solutions: project.solutions_multilingual?.[lang.code] || (lang.code === 'en' ? project.solutions : ''),
        results: project.results_multilingual?.[lang.code] || (lang.code === 'en' ? project.results : ''),
        location: project.locations_multilingual?.[lang.code] || project.location || '',
        category: project.categories_multilingual?.[lang.code] || project.category || '',
        client: project.clients_multilingual?.[lang.code] || project.client || '',
        completion_date: project.completion_dates_multilingual?.[lang.code] || project.completion_date || '',
        duration: project.durations_multilingual?.[lang.code] || project.duration || '',
        project_value: project.project_values_multilingual?.[lang.code] || project.project_value || '',
        project_type: project.project_types_multilingual?.[lang.code] || project.project_type || ''
      };
    });

    // Set form data with the loaded translations
    setFormData({
      title: project.title || '',
      location: project.location || '',
      category: project.category || '',
      client: project.client || '',
      completion_date: project.completion_date || '',
      project_type: project.project_type || '',
      image: project.image || '',
      gallery_images: project.gallery_images || [], // Load gallery images
      features: project.features || [], // Use the feature keys directly
      products_used: project.products_used || [],
      project_value: project.project_value || '',
      duration: project.duration || '',
      description: project.description || '',
      challenges: project.challenges || '',
      solutions: project.solutions || '',
      results: project.results || '',
      isActive: project.isActive,
      showInFeatured: project.showInFeatured,
      displayOrder: project.displayOrder,
      translations
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({
      title: '',
      location: '',
      category: '',
      client: '',
      completion_date: '',
      project_type: '',
      image: '',
      gallery_images: [],
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
      displayOrder: 99,
      translations: {}
    });
    // Reset URL back to projects list
    navigate('/admin/projects');
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setShowForm(true);
    setFormData({
      title: '',
      location: '',
      category: '',
      client: '',
      completion_date: '',
      project_type: '',
      image: '',
      gallery_images: [],
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
      displayOrder: 99,
      translations: {}
    });
    // Update URL to show we're adding a new project
    navigate('/admin/projects');
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
    if (!editingProject) return;
    
    try {
      setSaving(true);
      
      // Features are now stored as feature keys (language-agnostic)
      // We'll store them directly without conversion
      
      // Debug: Log what we're about to save
      console.log('Projects.tsx: About to save project data:', {
        id: editingProject.id,
        translations: formData.translations,
        features: formData.features, // These are now feature keys
        basicFields: {
          title: formData.title,
          description: formData.description,
        location: formData.location,
        category: formData.category,
        client: formData.client,
        completion_date: formData.completion_date,
        project_type: formData.project_type,
        project_value: formData.project_value,
        duration: formData.duration,
          challenges: formData.challenges,
          solutions: formData.solutions,
          results: formData.results,
          features: formData.features, // Store the feature keys directly
        isActive: formData.isActive,
        showInFeatured: formData.showInFeatured,
          displayOrder: formData.displayOrder
        }
      });
      
      // Multilingual content - extract from formData.translations
      const titles: Record<string, string> = {};
      const descriptions: Record<string, string> = {};
      const challenges_multilingual: Record<string, string> = {};
      const solutions_multilingual: Record<string, string> = {};
      const results_multilingual: Record<string, string> = {};
      const locations_multilingual: Record<string, string> = {};
      const clients_multilingual: Record<string, string> = {};
      const categories_multilingual: Record<string, string> = {};
      const completion_dates_multilingual: Record<string, string> = {};
      const project_types_multilingual: Record<string, string> = {};
      const project_values_multilingual: Record<string, string> = {};
      const durations_multilingual: Record<string, string> = {};
      
      // Map form translations to the correct structure
      LANGUAGES.forEach(lang => {
        const langData = formData.translations[lang.code];
        if (langData) {
          // Only add to multilingual objects if the value exists and is not empty
          if (langData.title && langData.title.trim()) {
            titles[lang.code] = langData.title.trim();
          }
          if (langData.description && langData.description.trim()) {
            descriptions[lang.code] = langData.description.trim();
          }
          if (langData.challenges && langData.challenges.trim()) {
            challenges_multilingual[lang.code] = langData.challenges.trim();
          }
          if (langData.solutions && langData.solutions.trim()) {
            solutions_multilingual[lang.code] = langData.solutions.trim();
          }
          if (langData.results && langData.results.trim()) {
            results_multilingual[lang.code] = langData.results.trim();
          }
          if (langData.location && langData.location.trim()) {
            locations_multilingual[lang.code] = langData.location.trim();
          }
          if (langData.client && langData.client.trim()) {
            clients_multilingual[lang.code] = langData.client.trim();
          }
          if (langData.category && langData.category.trim()) {
            categories_multilingual[lang.code] = langData.category.trim();
          }
          if (langData.completion_date && langData.completion_date.trim()) {
            completion_dates_multilingual[lang.code] = langData.completion_date.trim();
          }
          if (langData.project_type && langData.project_type.trim()) {
            project_types_multilingual[lang.code] = langData.project_type.trim();
          }
          if (langData.project_value && langData.project_value.trim()) {
            project_values_multilingual[lang.code] = langData.project_value.trim();
          }
          if (langData.duration && langData.duration.trim()) {
            durations_multilingual[lang.code] = langData.duration.trim();
          }
        }
      });
      
      // Validate that we have at least one title
      if (Object.keys(titles).length === 0 && !formData.title) {
        toast.error('Please provide a title for at least one language.');
        setSaving(false);
        return;
      }
      
      // Set the main title to the first available title or fallback to English
      const mainTitle = Object.values(titles)[0] || formData.title;
      
      const projectData = {
        // Basic fields - use the main title and description
        title: mainTitle,
        description: Object.values(descriptions)[0] || formData.description,
        location: Object.values(locations_multilingual)[0] || formData.location,
        category: Object.values(categories_multilingual)[0] || formData.category,
        client: Object.values(clients_multilingual)[0] || formData.client,
        completion_date: Object.values(completion_dates_multilingual)[0] || formData.completion_date,
        project_type: Object.values(project_types_multilingual)[0] || formData.project_type,
        project_value: Object.values(project_values_multilingual)[0] || formData.project_value,
        duration: Object.values(durations_multilingual)[0] || formData.duration,
        challenges: Object.values(challenges_multilingual)[0] || formData.challenges,
        solutions: Object.values(solutions_multilingual)[0] || formData.solutions,
        results: Object.values(results_multilingual)[0] || formData.results,
        features: formData.features, // Store the feature keys directly
        gallery_images: formData.gallery_images, // Store gallery images
        isActive: formData.isActive,
        showInFeatured: formData.showInFeatured,
        displayOrder: formData.displayOrder,
        
        // Multilingual content - all language variations
        titles,
        descriptions,
        challenges_multilingual,
        solutions_multilingual,
        results_multilingual,
        locations_multilingual,
        clients_multilingual,
        categories_multilingual,
        completion_dates_multilingual,
        project_types_multilingual,
        project_values_multilingual,
        durations_multilingual
      };
      
      console.log('Projects.tsx: Final project data to save:', projectData);
      
      const updatedProject = await updateProject(editingProject.id, projectData);
      
      toast.success('Project updated successfully!');
      
      // Update URL to reflect the edited project
      navigate(`/admin/projects/edit/${updatedProject.id}`);
      
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      
      // Check if this is a constraint violation (most common issue)
      if (error.message && error.message.includes('Title is required but was not provided')) {
        toast.error('Cannot save: Title is required for all languages. Please ensure the title field has a value.');
      } else if (error.message && error.message.includes('Database constraint violation')) {
        toast.error('Database constraint violation: ' + error.message.split('Database constraint violation: ')[1]);
      } else if (error.message && error.message.includes('Database schema not ready')) {
        toast.error('Database needs to be updated first. Please run UPDATE_PROJECTS_MULTILINGUAL.sql in Supabase.');
      } else if (error.message && error.message.includes('UPDATE_PROJECTS_MULTILINGUAL.sql')) {
        toast.error('Database schema not ready. Please run UPDATE_PROJECTS_MULTILINGUAL.sql in Supabase first.');
      } else if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        toast.error('Database schema missing required columns. Run UPDATE_PROJECTS_MULTILINGUAL.sql in Supabase.');
      } else {
      toast.error('Error saving project: ' + (error.message || error));
      }
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

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const filePromises = Array.from(files).map(async (file) => {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filePath = `projects/${Date.now()}_${sanitizedFileName}`;
        const { data, error } = await supabase.storage
          .from('project-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (error) {
          toast.error(`Error uploading image ${file.name}: ${error.message}`);
          return null;
        }
        const { data: publicUrlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(filePromises);
      const newGalleryImages = [...(formData.gallery_images || []), ...uploadedUrls.filter(url => url !== null)];
      setFormData(prev => ({ ...prev, gallery_images: newGalleryImages }));
      toast.success('Gallery images uploaded successfully!');
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast.error('Failed to upload gallery images');
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: (prev.gallery_images || []).filter((_, index) => index !== indexToRemove)
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

  // All hooks must be called before any conditional returns
  // Render logic starts here
  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-hero text-primary-foreground p-6">
          <div className="container mx-auto">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm text-primary-foreground/80 mb-2">
                             <Link 
                 to="/admin/projects" 
                 className="hover:text-primary-foreground transition-colors"
               >
                 {t('nav.projects')}
               </Link>
              {editingProject && (
                <>
                  <span>/</span>
                  <span className="text-primary-foreground">Edit: {editingProject.title}</span>
                </>
              )}
            </div>
            
                         <Button
               onClick={handleCancel}
               variant="secondary"
               className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
             >
               <ArrowLeft className="mr-2 h-4 w-4" />
               {t('admin.projects.backToProjects')}
             </Button>
             <h1 className="text-2xl font-bold">
               {editingProject ? t('admin.projects.editProject') : t('admin.projects.addProject')}
             </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
                             <CardTitle>
                 {editingProject ? `${t('admin.projects.editProject')}: ${editingProject.title}` : t('admin.projects.addProject')}
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="bg-background border-b border-border pb-4 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              {/* Translation Status - Broad Language Indicators */}
              <div className="bg-muted p-4 rounded-lg">
                <TranslationStatus
                  translations={formData.translations}
                  requiredFields={['title', 'description']}
                  variant="minimal"
                  showLabels={false}
                />
              </div>

              {/* Language-specific editing */}
              <div className="bg-muted p-4 rounded-lg">
                                 <h3 className="font-semibold mb-3">
                   {t('admin.projects.currentSelection')}: {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
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
                     label={t('admin.projects.challenges')}
                     fieldName="challenges"
                     type="textarea"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     required={false}
                   />

                   <MultilingualFormField
                     label={t('admin.projects.solutions')}
                     fieldName="solutions"
                     type="textarea"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     required={false}
                   />

                   <MultilingualFormField
                     label={t('admin.projects.results')}
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
                   <Label htmlFor="category">{t('admin.projects.category')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}) *</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="category"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="Select category"
                     className="mt-1"
                   />
                   <div className="mt-2">
                   <select
                     value={formData.category}
                     onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                       className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                   >
                     <option value="">{t('admin.projects.selectCategory')}</option>
                     {categories.map(category => (
                       <option key={category} value={category}>{category}</option>
                     ))}
                   </select>
                   </div>
                 </div>
               </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="location">{t('admin.projects.location')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="location"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="City, Country"
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label htmlFor="client">{t('admin.projects.client')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="client"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="Client name"
                     className="mt-1"
                   />
                 </div>
               </div>

                             {/* Project Details */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <Label htmlFor="completion_date">{t('admin.projects.completionDate')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="completion_date"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="2023"
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label htmlFor="duration">{t('admin.projects.duration')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="duration"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="24 months"
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label htmlFor="project_value">{t('admin.projects.projectValue')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                   <MultilingualFormField
                     label=""
                     fieldName="project_value"
                     type="text"
                     translations={formData.translations}
                     onTranslationChange={handleTranslationChange}
                     currentLanguage={selectedLanguage}
                     placeholder="$1.5M USD"
                     className="mt-1"
                   />
                 </div>
               </div>

                             <div>
                                    <Label htmlFor="project_type">{t('admin.projects.projectType')} ({LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})</Label>
                 <MultilingualFormField
                   label=""
                   fieldName="project_type"
                   type="text"
                   translations={formData.translations}
                   onTranslationChange={handleTranslationChange}
                   currentLanguage={selectedLanguage}
                   placeholder="e.g., Commercial Construction"
                   className="mt-1"
                 />
               </div>

              {/* Features */}
                             <div>
                 <Label>{t('admin.projects.featuresTechnologies')}</Label>
                <FeaturesChecklist
                  features={[]}
                  selectedFeatures={formData.features || []}
                  onFeaturesChange={(featureKeys) => {
                    // featureKeys are now the feature keys (language-agnostic)
                    setFormData(prev => ({ ...prev, features: featureKeys }));
                  }}
                  language={selectedLanguage}
                  placeholder="Search features..."
                  className="mt-2"
                />
              </div>

              {/* Products Used */}
                             <div>
                 <Label>{t('admin.projects.productsUsed')}</Label>
                <div className="mt-2 space-y-2">
                  {(formData.products_used || []).map((product, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={product}
                        onChange={(e) => updateProductUsed(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                                                 <option value="">{t('admin.projects.selectProduct')}</option>
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
                                                 {t('admin.projects.remove')}
                      </Button>
                    </div>
                  ))}
                                     <Button type="button" variant="outline" onClick={addProductUsed}>
                     {t('admin.projects.addProduct')}
                   </Button>
                </div>
              </div>

              {/* Image Upload */}
                             <div>
                 <Label htmlFor="image">{t('admin.projects.projectImage')}</Label>
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

              {/* Gallery Images Upload */}
                             <div>
                 <Label htmlFor="gallery_images">{t('admin.projects.galleryImages')}</Label>
                <Input
                  id="gallery_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesUpload}
                  className="mt-1"
                />
                                 <p className="text-xs text-muted-foreground mt-1">
                   {t('admin.projects.uploadMultipleImages')}
                 </p>
                
                {/* Display existing gallery images */}
                {formData.gallery_images && formData.gallery_images.length > 0 && (
                  <div className="mt-4">
                                         <Label className="text-sm font-medium">{t('admin.projects.currentGalleryImages')}:</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.gallery_images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
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
                                     <Label htmlFor="isActive">{t('admin.projects.active')} ({t('admin.projects.showOnWebsite')})</Label>
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
                                     <Label htmlFor="displayOrder">{t('admin.projects.displayOrder')}</Label>
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
                  onClick={handleCancel}
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

  // Main projects list view
  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Show loading state if we have a projectId but projects haven't loaded yet */}
      {projectId && loading ? (
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                             <p className="text-lg text-muted-foreground">{t('admin.projects.loadingProject')}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Show error if projectId is invalid (project not found) */}
          {projectId && !loading && projects.length > 0 && (() => {
            const project = projects.find(p => p.id === projectId);
            if (!project) {
              return (
                <div className="container mx-auto p-8">
                  <div className="max-w-md mx-auto text-center">
                                         <div className="bg-red-50 border border-red-200 rounded-md p-6">
                       <h2 className="text-xl font-semibold text-red-800 mb-2">{t('admin.projects.projectNotFound')}</h2>
                       <p className="text-red-600 mb-4">
                         {t('admin.projects.projectNotFoundDescription')}
                       </p>
                       <Button onClick={() => navigate('/admin/projects')}>
                         {t('admin.projects.backToProjects')}
                       </Button>
                     </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Main content */}
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/80 mb-2">
                <Link 
                  to="/admin/dashboard" 
                  className="hover:text-primary-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-primary-foreground">Projects</span>
              </div>
              
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
              <h1 className="text-2xl font-bold">
                {projectId ? `Edit Project` : t('admin.projects.title')}
              </h1>
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
                         <h1 className="text-3xl font-bold">{t('admin.projects.title')}</h1>
             <p className="text-muted-foreground">{t('admin.projects.pageDescription')}</p>
          </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      // Check each column individually to provide detailed feedback
                      const columnsToCheck = ['category', 'completion_date', 'project_type', 'project_value', 'duration'];
                      const results = await Promise.all(
                        columnsToCheck.map(async (column) => {
                          try {
                            const { error } = await supabase
                              .from('project_translations')
                              .select(column)
                              .limit(1);
                            return { column, exists: !error, error: error?.message };
                          } catch (err) {
                            return { column, exists: false, error: err.message };
                          }
                        })
                      );
                      
                      const missingColumns = results.filter(r => !r.exists);
                      
                      if (missingColumns.length === 0) {
                        toast.success('✅ Database schema is ready! All new multilingual fields available.');
                      } else {
                        const missingList = missingColumns.map(r => r.column).join(', ');
                        toast.error(`❌ Database schema not ready. Missing columns: ${missingList}`);
                        toast.error('Run UPDATE_PROJECTS_MULTILINGUAL.sql in Supabase to fix this.');
                      }
                    } catch (err) {
                      toast.error('Schema check failed: ' + (err.message || 'Unknown error'));
                    }
                  }}
                >
                  Check Schema
                </Button>
                     <Button onClick={handleAddNew}>
             <Plus className="mr-2 h-4 w-4" />
                   {t('admin.projects.addProject')}
           </Button>
              </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                         <p className="text-muted-foreground mt-4">{t('admin.projects.loading')}</p>
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
                                <span>{project.completion_date}</span>
                          </div>
                          {project.client && (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                                  <span>{project.client}</span>
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
                                 <p className="text-muted-foreground">{t('admin.projects.noProjectsFound')}</p>
                 <Button onClick={handleAddNew} className="mt-4">
                   <Plus className="mr-2 h-4 w-4" />
                   {t('admin.projects.addFirstProject')}
                 </Button>
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default AdminProjects; 