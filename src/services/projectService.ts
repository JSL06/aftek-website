import { supabase } from '@/integrations/supabase/client';

// Project interface that matches database structure
export interface Project {
  id: string;
  title: string;
  titles?: Record<string, string>; // Multilingual titles
  slug?: string;
  description: string;
  descriptions?: Record<string, string>; // Multilingual descriptions
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
  challenges_multilingual?: Record<string, string>; // Multilingual challenges
  solutions?: string;
  solutions_multilingual?: Record<string, string>; // Multilingual solutions
  results?: string;
  results_multilingual?: Record<string, string>; // Multilingual results
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
  created_at: string;
  updated_at: string;
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
  // Multilingual content
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  challenges_multilingual: Record<string, string>;
  solutions_multilingual: Record<string, string>;
  results_multilingual: Record<string, string>;
  locations_multilingual: Record<string, string>;
  clients_multilingual: Record<string, string>;
}

class ProjectService {
  // Generate SEO-friendly slug from project title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Get all projects with translations for admin
  async getProjects(languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      console.log('Project service: Fetching projects with translations for language:', languageCode);
      
      // 1. Get all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (projectsError) {
        console.error('Project service: Error fetching projects:', projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      // 2. Get all translations
      const { data: translations, error: translationsError } = await supabase
        .from('project_translations')
        .select('*');

      if (translationsError) {
        console.error('Project service: Error fetching translations:', translationsError);
        throw new Error(`Failed to fetch translations: ${translationsError.message}`);
      }

      // 3. Organize translations by project
      const translationsByProject: Record<string, ProjectTranslation[]> = {};
      translations?.forEach(translation => {
        if (!translationsByProject[translation.project_id]) {
          translationsByProject[translation.project_id] = [];
        }
        translationsByProject[translation.project_id].push(translation);
      });

      // 4. Build multilingual projects
      const multilingualProjects: MultilingualProject[] = (projects || []).map(project => {
        const projectTranslations = translationsByProject[project.id] || [];
        
        // Initialize multilingual content
        const titles: Record<string, string> = {};
        const descriptions: Record<string, string> = {};
        const challenges_multilingual: Record<string, string> = {};
        const solutions_multilingual: Record<string, string> = {};
        const results_multilingual: Record<string, string> = {};
        const locations_multilingual: Record<string, string> = {};
        const clients_multilingual: Record<string, string> = {};

        // Populate from translations
        projectTranslations.forEach(translation => {
          const lang = translation.language_code;
          if (translation.title) titles[lang] = translation.title;
          if (translation.description) descriptions[lang] = translation.description;
          if (translation.challenges) challenges_multilingual[lang] = translation.challenges;
          if (translation.solutions) solutions_multilingual[lang] = translation.solutions;
          if (translation.results) results_multilingual[lang] = translation.results;
          if (translation.location) locations_multilingual[lang] = translation.location;
          if (translation.client) clients_multilingual[lang] = translation.client;
        });

        // Fallback to base project data if no translations
        if (!titles['en'] && project.title) titles['en'] = project.title;
        if (!descriptions['en'] && project.description) descriptions['en'] = project.description;
        if (!challenges_multilingual['en'] && project.challenges) challenges_multilingual['en'] = project.challenges;
        if (!solutions_multilingual['en'] && project.solutions) solutions_multilingual['en'] = project.solutions;
        if (!results_multilingual['en'] && project.results) results_multilingual['en'] = project.results;
        if (!locations_multilingual['en'] && project.location) locations_multilingual['en'] = project.location;
        if (!clients_multilingual['en'] && project.client) clients_multilingual['en'] = project.client;

        return {
          ...project,
          titles,
          descriptions,
          challenges_multilingual,
          solutions_multilingual,
          results_multilingual,
          locations_multilingual,
          clients_multilingual
        };
      });

      console.log('Project service: Successfully fetched', multilingualProjects.length, 'projects');
      return multilingualProjects;
      
    } catch (error) {
      console.error('Project service: Error in getProjects:', error);
      throw error;
    }
  }

  // Get a single project with translations
  async getProject(id: string, languageCode: string = 'en'): Promise<MultilingualProject | null> {
    try {
      console.log('Project service: Fetching project', id, 'for language:', languageCode);
      
      // 1. Get the project
      const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        console.error('Project service: Error fetching project:', projectError);
        return null;
      }

      // 2. Get all translations for this project
      const { data: translations, error: translationsError } = await supabase
        .from('project_translations')
        .select('*')
        .eq('project_id', id);

      if (translationsError) {
        console.error('Project service: Error fetching translations:', translationsError);
        // Continue without translations
      }

      // 3. Build multilingual project
      const titles: Record<string, string> = {};
      const descriptions: Record<string, string> = {};
      const challenges_multilingual: Record<string, string> = {};
      const solutions_multilingual: Record<string, string> = {};
      const results_multilingual: Record<string, string> = {};
      const locations_multilingual: Record<string, string> = {};
      const clients_multilingual: Record<string, string> = {};

      // Populate from translations
      (translations || []).forEach(translation => {
        const lang = translation.language_code;
        if (translation.title) titles[lang] = translation.title;
        if (translation.description) descriptions[lang] = translation.description;
        if (translation.challenges) challenges_multilingual[lang] = translation.challenges;
        if (translation.solutions) solutions_multilingual[lang] = translation.solutions;
        if (translation.results) results_multilingual[lang] = translation.results;
        if (translation.location) locations_multilingual[lang] = translation.location;
        if (translation.client) clients_multilingual[lang] = translation.client;
      });

      // Fallback to base project data if no translations
      if (!titles['en'] && project.title) titles['en'] = project.title;
      if (!descriptions['en'] && project.description) descriptions['en'] = project.description;
      if (!challenges_multilingual['en'] && project.challenges) challenges_multilingual['en'] = project.challenges;
      if (!solutions_multilingual['en'] && project.solutions) solutions_multilingual['en'] = project.solutions;
      if (!results_multilingual['en'] && project.results) results_multilingual['en'] = project.results;
      if (!locations_multilingual['en'] && project.location) locations_multilingual['en'] = project.location;
      if (!clients_multilingual['en'] && project.client) clients_multilingual['en'] = project.client;

      const multilingualProject: MultilingualProject = {
        ...project,
        titles,
        descriptions,
        challenges_multilingual,
        solutions_multilingual,
        results_multilingual,
        locations_multilingual,
        clients_multilingual
      };

      console.log('Project service: Successfully fetched project:', multilingualProject.title);
      return multilingualProject;
      
    } catch (error) {
      console.error('Project service: Error in getProject:', error);
      return null;
    }
  }

  // Get projects for website display (filtered by isActive)
  async getWebsiteProjects(languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      const allProjects = await this.getProjects(languageCode);
      return allProjects.filter(project => project.isActive);
    } catch (error) {
      console.error('Project service: Error in getWebsiteProjects:', error);
      return [];
    }
  }

  // Get featured projects
  async getFeaturedProjects(languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      const allProjects = await this.getProjects(languageCode);
      return allProjects.filter(project => project.showInFeatured && project.isActive);
    } catch (error) {
      console.error('Project service: Error in getFeaturedProjects:', error);
      return [];
    }
  }

  // Get projects for admin (all projects)
  async getAdminProjects(languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      return await this.getProjects(languageCode);
    } catch (error) {
      console.error('Project service: Error in getAdminProjects:', error);
      return [];
    }
  }

  // Get project by slug
  async getProjectBySlug(slug: string, languageCode: string = 'en'): Promise<MultilingualProject | null> {
    try {
      const allProjects = await this.getProjects(languageCode);
      return allProjects.find(project => project.slug === slug) || null;
    } catch (error) {
      console.error('Project service: Error in getProjectBySlug:', error);
      return null;
    }
  }

  // Unified save method (similar to products)
  async updateProject(id: string, updateData: {
    // Basic fields
    title?: string;
    description?: string;
    location?: string;
    category?: string;
    client?: string;
    completion_date?: string;
    project_type?: string;
    image?: string;
    gallery?: string[];
    case_study_pdf?: string;
    features?: string[];
    specifications?: Record<string, any>;
    products_used?: string[];
    project_value?: string;
    duration?: string;
    challenges?: string;
    solutions?: string;
    results?: string;
    testimonial?: string;
    isActive?: boolean;
    showInFeatured?: boolean;
    displayOrder?: number;
    tags?: string[];
    // Multilingual content
    titles?: Record<string, string>;
    descriptions?: Record<string, string>;
    challenges_multilingual?: Record<string, string>;
    solutions_multilingual?: Record<string, string>;
    results_multilingual?: Record<string, string>;
    locations_multilingual?: Record<string, string>;
    clients_multilingual?: Record<string, string>;
  }): Promise<MultilingualProject> {
    try {
      console.log('Project service: UNIFIED SAVE - Starting update for project:', id);
      
      // 1. UNIFIED SAVE: Separate basic fields from multilingual content
      const basicFields: any = {};
      const multilingualFields = ['titles', 'descriptions', 'challenges_multilingual', 'solutions_multilingual', 'results_multilingual', 'locations_multilingual', 'clients_multilingual'];
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (!multilingualFields.includes(key)) {
          basicFields[key] = value;
        }
      });

      const { titles, descriptions, challenges_multilingual, solutions_multilingual, results_multilingual, locations_multilingual, clients_multilingual } = updateData;

      // 2. UNIFIED SAVE: Update all translations together
      if (titles || descriptions || challenges_multilingual || solutions_multilingual || results_multilingual || locations_multilingual || clients_multilingual) {
        console.log('Project service: UNIFIED SAVE - Updating translations for all languages');
        
        // Get all supported languages (you can expand this)
        const supportedLanguages = ['en', 'zh-Hant', 'zh-Hans', 'ja', 'ko', 'th', 'vi'];
        
        for (const languageCode of supportedLanguages) {
          const newTitle = titles?.[languageCode];
          const newDescription = descriptions?.[languageCode];
          const newChallenges = challenges_multilingual?.[languageCode];
          const newSolutions = solutions_multilingual?.[languageCode];
          const newResults = results_multilingual?.[languageCode];
          const newLocation = locations_multilingual?.[languageCode];
          const newClient = clients_multilingual?.[languageCode];

          if (newTitle || newDescription || newChallenges || newSolutions || newResults || newLocation || newClient) {
            console.log(`Project service: UNIFIED SAVE - Updating ${languageCode} translations`);
            
            const { error: translationError } = await supabase
              .from('project_translations')
              .upsert({
                project_id: id,
                language_code: languageCode,
                title: newTitle || null,
                description: newDescription || null,
                challenges: newChallenges || null,
                solutions: newSolutions || null,
                results: newResults || null,
                location: newLocation || null,
                client: newClient || null
              }, {
                onConflict: 'project_id,language_code'
              });

            if (translationError) {
              console.error(`Project service: UNIFIED SAVE - Error updating ${languageCode}:`, translationError);
              throw translationError;
            }
            console.log(`Project service: UNIFIED SAVE - Successfully updated ${languageCode}`);
          }
        }
      }

      // 3. UNIFIED SAVE: Update basic fields together
      if (Object.keys(basicFields).length > 0) {
        console.log('Project service: UNIFIED SAVE - Updating basic fields:', basicFields);
        
        // Clean and prepare basic field updates
        const cleanBasicUpdates: any = {};
        Object.entries(basicFields).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            cleanBasicUpdates[key] = value;
          }
        });
        
        if (Object.keys(cleanBasicUpdates).length > 0) {
          console.log('Project service: UNIFIED SAVE - Clean basic updates:', cleanBasicUpdates);
          
          const { error: basicError } = await supabase
            .from('projects')
            .update(cleanBasicUpdates)
            .eq('id', id);

          if (basicError) {
            console.error('Project service: UNIFIED SAVE - Error updating basic fields:', basicError);
            throw basicError;
          }
          console.log('Project service: UNIFIED SAVE - Basic fields updated successfully');
        }
      }

      // 4. UNIFIED SAVE: Mirror English content to base table for reliability
      if (titles?.['en'] || descriptions?.['en'] || challenges_multilingual?.['en'] || solutions_multilingual?.['en'] || results_multilingual?.['en'] || locations_multilingual?.['en'] || clients_multilingual?.['en']) {
        console.log('Project service: UNIFIED SAVE - Mirroring English content to base table');
        
        const baseUpdates: any = {};
        if (titles?.['en']) {
          baseUpdates.title = titles['en'].trim();
          console.log(`Project service: UNIFIED SAVE - Mirroring English title: "${titles['en']}"`);
        }
        if (descriptions?.['en']) {
          baseUpdates.description = descriptions['en'].trim();
          console.log(`Project service: UNIFIED SAVE - Mirroring English description: "${descriptions['en'].substring(0, 50)}..."`);
        }
        if (challenges_multilingual?.['en']) {
          baseUpdates.challenges = challenges_multilingual['en'].trim();
        }
        if (solutions_multilingual?.['en']) {
          baseUpdates.solutions = solutions_multilingual['en'].trim();
        }
        if (results_multilingual?.['en']) {
          baseUpdates.results = results_multilingual['en'].trim();
        }
        if (locations_multilingual?.['en']) {
          baseUpdates.location = locations_multilingual['en'].trim();
        }
        if (clients_multilingual?.['en']) {
          baseUpdates.client = clients_multilingual['en'].trim();
        }
        
        if (Object.keys(baseUpdates).length > 0) {
          const { error: mirrorError } = await supabase
            .from('projects')
            .update(baseUpdates)
            .eq('id', id);

          if (mirrorError) {
            console.error('Project service: UNIFIED SAVE - Error mirroring to base table:', mirrorError);
            throw mirrorError;
          }
          console.log('Project service: UNIFIED SAVE - English content mirrored to base table');
        }
      }

      // 5. UNIFIED SAVE: Fetch final result
      console.log('Project service: UNIFIED SAVE - Fetching final project');
      const finalProject = await this.getProject(id);
      
      if (!finalProject) {
        throw new Error('Failed to fetch updated project');
      }

      console.log('Project service: UNIFIED SAVE - Project updated successfully:', finalProject.title);
      return finalProject;
      
    } catch (error) {
      console.error('Project service: UNIFIED SAVE - Error updating project:', error);
      throw error;
    }
  }

  // Add new project
  async addProject(projectData: Partial<MultilingualProject>): Promise<MultilingualProject> {
    try {
      console.log('Project service: Adding new project:', projectData.title || 'Untitled');
      
      // 1. Prepare basic project data
      const basicProjectData = {
        title: projectData.title || 'Untitled Project',
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
        challenges: projectData.challenges || '',
        solutions: projectData.solutions || '',
        results: projectData.results || '',
      testimonial: projectData.testimonial,
      isActive: projectData.isActive ?? true,
      showInFeatured: projectData.showInFeatured ?? false,
        displayOrder: projectData.displayOrder ?? 99,
        tags: projectData.tags || []
      };

      // 2. Insert basic project
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert([basicProjectData])
        .select()
        .single();

      if (insertError) {
        console.error('Project service: Error inserting project:', insertError);
        throw new Error(`Failed to add project: ${insertError.message}`);
      }

      // 3. Add translations if provided
      if (projectData.titles || projectData.descriptions || projectData.challenges_multilingual || projectData.solutions_multilingual || projectData.results_multilingual || projectData.locations_multilingual || projectData.clients_multilingual) {
        await this.updateProject(newProject.id, projectData);
      }

      // 4. Fetch final result
      const finalProject = await this.getProject(newProject.id);
      if (!finalProject) {
        throw new Error('Failed to fetch created project');
      }

      console.log('Project service: Project added successfully:', finalProject.title);
      return finalProject;
      
    } catch (error) {
      console.error('Project service: Error in addProject:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    try {
      console.log('Project service: Deleting project:', id);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Project service: Error deleting project:', error);
        throw new Error(`Failed to delete project: ${error.message}`);
      }

      console.log('Project service: Project deleted successfully');
      return true;
      
    } catch (error) {
      console.error('Project service: Error in deleteProject:', error);
      throw error;
    }
  }

  // Search projects
  async searchProjects(query: string, languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      const allProjects = await this.getProjects(languageCode);
      const searchTerm = query.toLowerCase();
      
      return allProjects.filter(project => 
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.location.toLowerCase().includes(searchTerm) ||
      project.category.toLowerCase().includes(searchTerm) ||
      project.client.toLowerCase().includes(searchTerm) ||
      project.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    } catch (error) {
      console.error('Project service: Error in searchProjects:', error);
      return [];
    }
  }

  // Get projects by category
  async getProjectsByCategory(category: string, languageCode: string = 'en'): Promise<MultilingualProject[]> {
    try {
      const allProjects = await this.getProjects(languageCode);
      return allProjects.filter(project => 
      project.category === category && project.isActive
    );
    } catch (error) {
      console.error('Project service: Error in getProjectsByCategory:', error);
      return [];
    }
  }

  // Get all categories
  async getCategories(languageCode: string = 'en'): Promise<string[]> {
    try {
      const allProjects = await this.getProjects(languageCode);
      const categories = new Set(allProjects.map(project => project.category));
    return Array.from(categories).sort();
    } catch (error) {
      console.error('Project service: Error in getCategories:', error);
      return [];
    }
  }

  // Force refresh projects from database
  async forceRefresh(): Promise<void> {
    console.log('Project service: Force refreshing projects from database...');
    // This will be handled by the next getProjects call
    console.log('Project service: Force refresh complete');
  }
}

// Export a singleton instance
export const projectService = new ProjectService();

// Export the class for testing
export { ProjectService }; 