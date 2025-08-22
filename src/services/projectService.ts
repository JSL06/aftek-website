import { supabase } from '@/integrations/supabase/client';

// Project interface that matches database structure
export interface Project {
  id: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  category: string;
  client: string;
  completion_date: string;
  project_type: string;
  image: string;
  gallery: string[];
  case_study_pdf?: string;
  features: string[];
  specifications?: any;
  products_used: string[];
  project_value?: string;
  duration: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  testimonial?: string;
  isActive: boolean;
  showInFeatured: boolean;
  displayOrder: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

// Interface for project translations
export interface ProjectTranslation {
  id: string;
  project_id: string;
  language_code: string;
  title: string;
  description?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  location?: string;
  client?: string;
  category?: string;
  completion_date?: string;
  project_type?: string;
  project_value?: string;
  duration?: string;
  created_at: string;
  updated_at?: string;
}

// Interface for multilingual project data
export interface MultilingualProject {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  client: string;
  completion_date: string;
  project_type: string;
  project_value: string;
  duration: string;
  challenges: string;
  solutions: string;
  results: string;
  features: string[];
  products_used: string[];
  image: string;
  gallery_images: string[];
  isActive: boolean;
  showInFeatured: boolean;
  displayOrder: number;
  // Multilingual fields
    titles?: Record<string, string>;
    descriptions?: Record<string, string>;
    challenges_multilingual?: Record<string, string>;
    solutions_multilingual?: Record<string, string>;
    results_multilingual?: Record<string, string>;
    locations_multilingual?: Record<string, string>;
  categories_multilingual?: Record<string, string>;
    clients_multilingual?: Record<string, string>;
    completion_dates_multilingual?: Record<string, string>;
    project_types_multilingual?: Record<string, string>;
    project_values_multilingual?: Record<string, string>;
    durations_multilingual?: Record<string, string>;
  features_multilingual?: Record<string, string[]>;
}

class ProjectService {
  private projects: Project[] = [];

  constructor() {
    this.initializeProjects();
  }

  // Manual refresh method for when database connection is ready
  async refreshProjects(): Promise<void> {
    console.log('Manual refresh of projects requested');
    await this.initializeProjects();
  }

  // Generate SEO-friendly slug from project title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Ensure all projects have slugs
  private ensureSlugs(projects: Project[]): Project[] {
    return projects.map(project => ({
      ...project,
      slug: project.slug || this.generateSlug(project.title)
    }));
  }

  // Initialize projects from database
  private async initializeProjects(): Promise<void> {
    try {
      await this.loadProjectsFromDatabase();
      console.log('Loaded projects from database');
            } catch (error) {
      console.error('Failed to initialize projects:', error);
      this.projects = [];
    }
  }

  // Load projects from Supabase database
  private async loadProjectsFromDatabase(): Promise<void> {
    try {
      console.log('Loading projects from database...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('isActive', true)
        .order('displayOrder', { ascending: true });

      if (error) {
        console.error('Database error loading projects:', error);
        throw error;
      }

      console.log('Raw projects data from database:', data);
      
      // Convert database format to project format
      this.projects = (data || []).map(this.convertDatabaseToProject.bind(this));
      console.log('Converted projects:', this.projects);
    } catch (error) {
      console.error('Error in loadProjectsFromDatabase:', error);
      this.projects = [];
    }
  }

  // Convert database project to Project format
  private convertDatabaseToProject(dbProject: any): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      title: dbProject.title,
      slug: dbProject.slug,
      description: dbProject.description || '',
      location: dbProject.location || '',
      category: dbProject.category || 'General',
      client: dbProject.client || '',
      completion_date: dbProject.completion_date || '',
      project_type: dbProject.project_type || '',
      image: dbProject.image || '/placeholder.svg',
      gallery: safeJsonParse(dbProject.gallery, []),
      case_study_pdf: dbProject.case_study_pdf,
      features: dbProject.features || [],
      specifications: safeJsonParse(dbProject.specifications, {}),
      products_used: dbProject.products_used || [],
      project_value: dbProject.project_value,
      duration: dbProject.duration,
      challenges: dbProject.challenges,
      solutions: dbProject.solutions,
      results: dbProject.results,
      testimonial: dbProject.testimonial,
      isActive: dbProject.isActive !== false,
      showInFeatured: dbProject.showInFeatured || false,
      displayOrder: dbProject.displayOrder || 99,
      tags: dbProject.tags || [],
      created_at: dbProject.created_at || new Date().toISOString(),
      updated_at: dbProject.updated_at
    };
  }

  // Convert Project format to database format
  private convertProjectToDatabase(project: Project): any {
    return {
      id: project.id,
      name: project.name,
      title: project.title,
      slug: project.slug,
      description: project.description,
      location: project.location,
      category: project.category,
      client: project.client,
      completion_date: project.completion_date,
      project_type: project.project_type,
      image: project.image,
      gallery: JSON.stringify(project.gallery || []),
      case_study_pdf: project.case_study_pdf,
      features: project.features,
      specifications: JSON.stringify(project.specifications || {}),
      products_used: project.products_used,
      project_value: project.project_value,
      duration: project.duration,
      challenges: project.challenges,
      solutions: project.solutions,
      results: project.results,
      testimonial: project.testimonial,
      isActive: project.isActive,
      showInFeatured: project.showInFeatured,
      displayOrder: project.displayOrder,
      tags: project.tags
    };
  }

  // Get all projects
  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  // Get project by ID
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  // Get project by slug
  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return this.projects.find(p => p.slug === slug);
  }

  // Get featured projects
  async getFeaturedProjects(): Promise<Project[]> {
    return this.projects.filter(p => p.showInFeatured);
  }

  // Get projects by category
  async getProjectsByCategory(category: string): Promise<Project[]> {
    return this.projects.filter(p => p.category === category);
  }

  // Get projects for website display (filtered by isActive)
  async getWebsiteProjects(): Promise<Project[]> {
    try {
      console.log('getWebsiteProjects called, total projects:', this.projects.length);
      
      // If no projects loaded, try to refresh
      if (this.projects.length === 0) {
        console.log('No projects loaded, attempting to refresh...');
        await this.refreshProjects();
      }
      
      const activeProjects = this.projects.filter(project => project.isActive);
      console.log('Active projects:', activeProjects);
      return activeProjects;
    } catch (error) {
      console.error('Error getting website projects:', error);
      return [];
    }
  }

  // Get projects for admin (all projects)
  async getAdminProjects(): Promise<Project[]> {
    try {
      return this.projects;
    } catch (error) {
      console.error('Error getting admin projects:', error);
      return [];
    }
  }

  // Add new project
  async addProject(projectData: Partial<Project>): Promise<Project> {
    try {
      // Generate UUID with fallback
      const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // Fallback UUID generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const newProject: Project = {
        id: generateId(),
        name: projectData.name || 'New Project',
        title: projectData.title || 'New Project',
        slug: this.generateSlug(projectData.title || 'New Project'),
      description: projectData.description || '',
      location: projectData.location || '',
      category: projectData.category || 'General',
      client: projectData.client || '',
      completion_date: projectData.completion_date || '',
      project_type: projectData.project_type || '',
      image: projectData.image || '/placeholder.svg',
      gallery: projectData.gallery || [],
      case_study_pdf: projectData.case_study_pdf,
      features: projectData.features || [],
      specifications: projectData.specifications || {},
      products_used: projectData.products_used || [],
        project_value: projectData.project_value || '',
        duration: projectData.duration || '',
        challenges: projectData.challenges || '',
        solutions: projectData.solutions || '',
        results: projectData.results || '',
      testimonial: projectData.testimonial,
      isActive: projectData.isActive ?? true,
      showInFeatured: projectData.showInFeatured ?? false,
        displayOrder: projectData.displayOrder ?? 99,
        tags: projectData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.projects.unshift(newProject);
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  // Update existing project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const projectIndex = this.projects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        return null;
      }

      const updatedProject = { ...this.projects[projectIndex], ...updates, updated_at: new Date().toISOString() };
      this.projects[projectIndex] = updatedProject;
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    try {
      const projectIndex = this.projects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        return false;
      }

      this.projects.splice(projectIndex, 1);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get categories from the centralized system
  async getCategories(language: string = 'en'): Promise<{ id: string; name: string; display_name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          id,
          name,
          category_translations!inner(
            display_name
          )
        `)
        .eq('category_translations.language_code', language)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data?.map(cat => ({
        id: cat.id,
        name: cat.name,
        display_name: cat.category_translations[0]?.display_name || cat.name
      })) || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get features from the centralized system
  async getFeatures(language: string = 'en'): Promise<{ id: string; feature_key: string; display_name: string; category: string }[]> {
    try {
      const { data, error } = await supabase
        .from('master_features')
        .select(`
          id,
          feature_key,
          category,
          feature_translations!inner(
            display_name
          )
        `)
        .eq('feature_translations.language_code', language)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching features:', error);
        return [];
      }

      return data?.map(feature => ({
        id: feature.id,
        feature_key: feature.feature_key,
        display_name: feature.feature_translations[0]?.display_name || feature.feature_key,
        category: feature.category
      })) || [];
    } catch (error) {
      console.error('Error fetching features:', error);
      return [];
    }
  }

  // Get products by IDs (for Products Used section)
  async getProductsByIds(productIds: string[]): Promise<{ id: string; name: string; category: string }[]> {
    if (!productIds || productIds.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          product_translations!inner(
            name
          )
        `)
        .in('id', productIds)
        .eq('isActive', true);

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data?.map(product => ({
        id: product.id,
        name: product.product_translations[0]?.name || product.name,
        category: product.category
      })) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
}

// Helper function to safely parse JSON
function safeJsonParse(value: any, defaultValue: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value || defaultValue;
}

export const projectService = new ProjectService(); 