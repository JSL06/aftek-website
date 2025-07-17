import { supabase } from '@/integrations/supabase/client';

// Project interface that matches database structure
export interface Project {
  id: string;
  name: string;
  title: string;
  slug?: string;
  description: string;
  location: string;
  category: string;
  client: string;
  completion_date: string;
  project_type: string;
  image?: string;
  gallery?: string[];
  case_study_pdf?: string;
  features: string[];
  specifications?: Record<string, any>;
  products_used?: string[];
  project_value?: string;
  duration?: string;
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

class ProjectService {
  private projects: Project[] = [];
  private initialized = false;

  constructor() {
    this.initializeProjects();
  }

  // Generate SEO-friendly slug from project title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
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
    if (this.initialized) return;

    try {
      await this.loadFromDatabase();
      console.log('Loaded projects from database');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize projects:', error);
      this.projects = [];
      this.initialized = true;
    }
  }

  // Load projects from Supabase database
  private async loadFromDatabase(): Promise<void> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Convert database format to project format
    this.projects = (data || []).map(this.convertDatabaseToProject.bind(this));
  }

  // Convert database project to Project format
  private convertDatabaseToProject(dbProject: any): Project {
    // Helper function to safely parse JSON strings from database
    const safeJsonParse = (jsonData: any, defaultValue: any) => {
      try {
        if (typeof jsonData === 'string') {
          return JSON.parse(jsonData);
        }
        return jsonData || defaultValue;
      } catch (error) {
        console.warn('Failed to parse JSON:', jsonData, error);
        return defaultValue;
      }
    };

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
      tags: project.tags,
      created_at: project.created_at,
      updated_at: project.updated_at
    };
  }

  // Get all projects
  async getAllProjects(): Promise<Project[]> {
    await this.initializeProjects();
    return this.ensureSlugs([...this.projects]);
  }

  // Get projects for website display (filtered)
  async getWebsiteProjects(): Promise<Project[]> {
    await this.initializeProjects();
    return this.ensureSlugs(
      this.projects
        .filter(project => project.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    );
  }

  // Get featured projects
  async getFeaturedProjects(): Promise<Project[]> {
    await this.initializeProjects();
    return this.projects
      .filter(project => project.showInFeatured && project.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Get projects for admin (all projects)
  async getAdminProjects(): Promise<Project[]> {
    await this.initializeProjects();
    return [...this.projects].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Get project by ID
  async getProjectById(id: string): Promise<Project | null> {
    await this.initializeProjects();
    const project = this.projects.find(project => project.id === id);
    if (project) {
      return this.ensureSlugs([project])[0];
    }
    return null;
  }

  // Get project by slug
  async getProjectBySlug(slug: string): Promise<Project | null> {
    await this.initializeProjects();
    const projectsWithSlugs = this.ensureSlugs(this.projects);
    return projectsWithSlugs.find(project => project.slug === slug) || null;
  }

  // Add new project
  async addProject(projectData: Partial<Project>): Promise<Project> {
    await this.initializeProjects();

    const newProject: Project = {
      id: this.generateUUID(),
      name: projectData.name || projectData.title?.toLowerCase().replace(/\s+/g, '-') || '',
      title: projectData.title || '',
      slug: projectData.slug || this.generateSlug(projectData.title || ''),
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
      project_value: projectData.project_value,
      duration: projectData.duration,
      challenges: projectData.challenges,
      solutions: projectData.solutions,
      results: projectData.results,
      testimonial: projectData.testimonial,
      isActive: projectData.isActive ?? true,
      showInFeatured: projectData.showInFeatured ?? false,
      displayOrder: projectData.displayOrder ?? this.projects.length + 1,
      tags: projectData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Save to database
      const dbProject = this.convertProjectToDatabase(newProject);
      const { error } = await supabase
        .from('projects')
        .insert([dbProject]);

      if (error) {
        throw new Error(`Failed to add project: ${error.message}`);
      }

      // Add to local array
      this.projects.push(newProject);

      console.log('✅ Project added successfully:', newProject.title);
      return newProject;
    } catch (error) {
      console.error('❌ Error adding project:', error);
      throw error;
    }
  }

  // Update existing project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await this.initializeProjects();

    const index = this.projects.findIndex(project => project.id === id);
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found`);
    }

    // Update the project
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      id, // Ensure ID doesn't change
      created_at: this.projects[index].created_at, // Preserve original date
      updated_at: new Date().toISOString(),
      // Ensure slug is updated if title changes
      slug: updates.title ? this.generateSlug(updates.title) : this.projects[index].slug
    };

    try {
      // Persist to database
      const dbProject = this.convertProjectToDatabase(this.projects[index]);
      const { error } = await supabase
        .from('projects')
        .update(dbProject)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }

      console.log('✅ Project updated successfully:', this.projects[index].title);
      return this.projects[index];
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    await this.initializeProjects();

    const index = this.projects.findIndex(project => project.id === id);
    if (index === -1) {
      console.log(`Project with ID ${id} not found`);
      return false;
    }

    const project = this.projects[index];
    
    try {
      console.log(`🗑️ Deleting project: "${project.title}" (ID: ${id})`);
      
      // Delete from database
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }

      // Remove from local array
      this.projects.splice(index, 1);
      
      console.log(`✅ Successfully deleted "${project.title}"`);
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      
      // Emergency fallback - remove from local array anyway
      this.projects.splice(index, 1);
      console.log(`🚨 Emergency removal of "${project.title}" from local array`);
      
      return true;
    }
  }

  // Update featured status
  async updateFeaturedStatus(id: string, showInFeatured: boolean): Promise<boolean> {
    return (await this.updateProject(id, { showInFeatured })) !== null;
  }

  // Search projects
  async searchProjects(query: string): Promise<Project[]> {
    await this.initializeProjects();

    const searchTerm = query.toLowerCase();
    return this.projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.location.toLowerCase().includes(searchTerm) ||
      project.category.toLowerCase().includes(searchTerm) ||
      project.client.toLowerCase().includes(searchTerm) ||
      project.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  // Filter projects by category
  async getProjectsByCategory(category: string): Promise<Project[]> {
    await this.initializeProjects();
    return this.projects.filter(project => 
      project.category === category && project.isActive
    );
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    await this.initializeProjects();
    const categories = new Set(this.projects.map(project => project.category));
    return Array.from(categories).sort();
  }

  // Force refresh projects from database (bypass cache)
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing projects from database...');
    this.initialized = false;
    this.projects = [];
    await this.initializeProjects();
    console.log('✅ Force refresh complete');
  }

  // Generate UUID
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}

// Export a singleton instance
export const projectService = new ProjectService();

// Export the class for testing
export { ProjectService }; 