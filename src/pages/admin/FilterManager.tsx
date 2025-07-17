import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FilterOption {
  id: string;
  type: string;
  value: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const FilterManager = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newOption, setNewOption] = useState({ type: 'category', value: '' });

  const filterTypes = [
    { key: 'category', label: 'Project Categories', description: 'Categories for projects (e.g., Infrastructure, Industrial)' },
    { key: 'feature', label: 'Project Features', description: 'Features and technologies used in projects' },
    { key: 'location', label: 'Project Locations', description: 'Common project locations or regions' },
    { key: 'project_type', label: 'Project Types', description: 'Types of projects (e.g., Construction, Renovation)' }
  ];

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('filter_options')
        .select('*')
        .order('type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFilterOptions(data || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Failed to load filter options');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    try {
      setSaving(true);
      
      // Check if option already exists
      const exists = filterOptions.some(
        opt => opt.type === newOption.type && opt.value.toLowerCase() === newOption.value.toLowerCase()
      );
      
      if (exists) {
        toast.error('This option already exists');
        return;
      }

      const { data, error } = await supabase
        .from('filter_options')
        .insert({
          type: newOption.type,
          value: newOption.value.trim(),
          display_order: filterOptions.filter(opt => opt.type === newOption.type).length + 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setFilterOptions(prev => [...prev, data]);
      setNewOption({ type: 'category', value: '' });
      toast.success('Filter option added successfully');
    } catch (error) {
      console.error('Error adding filter option:', error);
      toast.error('Failed to add filter option');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOption = async (id: string) => {
    if (!editingValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('filter_options')
        .update({ value: editingValue.trim() })
        .eq('id', id);

      if (error) throw error;

      setFilterOptions(prev => 
        prev.map(opt => 
          opt.id === id ? { ...opt, value: editingValue.trim() } : opt
        )
      );
      
      setEditingId(null);
      setEditingValue('');
      toast.success('Filter option updated successfully');
    } catch (error) {
      console.error('Error updating filter option:', error);
      toast.error('Failed to update filter option');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (id: string, value: string) => {
    if (!confirm(`Are you sure you want to delete "${value}"?`)) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('filter_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFilterOptions(prev => prev.filter(opt => opt.id !== id));
      toast.success('Filter option deleted successfully');
    } catch (error) {
      console.error('Error deleting filter option:', error);
      toast.error('Failed to delete filter option');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('filter_options')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      setFilterOptions(prev => 
        prev.map(opt => 
          opt.id === id ? { ...opt, is_active: !isActive } : opt
        )
      );
      
      toast.success(`Filter option ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling filter option:', error);
      toast.error('Failed to update filter option');
    }
  };

  const startEditing = (option: FilterOption) => {
    setEditingId(option.id);
    setEditingValue(option.value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const getFilterOptionsByType = (type: string) => {
    return filterOptions.filter(opt => opt.type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading filter options...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Button
            asChild
            variant="secondary"
            className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
          >
            <Link to="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Filter Manager</h1>
          <p className="text-primary-foreground/80 mt-2">
            Manage filter options for projects, products, and other content
          </p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Add New Option */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Filter Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filterType">Filter Type</Label>
                <select
                  id="filterType"
                  value={newOption.type}
                  onChange={(e) => setNewOption(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  {filterTypes.map(type => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="filterValue">Value</Label>
                <Input
                  id="filterValue"
                  value={newOption.value}
                  onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter filter option value"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAddOption} 
                  disabled={saving || !newOption.value.trim()}
                  className="w-full"
                >
                  {saving ? 'Adding...' : 'Add Option'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Options by Type */}
        <div className="space-y-8">
          {filterTypes.map(filterType => {
            const options = getFilterOptionsByType(filterType.key);
            return (
              <Card key={filterType.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {filterType.label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{filterType.description}</p>
                </CardHeader>
                <CardContent>
                  {options.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No {filterType.label.toLowerCase()} added yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {options.map(option => (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg ${
                            option.is_active ? 'bg-background' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {editingId === option.id ? (
                                <Input
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                              ) : (
                                <span className={`font-medium ${!option.is_active ? 'text-muted-foreground' : ''}`}>
                                  {option.value}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                                                             <Switch
                                 checked={option.is_active}
                                 onCheckedChange={() => handleToggleActive(option.id, option.is_active)}
                               />
                              
                              {editingId === option.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditOption(option.id)}
                                    disabled={saving}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing(option)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteOption(option.id, option.value)}
                                    disabled={saving}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Order: {option.display_order}</span>
                            <Badge variant={option.is_active ? 'default' : 'secondary'}>
                              {option.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterManager; 