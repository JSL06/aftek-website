import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload, X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import ModernRichTextEditor from '@/components/ModernRichTextEditor';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import FeaturesChecklist from '@/components/FeaturesChecklist';
import { projectService, MultilingualProject } from '@/services/projectService';
import { productService, UnifiedProduct } from '@/services/productService';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function ProjectEdit() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t, language: adminLanguage } = useAdminLanguage();

  const { categories } = useCategories('en');

  const [project, setProject] = useState<MultilingualProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Track current tab language
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!projectId) {
          setProject(null);
          return;
        }
        const [p, products] = await Promise.all([
          projectService.getProject(projectId),
          productService.getAllProducts()
        ]);
        if (!p) {
          setProject(null);
        } else {
          console.log('Loading project data:', p);
          console.log('Multilingual fields:', {
            titles: p.titles,
            descriptions: p.descriptions,
            locations_multilingual: p.locations_multilingual,
            clients_multilingual: p.clients_multilingual,
            completion_dates_multilingual: p.completion_dates_multilingual,
            project_types_multilingual: p.project_types_multilingual,
            project_values_multilingual: p.project_values_multilingual,
            durations_multilingual: p.durations_multilingual,
            gallery_captions: p.gallery_captions,
            gallery_hotspots: p.gallery_hotspots
          });
          
          // Convert Project to MultilingualProject structure
          setProject({
            id: p.id,
            title: p.title,
            description: p.description,
            location: p.location,
            category: p.category,
            client: p.client,
            completion_date: p.completion_date,
            project_type: p.project_type,
            project_value: p.project_value || '',
            duration: p.duration,

            features: p.features || [],
            products_used: Array.isArray(p.products_used) ? p.products_used : [],
            image: p.image,
            gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
            isActive: p.isActive,
            showInFeatured: p.showInFeatured,
            displayOrder: p.displayOrder,
            // Initialize multilingual fields from project data
            titles: p.titles || {},
            descriptions: p.descriptions || {},
            locations_multilingual: p.locations_multilingual || {},
            clients_multilingual: p.clients_multilingual || {},
            completion_dates_multilingual: p.completion_dates_multilingual || {},
            project_types_multilingual: p.project_types_multilingual || {},
            project_values_multilingual: p.project_values_multilingual || {},
            durations_multilingual: p.durations_multilingual || {},
            gallery_captions: p.gallery_captions || {},
            gallery_hotspots: p.gallery_hotspots || []
          });
        }
        setAllProducts(products);
      } catch (e) {
        console.error(e);
        toast.error(t('messages.loadError'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, t]);

  // Add a refresh function that can be called manually
  const refreshProject = async () => {
    if (projectId) {
      console.log('Refreshing project data...');
      const load = async () => {
        try {
          setLoading(true);
          const [p, products] = await Promise.all([
            projectService.getProject(projectId),
            productService.getAllProducts()
          ]);
          if (!p) {
            setProject(null);
          } else {
            console.log('Refreshed project data:', p);
            // Convert Project to MultilingualProject structure
            setProject({
              id: p.id,
              title: p.title,
              description: p.description,
              location: p.location,
              category: p.category,
              client: p.client,
              completion_date: p.completion_date,
              project_type: p.project_type,
              project_value: p.project_value || '',
              duration: p.duration,
              features: p.features || [],
              products_used: Array.isArray(p.products_used) ? p.products_used : [],
              image: p.image,
              gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
              isActive: p.isActive,
              showInFeatured: p.showInFeatured,
              displayOrder: p.displayOrder,
              // Initialize multilingual fields from project data
              titles: p.titles || {},
              descriptions: p.descriptions || {},
              locations_multilingual: p.locations_multilingual || {},
              clients_multilingual: p.clients_multilingual || {},
              completion_dates_multilingual: p.completion_dates_multilingual || {},
              project_types_multilingual: p.project_types_multilingual || {},
              project_values_multilingual: p.project_values_multilingual || {},
              durations_multilingual: p.durations_multilingual || {},
              gallery_captions: p.gallery_captions || {},
              gallery_hotspots: p.gallery_hotspots || []
            });
          }
          setAllProducts(products);
        } catch (e) {
          console.error(e);
          toast.error('Failed to refresh project');
        } finally {
          setLoading(false);
        }
      };
      await load();
    }
  };

  const updateBasicField = (field: string, value: any) => {
    if (!project) return;
    setProject(prev => ({ ...prev!, [field]: value }));
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
    if (!project) return;
    const map: Record<string, keyof MultilingualProject> = {
      title: 'titles',
      description: 'descriptions',
      location: 'locations_multilingual',
      client: 'clients_multilingual',
      category: 'categories_multilingual',
      completion_date: 'completion_dates_multilingual',
      project_type: 'project_types_multilingual',
      project_value: 'project_values_multilingual',
      duration: 'durations_multilingual'
    };
    const key = map[field];
    if (!key) return;
    setProject(prev => ({
      ...prev!,
      [key]: {
        ...((prev as any)[key] || {}),
        [languageCode]: value
      }
    } as MultilingualProject));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    try {
      const fileName = `project-${project.id}-${Date.now()}`;
      const { error } = await supabase.storage.from('project-images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(fileName);
      updateBasicField('image', publicUrl);
      toast.success('Image uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !project) return;
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fileName = `project-gallery-${project.id}-${Date.now()}-${Math.random()}`;
        const { error } = await supabase.storage.from('project-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(fileName);
        urls.push(publicUrl);
      }
      updateBasicField('gallery_images', [...(project.gallery_images || []), ...urls]);
      toast.success(`${urls.length} images uploaded`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload gallery');
    }
  };

  const handleSave = async () => {
    if (!project) return;
    try {
      setSaving(true);
      const updateData = {
        category: project.category,
        project_type: project.project_type,
        project_value: project.project_value,
        duration: project.duration,
        completion_date: project.completion_date,
        image: project.image,
        gallery_images: project.gallery_images,
        gallery_captions: project.gallery_captions || [],
        gallery_hotspots: project.gallery_hotspots || [],
        features: project.features || [],
        products_used: project.products_used || [],
        isActive: project.isActive,
        showInFeatured: project.showInFeatured,
        displayOrder: project.displayOrder,
        titles: project.titles || {},
        descriptions: project.descriptions || {},
        locations_multilingual: project.locations_multilingual || {},
        clients_multilingual: project.clients_multilingual || {},
        completion_dates_multilingual: project.completion_dates_multilingual || {},
        project_types_multilingual: project.project_types_multilingual || {},
        project_values_multilingual: project.project_values_multilingual || {},
        durations_multilingual: project.durations_multilingual || {}
      } as any;
      
      console.log('Saving project with data:', updateData);
      const result = await projectService.updateProject(project.id, updateData);
      console.log('Save result:', result);
      if (result) {
        // Convert the result back to MultilingualProject format
        const updatedProject = {
          ...project,
          ...result,
          gallery_images: result.gallery_images || []
        };
        console.log('Updated project state:', updatedProject);
        setProject(updatedProject);
        
        // Refresh project data from database to ensure consistency
        setTimeout(() => {
          refreshProject();
        }, 500);
      }
      toast.success(t('messages.saveSuccess'));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('messages.loading')}</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('messages.notFound')}</h2>
          <Button onClick={() => navigate('/admin/projects')}>
            {t('nav.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('nav.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('actions.edit')} {t('nav.projects')}</h1>
            <p className="text-muted-foreground">ID: {project.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={refreshProject} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Completion Date - Keep this as it's a date field that doesn't need translation */}
              <div>
                <label className="block text-sm font-medium mb-2">Completion Date</label>
                <Input type="date" value={project.completion_date || ''} onChange={(e) => updateBasicField('completion_date', e.target.value)} />
              </div>

              {/* Category - Single selection for all languages */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select 
                  value={project.category || ''} 
                  onValueChange={(value) => updateBasicField('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Category will be displayed in the user's selected language
                </p>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Features</label>
                <FeaturesChecklist features={[]} selectedFeatures={project.features || []} onFeaturesChange={(f) => updateBasicField('features', f)} language={adminLanguage} placeholder="Search features..." className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Selected features apply to all languages.</p>
              </div>

              {/* Products Used Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Products Used</h3>
                {project.products_used.map((productId, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={productId || ''}
                      onValueChange={(value) => {
                        const newProducts = [...project.products_used];
                        newProducts[index] = value;
                        updateBasicField('products_used', newProducts);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No product</SelectItem>
                        {allProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.names?.[adminLanguage] || p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newProducts = project.products_used.filter((_, i) => i !== index);
                        updateBasicField('products_used', newProducts);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    updateBasicField('products_used', [...project.products_used, '']);
                  }}
                >
                  Add Product
                </Button>
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Main Image</label>
                <div className="space-y-3">
                  {project.image && (
                    <img src={project.image} alt="Project" className="w-full h-32 object-cover rounded-lg border" />
                  )}
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                    <Button variant="outline" size="sm" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Images</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="flex-1" />
                    <Button variant="outline" size="sm" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {project.gallery_images && project.gallery_images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {project.gallery_images.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} className="w-full h-24 object-cover rounded-lg border" />
                          <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {
                            const next = [...(project.gallery_images || [])];
                            next.splice(i, 1);
                            updateBasicField('gallery_images', next);
                          }}>×</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Flags */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isActive" checked={project.isActive !== false} onChange={(e) => updateBasicField('isActive', e.target.checked)} className="rounded" />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="showInFeatured" checked={project.showInFeatured || false} onChange={(e) => updateBasicField('showInFeatured', e.target.checked)} className="rounded" />
                  <label htmlFor="showInFeatured" className="text-sm font-medium">Show in Featured</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multilingual Content */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multilingual Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full" onValueChange={setCurrentLanguage}>
                <TabsList className="grid w-full grid-cols-7 h-12 mb-6">
                  {languages.map(lang => (
                    <TabsTrigger key={lang.code} value={lang.code} className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.nativeName} - {lang.name}
                      </h3>
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Type className="h-4 w-4 inline mr-2" />
                            Project Title ({lang.nativeName})
                          </label>
                          <Input 
                            value={project.titles?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)} 
                            placeholder="Enter project title" 
                            className="text-lg font-medium" 
                          />
                        </div>
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Project Description ({lang.nativeName})
                          </label>
                          <ModernRichTextEditor 
                            value={project.descriptions?.[lang.code] || ''} 
                            onChange={(v) => updateTranslation(lang.code, 'description', v)} 
                            placeholder="Enter description..." 
                            height="220px" 
                          />
                        </div>
                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Location ({lang.nativeName})</label>
                          <Input 
                            value={project.locations_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'location', e.target.value)} 
                            placeholder="City, Country" 
                          />
                        </div>
                        {/* Client */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Client ({lang.nativeName})</label>
                          <Input 
                            value={project.clients_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'client', e.target.value)} 
                            placeholder="Client" 
                          />
                        </div>




                        {/* Project Type */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Project Type ({lang.nativeName})</label>
                          <Input 
                            value={project.project_types_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'project_type', e.target.value)} 
                            placeholder="e.g., Commercial, Residential" 
                          />
                        </div>

                        {/* Project Value */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Project Value ({lang.nativeName})</label>
                          <Input 
                            value={project.project_values_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'project_value', e.target.value)} 
                            placeholder="e.g., $1.5M" 
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Duration ({lang.nativeName})</label>
                          <Input 
                            value={project.durations_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'duration', e.target.value)} 
                            placeholder="e.g., 12 months" 
                          />
                        </div>

                        {/* Completion Date */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Completion Date ({lang.nativeName})</label>
                          <Input 
                            value={project.completion_dates_multilingual?.[lang.code] || ''} 
                            onChange={(e) => updateTranslation(lang.code, 'completion_date', e.target.value)} 
                            placeholder="e.g., 2024" 
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Gallery Captions and Hotspots Editor */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Gallery Captions & Product Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Gallery Captions Editor */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Image Captions</h3>
                  <div className="space-y-4">
                    {project.gallery_images && project.gallery_images.length > 0 ? (
                      project.gallery_images.map((image, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-3">Image {index + 1}</h4>
                          <div className="space-y-4">
                            {languages.map(lang => (
                              <div key={lang.code} className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <span className="text-sm font-medium text-slate-600">{lang.flag} {lang.nativeName}</span>
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={project.gallery_captions?.[lang.code]?.[index] || ''}
                                    onChange={(e) => {
                                      const newCaptions = {
                                        ...(project.gallery_captions || {}),
                                        [lang.code]: {
                                          ...(project.gallery_captions?.[lang.code] || Array(project.gallery_images.length).fill('')),
                                          [index]: e.target.value
                                        }
                                      };
                                      setProject(prev => prev ? {
                                        ...prev,
                                        gallery_captions: newCaptions
                                      } : null);
                                    }}
                                    placeholder={`Write a caption for this image in ${lang.nativeName}...`}
                                    className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No gallery images uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Product Hotspots Editor */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Hotspots</h3>
                  
                  {/* Overall Hotspots Summary */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">All Hotspots Overview:</h4>
                    {project.gallery_hotspots && project.gallery_hotspots.some((hotspots, idx) => hotspots && hotspots.length > 0) ? (
                      <div className="space-y-2">
                        {project.gallery_hotspots.map((hotspots, imageIdx) => 
                          hotspots && hotspots.length > 0 ? (
                            <div key={imageIdx} className="text-xs">
                              <span className="font-medium text-slate-600">Image {imageIdx + 1}:</span>
                              <div className="ml-4 space-y-1">
                                {hotspots.map((hotspot, hotspotIdx) => (
                                  <div key={hotspotIdx} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-slate-600">{hotspot.productName}</span>
                                    <span className="text-slate-400">({Math.round(hotspot.x)}%, {Math.round(hotspot.y)}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No hotspots added to any images yet</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {project.gallery_images && project.gallery_images.length > 0 ? (
                      project.gallery_images.map((image, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-3">Image {index + 1}</h4>
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <img 
                                src={image} 
                                alt={`Gallery image ${index + 1}`}
                                className="w-64 h-40 object-cover rounded-lg border border-slate-300 cursor-crosshair"
                                onMouseDown={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                                  
                                  // Show product selection dialog
                                  setSelectedImageIndex(index);
                                  setClickPosition({ x, y });
                                  setShowProductDialog(true);
                                }}
                              />
                                                            {/* Hotspot markers - Draggable with Product Labels */}
                              {(project.gallery_hotspots?.[index] || []).map((hotspot, hotspotIndex) => (
                                <div
                                  key={hotspotIndex}
                                  className="absolute group"
                                  style={{
                                    left: `${hotspot.x}%`,
                                    top: `${hotspot.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                >
                                  {/* Hotspot dot */}
                                  <div
                                    className="w-6 h-6 bg-red-500 rounded-full border-2 border-white cursor-move shadow-lg hover:bg-red-600 transition-colors"
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', `${index}-${hotspotIndex}`);
                                    }}
                                    onDragEnd={(e) => {
                                      const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                      if (rect) {
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                                        
                                        // Update hotspot position
                                        const newHotspots = [...(project.gallery_hotspots || [])];
                                        newHotspots[index][hotspotIndex] = {
                                          ...newHotspots[index][hotspotIndex],
                                          x: Math.max(0, Math.min(100, x)),
                                          y: Math.max(0, Math.min(100, y))
                                        };
                                        setProject(prev => prev ? {
                                          ...prev,
                                          gallery_hotspots: newHotspots
                                        } : null);
                                      }
                                    }}
                                    onDoubleClick={() => {
                                      // Remove hotspot on double click
                                      const newHotspots = [...(project.gallery_hotspots || [])];
                                      newHotspots[index] = newHotspots[index].filter((_, i) => i !== hotspotIndex);
                                      setProject(prev => prev ? {
                                          ...prev,
                                          gallery_hotspots: newHotspots
                                        } : null);
                                    }}
                                    title={`${hotspot.productName} - Drag to move, double-click to remove`}
                                  />
                                  
                                  {/* Product name label - Always visible in admin */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-10">
                                    {hotspot.productName}
                                  </div>
                                </div>
                              ))}
                              <div className="mt-2 text-xs text-slate-500 text-center">
                                Click anywhere on image to add hotspot • Drag hotspots to move • Double-click to remove
                              </div>
                            </div>
                            
                            {/* Hotspots Summary */}
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-slate-700 mb-2">Current Hotspots:</h5>
                              {project.gallery_hotspots?.[index] && project.gallery_hotspots[index].length > 0 ? (
                                <div className="space-y-1">
                                  {project.gallery_hotspots[index].map((hotspot, hotspotIdx) => (
                                    <div key={hotspotIdx} className="flex items-center space-x-2 text-xs">
                                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                      <span className="text-slate-600">{hotspot.productName}</span>
                                      <span className="text-slate-400">({Math.round(hotspot.x)}%, {Math.round(hotspot.y)}%)</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No hotspots added yet</p>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Add Product Hotspot
                                </label>
                                <div className="flex space-x-2">
                                  <Select
                                    value=""
                                    onValueChange={(productId) => {
                                      if (productId) {
                                        const product = allProducts.find(p => p.id === productId);
                                        if (product) {
                                          const newHotspots = [...(project.gallery_hotspots || [])];
                                          if (!newHotspots[index]) newHotspots[index] = [];
                                          newHotspots[index].push({
                                            productName: product.names?.en || product.name || 'Unknown Product',
                                            x: 50, // Default center position
                                            y: 50
                                          });
                                          setProject(prev => prev ? {
                                            ...prev,
                                            gallery_hotspots: newHotspots
                                          } : null);
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue placeholder="Select a product..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <div className="p-2">
                                        <Input
                                          placeholder="Search products..."
                                          className="mb-2"
                                          onChange={(e) => setProductSearchTerm(e.target.value)}
                                        />
                                        {allProducts
                                          .filter(product => 
                                            (product.names?.en || product.name || '')
                                              .toLowerCase()
                                              .includes(productSearchTerm.toLowerCase())
                                          )
                                          .map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                              {product.names?.en || product.name || 'Unknown Product'}
                                            </SelectItem>
                                          ))}
                                      </div>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              {/* Current hotspots for this image */}
                              {(project.gallery_hotspots?.[index] || []).map((hotspot, hotspotIndex) => (
                                <div key={hotspotIndex} className="flex items-center justify-between p-2 bg-slate-50 rounded border mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-slate-700">{hotspot.productName}</span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    X: {Math.round(hotspot.x)}%, Y: {Math.round(hotspot.y)}%
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newHotspots = [...(project.gallery_hotspots || [])];
                                      newHotspots[index] = newHotspots[index].filter((_, i) => i !== hotspotIndex);
                                      setProject(prev => prev ? {
                                        ...prev,
                                        gallery_hotspots: newHotspots
                                      } : null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No gallery images uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Product for Hotspot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {allProducts
                .filter(product => 
                  (product.names?.en || product.name || '')
                    .toLowerCase()
                    .includes(productSearchTerm.toLowerCase())
                )
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      if (selectedImageIndex !== null && clickPosition) {
                        const newHotspots = [...(project?.gallery_hotspots || [])];
                        if (!newHotspots[selectedImageIndex]) newHotspots[selectedImageIndex] = [];
                        newHotspots[selectedImageIndex].push({
                          productName: product.names?.en || product.name || 'Unknown Product',
                          x: clickPosition.x,
                          y: clickPosition.y
                        });
                        setProject(prev => prev ? {
                          ...prev,
                          gallery_hotspots: newHotspots
                        } : null);
                      }
                      setShowProductDialog(false);
                      setProductSearchTerm('');
                    }}
                  >
                    <div className="font-medium">{product.names?.en || product.name || 'Unknown Product'}</div>
                    <div className="text-sm text-slate-500">{product.category}</div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


