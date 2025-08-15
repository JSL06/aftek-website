import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Globe, Building2, Home, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface GuideContent {
  id: string;
  page_section: string;
  language: string;
  title: string;
  description: string;
  content?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface GuideFacility {
  id: string;
  name: string;
  value: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  translations: Record<string, { name: string; description?: string }>;
}

interface GuideHotspot {
  id: string;
  label: string;
  category: string;
  description: string;
  x: number;
  y: number;
  facility_type: string;
  product_ids: string[];
  is_active: boolean;
  display_order: number;
  translations: Record<string, { label: string; description: string }>;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

const PAGE_SECTIONS = [
  { value: 'hero', label: 'Hero Section', description: 'Main title and description' },
  { value: 'facility_selection', label: 'Facility Selection', description: 'Building type selection area' },
  { value: 'building_diagram', label: 'Building Diagram', description: 'Interactive building structure' },
  { value: 'hotspot_instructions', label: 'Hotspot Instructions', description: 'Instructions for using hotspots' },
  { value: 'solution_builder', label: 'Solution Builder', description: 'AI solution generator section' }
];

const GuideContentManager = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('content');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Content management
  const [contentItems, setContentItems] = useState<GuideContent[]>([]);
  const [editingContent, setEditingContent] = useState<GuideContent | null>(null);
  const [newContent, setNewContent] = useState<Partial<GuideContent>>({
    page_section: 'hero',
    language: 'en',
    title: '',
    description: '',
    content: '',
    is_active: true,
    display_order: 1
  });
  
  // Facility management
  const [facilities, setFacilities] = useState<GuideFacility[]>([]);
  const [editingFacility, setEditingFacility] = useState<GuideFacility | null>(null);
  const [newFacility, setNewFacility] = useState<Partial<GuideFacility>>({
    name: '',
    value: '',
    icon: 'Building2',
    is_active: true,
    display_order: 1,
    translations: {}
  });
  
  // Hotspot management
  const [hotspots, setHotspots] = useState<GuideHotspot[]>([]);
  const [editingHotspot, setEditingHotspot] = useState<GuideHotspot | null>(null);
  const [newHotspot, setNewHotspot] = useState<Partial<GuideHotspot>>({
    label: '',
    category: '',
    description: '',
    x: 50,
    y: 50,
    facility_type: 'residential',
    product_ids: [],
    is_active: true,
    display_order: 1,
    translations: {}
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadContent(),
        loadFacilities(),
        loadHotspots()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_content')
        .select('*')
        .order('display_order, language');

      if (error) {
        console.warn('Could not load guide content:', error);
        setContentItems([]);
      } else {
        setContentItems(data || []);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContentItems([]);
    }
  };

  const loadFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_facilities')
        .select('*')
        .order('display_order');

      if (error) {
        console.warn('Could not load facilities:', error);
        setFacilities([]);
      } else {
        setFacilities(data || []);
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
      setFacilities([]);
    }
  };

  const loadHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_hotspots')
        .select('*')
        .order('facility_type, display_order');

      if (error) {
        console.warn('Could not load hotspots:', error);
        setHotspots([]);
      } else {
        setHotspots(data || []);
      }
    } catch (error) {
      console.error('Error loading hotspots:', error);
      setHotspots([]);
    }
  };

  // Content management functions
  const handleSaveContent = async (content: GuideContent) => {
    try {
      setSaving(true);
      
      if (content.id) {
        // Update existing
        const { error } = await supabase
          .from('guide_content')
          .update({
            title: content.title,
            description: content.description,
            content: content.content,
            is_active: content.is_active,
            display_order: content.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;
        
        setContentItems(prev => 
          prev.map(item => item.id === content.id ? content : item)
        );
        toast.success('Content updated successfully');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('guide_content')
          .insert({
            page_section: content.page_section,
            language: content.language,
            title: content.title,
            description: content.description,
            content: content.content,
            is_active: content.is_active,
            display_order: content.display_order
          })
          .select()
          .single();

        if (error) throw error;
        
        setContentItems(prev => [...prev, data]);
        toast.success('Content created successfully');
      }
      
      setEditingContent(null);
      setNewContent({
        page_section: 'hero',
        language: 'en',
        title: '',
        description: '',
        content: '',
        is_active: true,
        display_order: 1
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // Facility management functions
  const handleSaveFacility = async (facility: GuideFacility) => {
    try {
      setSaving(true);
      
      if (facility.id) {
        // Update existing
        const { error } = await supabase
          .from('guide_facilities')
          .update({
            name: facility.name,
            value: facility.value,
            icon: facility.icon,
            is_active: facility.is_active,
            display_order: facility.display_order,
            translations: facility.translations,
            updated_at: new Date().toISOString()
          })
          .eq('id', facility.id);

        if (error) throw error;
        
        setFacilities(prev => 
          prev.map(item => item.id === facility.id ? facility : item)
        );
        toast.success('Facility updated successfully');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('guide_facilities')
          .insert({
            name: facility.name,
            value: facility.value,
            icon: facility.icon,
            is_active: facility.is_active,
            display_order: facility.display_order,
            translations: facility.translations
          })
          .select()
          .single();

        if (error) throw error;
        
        setFacilities(prev => [...prev, data]);
        toast.success('Facility created successfully');
      }
      
      setEditingFacility(null);
      setNewFacility({
        name: '',
        value: '',
        icon: 'Building2',
        is_active: true,
        display_order: 1,
        translations: {}
      });
    } catch (error) {
      console.error('Error saving facility:', error);
      toast.error('Failed to save facility');
    } finally {
      setSaving(false);
    }
  };

  // Hotspot management functions
  const handleSaveHotspot = async (hotspot: GuideHotspot) => {
    try {
      setSaving(true);
      
      if (hotspot.id) {
        // Update existing
        const { error } = await supabase
          .from('guide_hotspots')
          .update({
            label: hotspot.label,
            category: hotspot.category,
            description: hotspot.description,
            x: hotspot.x,
            y: hotspot.y,
            facility_type: hotspot.facility_type,
            product_ids: hotspot.product_ids,
            is_active: hotspot.is_active,
            display_order: hotspot.display_order,
            translations: hotspot.translations,
            updated_at: new Date().toISOString()
          })
          .eq('id', hotspot.id);

        if (error) throw error;
        
        setHotspots(prev => 
          prev.map(item => item.id === hotspot.id ? hotspot : item)
        );
        toast.success('Hotspot updated successfully');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('guide_hotspots')
          .insert({
            label: hotspot.label,
            category: hotspot.category,
            description: hotspot.description,
            x: hotspot.x,
            y: hotspot.y,
            facility_type: hotspot.facility_type,
            product_ids: hotspot.product_ids,
            is_active: hotspot.is_active,
            display_order: hotspot.display_order,
            translations: hotspot.translations
          })
          .select()
          .single();

        if (error) throw error;
        
        setHotspots(prev => [...prev, data]);
        toast.success('Hotspot created successfully');
      }
      
      setEditingHotspot(null);
      setNewHotspot({
        label: '',
        category: '',
        description: '',
        x: 50,
        y: 50,
        facility_type: 'residential',
        product_ids: [],
        is_active: true,
        display_order: 1,
        translations: {}
      });
    } catch (error) {
      console.error('Error saving hotspot:', error);
      toast.error('Failed to save hotspot');
    } finally {
      setSaving(false);
    }
  };

  const getContentForSection = (section: string, language: string) => {
    return contentItems.find(item => 
      item.page_section === section && item.language === language
    );
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="h-4 w-4" />;
      case 'Building2': return <Building2 className="h-4 w-4" />;
      case 'Factory': return <Factory className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading Guide Content Manager...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-4">
          <Link to="/admin" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Guide Content Manager</h1>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Language Selector */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Current Language</Label>
            <div className="flex gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant={currentLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentLanguage(lang.code)}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Page Content</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
            </TabsList>

            {/* Page Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Content Management</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage the text content for different sections of the Guide page in {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {PAGE_SECTIONS.map((section) => {
                    const content = getContentForSection(section.value, currentLanguage);
                    return (
                      <div key={section.value} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{section.label}</h3>
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingContent(content || {
                              page_section: section.value,
                              language: currentLanguage,
                              title: '',
                              description: '',
                              content: '',
                              is_active: true,
                              display_order: contentItems.filter(c => c.page_section === section.value).length + 1
                            })}
                          >
                            {content ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            {content ? 'Edit' : 'Add'}
                          </Button>
                        </div>
                        
                        {content && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{content.title}</Badge>
                              <Switch
                                checked={content.is_active}
                                onCheckedChange={(checked) => {
                                  const updated = { ...content, is_active: checked };
                                  handleSaveContent(updated);
                                }}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">{content.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Facility Management</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Manage building facility types and their translations
                      </p>
                    </div>
                    <Button onClick={() => setEditingFacility({} as GuideFacility)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Facility
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getIconComponent(facility.icon)}
                          <div>
                            <h4 className="font-medium">{facility.name}</h4>
                            <p className="text-sm text-muted-foreground">Value: {facility.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={facility.is_active}
                            onCheckedChange={(checked) => {
                              const updated = { ...facility, is_active: checked };
                              handleSaveFacility(updated);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFacility(facility)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hotspots Tab */}
            <TabsContent value="hotspots" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hotspot Management</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Manage interactive hotspots and their positions on building diagrams
                      </p>
                    </div>
                    <Button onClick={() => setEditingHotspot({} as GuideHotspot)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hotspot
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hotspots.map((hotspot) => (
                      <div key={hotspot.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{hotspot.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            Position: ({hotspot.x}%, {hotspot.y}%) | Facility: {hotspot.facility_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hotspot.is_active}
                            onCheckedChange={(checked) => {
                              const updated = { ...hotspot, is_active: checked };
                              handleSaveHotspot(updated);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingHotspot(hotspot)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Content Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingContent.description}
                  onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Content (Optional)</Label>
                <Textarea
                  value={editingContent.content || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingContent.is_active}
                  onCheckedChange={(checked) => setEditingContent({ ...editingContent, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingContent(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveContent(editingContent)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Facility Edit Modal */}
      {editingFacility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Facility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name (English)</Label>
                <Input
                  value={editingFacility.name || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Value (Internal)</Label>
                <Input
                  value={editingFacility.value || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, value: e.target.value })}
                />
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={editingFacility.icon || 'Building2'} onValueChange={(value) => setEditingFacility({ ...editingFacility, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Building2">Building</SelectItem>
                    <SelectItem value="Factory">Factory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingFacility.is_active || false}
                  onCheckedChange={(checked) => setEditingFacility({ ...editingFacility, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFacility(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveFacility(editingFacility as GuideFacility)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hotspot Edit Modal */}
      {editingHotspot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Hotspot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Label (English)</Label>
                <Input
                  value={editingHotspot.label || ''}
                  onChange={(e) => setEditingHotspot({ ...editingHotspot, label: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={editingHotspot.description || ''}
                  onChange={(e) => setEditingHotspot({ ...editingHotspot, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X Position (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingHotspot.x || 50}
                    onChange={(e) => setEditingHotspot({ ...editingHotspot, x: parseInt(e.target.value) || 50 })}
                  />
                </div>
                <div>
                  <Label>Y Position (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingHotspot.y || 50}
                    onChange={(e) => setEditingHotspot({ ...editingHotspot, y: parseInt(e.target.value) || 50 })}
                  />
                </div>
              </div>
              <div>
                <Label>Facility Type</Label>
                <Select value={editingHotspot.facility_type || 'residential'} onValueChange={(value) => setEditingHotspot({ ...editingHotspot, facility_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.value} value={facility.value}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingHotspot.is_active || false}
                  onCheckedChange={(checked) => setEditingHotspot({ ...editingHotspot, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingHotspot(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveHotspot(editingHotspot as GuideHotspot)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GuideContentManager;
