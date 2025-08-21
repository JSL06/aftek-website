import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Type, FileText, Globe, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function ProjectEdit() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t, language } = useAdminLanguage();

  const { categories } = useCategories('en');

  const [project, setProject] = useState<MultilingualProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!projectId) {
          setProject(null);
          return;
        }
        const [p, products] = await Promise.all([
          projectService.getProject(projectId, 'en'),
          productService.getAllProducts()
        ]);
        if (!p) {
          setProject(null);
        } else {
          // Ensure objects/arrays are initialized
          setProject({
            ...p,
            titles: p.titles || {},
            descriptions: p.descriptions || {},
            challenges_multilingual: p.challenges_multilingual || {},
            solutions_multilingual: p.solutions_multilingual || {},
            results_multilingual: p.results_multilingual || {},
            locations_multilingual: p.locations_multilingual || {},
            clients_multilingual: p.clients_multilingual || {},
            categories_multilingual: p.categories_multilingual || {},
            completion_dates_multilingual: p.completion_dates_multilingual || {},
            project_types_multilingual: p.project_types_multilingual || {},
            project_values_multilingual: p.project_values_multilingual || {},
            durations_multilingual: p.durations_multilingual || {},
            features: p.features || [],
            products_used: Array.isArray(p.products_used) ? p.products_used : [],
            gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : []
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

  const updateBasicField = (field: string, value: any) => {
    if (!project) return;
    setProject(prev => ({ ...prev!, [field]: value }));
  };

  const updateTranslation = (languageCode: string, field: string, value: string) => {
    if (!project) return;
    const map: Record<string, keyof MultilingualProject> = {
      title: 'titles',
      description: 'descriptions',
      challenges: 'challenges_multilingual',
      solutions: 'solutions_multilingual',
      results: 'results_multilingual',
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
        gallery: project.gallery,
        gallery_images: project.gallery_images,
        features: project.features || [],
        products_used: project.products_used || [],
        isActive: project.isActive,
        showInFeatured: project.showInFeatured,
        displayOrder: project.displayOrder,
        titles: project.titles || {},
        descriptions: project.descriptions || {},
        challenges_multilingual: project.challenges_multilingual || {},
        solutions_multilingual: project.solutions_multilingual || {},
        results_multilingual: project.results_multilingual || {},
        locations_multilingual: project.locations_multilingual || {},
        clients_multilingual: project.clients_multilingual || {},
        categories_multilingual: project.categories_multilingual || {},
        completion_dates_multilingual: project.completion_dates_multilingual || {},
        project_types_multilingual: project.project_types_multilingual || {},
        project_values_multilingual: project.project_values_multilingual || {},
        durations_multilingual: project.durations_multilingual || {}
      } as any;
      const result = await projectService.updateProject(project.id, updateData);
      setProject(result);
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
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select onValueChange={(value) => updateBasicField('category', value)} defaultValue={project.category || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
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
                <Input value={project.project_type || ''} onChange={(e) => updateBasicField('project_type', e.target.value)} placeholder="e.g., Commercial, Residential" />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Value</label>
                <Input value={project.project_value || ''} onChange={(e) => updateBasicField('project_value', e.target.value)} placeholder="e.g., $1.5M" />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Input value={project.duration || ''} onChange={(e) => updateBasicField('duration', e.target.value)} placeholder="e.g., 12 months" />
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Completion Date</label>
                <Input type="date" value={project.completion_date || ''} onChange={(e) => updateBasicField('completion_date', e.target.value)} />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Features</label>
                <FeaturesChecklist features={[]} selectedFeatures={project.features || []} onFeaturesChange={(f) => updateBasicField('features', f)} language={language} placeholder="Search features..." className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Selected features apply to all languages.</p>
              </div>

              {/* Products Used */}
              <div>
                <label className="block text-sm font-medium mb-2">Products Used</label>
                <div className="space-y-3">
                  {(project.products_used || []).map((productId, index) => (
                    <div key={index} className="flex gap-2">
                      <Select value={productId} onValueChange={(value) => {
                        const next = [...(project.products_used || [])];
                        next[index] = value;
                        updateBasicField('products_used', next);
                      }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No product</SelectItem>
                          {allProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.names?.['en'] || p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const next = [...(project.products_used || [])];
                        next.splice(index, 1);
                        updateBasicField('products_used', next);
                      }}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => updateBasicField('products_used', [...(project.products_used || []), ''])} className="w-full">Add Product</Button>
                </div>
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
              <Tabs defaultValue="en" className="w-full">
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
                          <Input value={project.titles?.[lang.code] || ''} onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)} placeholder="Enter project title" className="text-lg font-medium" />
                        </div>
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Project Description ({lang.nativeName})
                          </label>
                          <ModernRichTextEditor value={project.descriptions?.[lang.code] || ''} onChange={(v) => updateTranslation(lang.code, 'description', v)} placeholder="Enter description..." height="220px" />
                        </div>
                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Location ({lang.nativeName})</label>
                          <Input value={project.locations_multilingual?.[lang.code] || ''} onChange={(e) => updateTranslation(lang.code, 'location', e.target.value)} placeholder="City, Country" />
                        </div>
                        {/* Client */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Client ({lang.nativeName})</label>
                          <Input value={project.clients_multilingual?.[lang.code] || ''} onChange={(e) => updateTranslation(lang.code, 'client', e.target.value)} placeholder="Client" />
                        </div>
                        {/* Challenges */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Challenges ({lang.nativeName})</label>
                          <ModernRichTextEditor value={project.challenges_multilingual?.[lang.code] || ''} onChange={(v) => updateTranslation(lang.code, 'challenges', v)} height="160px" placeholder="Describe challenges..." />
                        </div>
                        {/* Solutions */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Solutions ({lang.nativeName})</label>
                          <ModernRichTextEditor value={project.solutions_multilingual?.[lang.code] || ''} onChange={(v) => updateTranslation(lang.code, 'solutions', v)} height="160px" placeholder="Describe solutions..." />
                        </div>
                        {/* Results */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Results ({lang.nativeName})</label>
                          <ModernRichTextEditor value={project.results_multilingual?.[lang.code] || ''} onChange={(v) => updateTranslation(lang.code, 'results', v)} height="160px" placeholder="Describe results..." />
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


