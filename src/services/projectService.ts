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
  gallery_images?: string[]; // New gallery images field
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
  locations_multilingual?: Record<string, string>; // Multilingual locations
  clients_multilingual?: Record<string, string>; // Multilingual clients
  categories_multilingual?: Record<string, string>; // Multilingual categories
  completion_dates_multilingual?: Record<string, string>; // Multilingual completion dates
  project_types_multilingual?: Record<string, string>; // Multilingual project types
  project_values_multilingual?: Record<string, string>; // Multilingual project values
  durations_multilingual?: Record<string, string>; // Multilingual durations
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
  slug?: string;
  description: string;
  location: string;
  category: string;
  client: string;
  completion_date: string;
  project_type: string;
  image?: string;
  gallery?: string[];
  gallery_images?: string[]; // New gallery images field
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
  categories_multilingual: Record<string, string>;
  completion_dates_multilingual: Record<string, string>;
  project_types_multilingual: Record<string, string>;
  project_values_multilingual: Record<string, string>;
  durations_multilingual: Record<string, string>;
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
        const categories_multilingual: Record<string, string> = {};
        const completion_dates_multilingual: Record<string, string> = {};
        const project_types_multilingual: Record<string, string> = {};
        const project_values_multilingual: Record<string, string> = {};
        const durations_multilingual: Record<string, string> = {};

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
          if (translation.category) categories_multilingual[lang] = translation.category;
          if (translation.completion_date) completion_dates_multilingual[lang] = translation.completion_date;
          if (translation.project_type) project_types_multilingual[lang] = translation.project_type;
          if (translation.project_value) project_values_multilingual[lang] = translation.project_value;
          if (translation.duration) durations_multilingual[lang] = translation.duration;
        });

        // Fallback to base project data if no translations
        if (!titles['en'] && project.title) titles['en'] = project.title;
        if (!descriptions['en'] && project.description) descriptions['en'] = project.description;
        if (!challenges_multilingual['en'] && project.challenges) challenges_multilingual['en'] = project.challenges;
        if (!solutions_multilingual['en'] && project.solutions) solutions_multilingual['en'] = project.solutions;
        if (!results_multilingual['en'] && project.results) results_multilingual['en'] = project.results;
        if (!locations_multilingual['en'] && project.location) locations_multilingual['en'] = project.location;
        if (!clients_multilingual['en'] && project.client) clients_multilingual['en'] = project.client;
        if (!categories_multilingual['en'] && project.category) categories_multilingual['en'] = project.category;
        if (!completion_dates_multilingual['en'] && project.completion_date) completion_dates_multilingual['en'] = project.completion_date;
        if (!project_types_multilingual['en'] && project.project_type) project_types_multilingual['en'] = project.project_type;
        if (!project_values_multilingual['en'] && project.project_value) project_values_multilingual['en'] = project.project_value;
        if (!durations_multilingual['en'] && project.duration) durations_multilingual['en'] = project.duration;

        return {
          ...project,
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
      const categories_multilingual: Record<string, string> = {};
      const completion_dates_multilingual: Record<string, string> = {};
      const project_types_multilingual: Record<string, string> = {};
      const project_values_multilingual: Record<string, string> = {};
      const durations_multilingual: Record<string, string> = {};

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
        if (translation.category) categories_multilingual[lang] = translation.category;
        if (translation.completion_date) completion_dates_multilingual[lang] = translation.completion_date;
        if (translation.project_type) project_types_multilingual[lang] = translation.project_type;
        if (translation.project_value) project_values_multilingual[lang] = translation.project_value;
        if (translation.duration) durations_multilingual[lang] = translation.duration;
      });

      // Fallback to base project data if no translations
      if (!titles['en'] && project.title) titles['en'] = project.title;
      if (!descriptions['en'] && project.description) descriptions['en'] = project.description;
      if (!challenges_multilingual['en'] && project.challenges) challenges_multilingual['en'] = project.challenges;
      if (!solutions_multilingual['en'] && project.solutions) solutions_multilingual['en'] = project.solutions;
      if (!results_multilingual['en'] && project.results) results_multilingual['en'] = project.results;
      if (!locations_multilingual['en'] && project.location) locations_multilingual['en'] = project.location;
      if (!clients_multilingual['en'] && project.client) clients_multilingual['en'] = project.client;
      if (!categories_multilingual['en'] && project.category) categories_multilingual['en'] = project.category;
      if (!completion_dates_multilingual['en'] && project.completion_date) completion_dates_multilingual['en'] = project.completion_date;
      if (!project_types_multilingual['en'] && project.project_type) project_types_multilingual['en'] = project.project_type;
      if (!project_values_multilingual['en'] && project.project_value) project_values_multilingual['en'] = project.project_value;
      if (!durations_multilingual['en'] && project.duration) durations_multilingual['en'] = project.duration;

      const multilingualProject: MultilingualProject = {
        ...project,
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
    categories_multilingual?: Record<string, string>;
    completion_dates_multilingual?: Record<string, string>;
    project_types_multilingual?: Record<string, string>;
    project_values_multilingual?: Record<string, string>;
    durations_multilingual?: Record<string, string>;
  }): Promise<MultilingualProject> {
    try {
      console.log('Project service: UNIFIED SAVE - Starting update for project:', id);
      
      // Check if database schema is ready for new multilingual fields
      let hasNewSchema = false;
      let missingColumns: string[] = [];
      try {
        // Check each new column individually to identify exactly what's missing
        const columnsToCheck = ['category', 'completion_date', 'project_type', 'project_value', 'duration'];
        const columnChecks = await Promise.all(
          columnsToCheck.map(async (column) => {
            try {
              const { error } = await supabase
                .from('project_translations')
                .select(column)
                .limit(1);
              return { column, exists: !error };
            } catch {
              return { column, exists: false };
            }
          })
        );
        
        missingColumns = columnChecks.filter(check => !check.exists).map(check => check.column);
        hasNewSchema = missingColumns.length === 0;
        
        if (hasNewSchema) {
          console.log('Project service: UNIFIED SAVE - Database schema check passed - all new columns available');
        } else {
          console.warn(`Project service: UNIFIED SAVE - Missing columns: ${missingColumns.join(', ')}`);
          console.warn('Project service: UNIFIED SAVE - Falling back to basic multilingual fields only');
          
          // Log a helpful message for the user
          console.warn(`Project service: UNIFIED SAVE - To enable full multilingual support, run this SQL in Supabase:`);
          console.warn(`UPDATE_PROJECTS_MULTILINGUAL.sql`);
          console.warn(`Missing columns: ${missingColumns.join(', ')}`);
        }
      } catch (schemaCheckError) {
        console.warn('Project service: UNIFIED SAVE - Schema check failed, using fallback:', schemaCheckError);
        hasNewSchema = false;
        missingColumns = ['category', 'completion_date', 'project_type', 'project_value', 'duration'];
      }
      
      // 1. UNIFIED SAVE: Separate basic fields from multilingual content
      const basicFields: any = {};
      const multilingualFields = ['titles', 'descriptions', 'challenges_multilingual', 'solutions_multilingual', 'results_multilingual', 'locations_multilingual', 'clients_multilingual', 'categories_multilingual', 'completion_dates_multilingual', 'project_types_multilingual', 'project_values_multilingual', 'durations_multilingual'];
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (!multilingualFields.includes(key)) {
          basicFields[key] = value;
        }
      });

      const { titles, descriptions, challenges_multilingual, solutions_multilingual, results_multilingual, locations_multilingual, clients_multilingual, categories_multilingual, completion_dates_multilingual, project_types_multilingual, project_values_multilingual, durations_multilingual } = updateData;

      // 2. UNIFIED SAVE: Update all translations together
      if (titles || descriptions || challenges_multilingual || solutions_multilingual || results_multilingual || locations_multilingual || clients_multilingual || categories_multilingual || completion_dates_multilingual || project_types_multilingual || project_values_multilingual || durations_multilingual) {
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
          const newCategory = categories_multilingual?.[languageCode];
          const newCompletionDate = completion_dates_multilingual?.[languageCode];
          const newProjectType = project_types_multilingual?.[languageCode];
          const newProjectValue = project_values_multilingual?.[languageCode];
          const newDuration = durations_multilingual?.[languageCode];

          console.log(`Project service: UNIFIED SAVE - Processing ${languageCode}:`, {
            title: newTitle,
            description: newDescription,
            challenges: newChallenges,
            solutions: newSolutions,
            results: newResults,
            location: newLocation,
            client: newClient,
            category: newCategory,
            completion_date: newCompletionDate,
            project_type: newProjectType,
            project_value: newProjectValue,
            duration: newDuration
          });

          if (newTitle || newDescription || newChallenges || newSolutions || newResults || newLocation || newClient || newCategory || newCompletionDate || newProjectType || newProjectValue || newDuration) {
            console.log(`Project service: UNIFIED SAVE - Updating ${languageCode} translations`);
            console.log(`Project service: UNIFIED SAVE - Data for ${languageCode}:`, {
              title: newTitle,
              description: newDescription,
              challenges: newChallenges,
              solutions: newSolutions,
              results: newResults,
              location: newLocation,
              client: newClient,
              category: newCategory,
              completion_date: newCompletionDate,
              project_type: newProjectType,
              project_value: newProjectValue,
              duration: newDuration
            });
            
            try {
              // Only create upsert data if we have at least one non-null value
              const hasValidData = newTitle || newDescription || newChallenges || newSolutions || newResults || newLocation || newClient || (hasNewSchema && (newCategory || newCompletionDate || newProjectType || newProjectValue || newDuration));
              
              if (!hasValidData) {
                console.log(`Project service: UNIFIED SAVE - Skipping ${languageCode} - no valid data to save`);
                continue;
              }
              
              // CRITICAL: Title is required for project_translations table
              if (!newTitle || !newTitle.trim()) {
                console.warn(`Project service: UNIFIED SAVE - Skipping ${languageCode} - title is required but not provided`);
                continue;
              }
              
              const upsertData: any = {
                project_id: id,
                language_code: languageCode
              };
              
              // Only include fields that have actual values (not null/undefined)
              if (newTitle && newTitle.trim()) upsertData.title = newTitle.trim();
              if (newDescription && newDescription.trim()) upsertData.description = newDescription.trim();
              if (newChallenges && newChallenges.trim()) upsertData.challenges = newChallenges.trim();
              if (newSolutions && newSolutions.trim()) upsertData.solutions = newSolutions.trim();
              if (newResults && newResults.trim()) upsertData.results = newResults.trim();
              if (newLocation && newLocation.trim()) upsertData.location = newLocation.trim();
              if (newClient && newClient.trim()) upsertData.client = newClient.trim();
              
              // Only include new fields if schema supports them AND they have values
              if (hasNewSchema) {
                if (newCategory && newCategory.trim()) upsertData.category = newCategory.trim();
                if (newCompletionDate && newCompletionDate.trim()) upsertData.completion_date = newCompletionDate.trim();
                if (newProjectType && newProjectType.trim()) upsertData.project_type = newProjectType.trim();
                if (newProjectValue && newProjectValue.trim()) upsertData.project_value = newProjectValue.trim();
                if (newDuration && newDuration.trim()) upsertData.duration = newDuration.trim();
              }
              
              console.log(`Project service: UNIFIED SAVE - Upsert data for ${languageCode}:`, upsertData);
              
              const { error: translationError } = await supabase
                .from('project_translations')
                .upsert(upsertData, {
                  onConflict: 'project_id,language_code'
                });

              if (translationError) {
                console.error(`Project service: UNIFIED SAVE - Error updating ${languageCode}:`, translationError);
                console.error(`Project service: UNIFIED SAVE - Error details:`, {
                  code: translationError.code,
                  message: translationError.message,
                  details: translationError.details,
                  hint: translationError.hint
                });
                
                // Check if this is a constraint violation FIRST (most common issue)
                if (translationError.code === '23502') {
                  console.error(`Project service: UNIFIED SAVE - Constraint violation for ${languageCode}. Upsert data:`, upsertData);
                  
                  // Check if title is missing (most common constraint violation)
                  if (!upsertData.title) {
                    throw new Error(`Cannot save translation for ${languageCode}: Title is required but was not provided. Please ensure the title field has a value.`);
                  }
                  
                  throw new Error(`Database constraint violation: ${translationError.message}. This usually means required fields are missing or null.`);
                }
                
                // Check if this is a schema-related error (less common)
                if (translationError.code === '42703' || translationError.message?.includes('column') || translationError.message?.includes('does not exist')) {
                  throw new Error(`Database schema not ready for new multilingual fields. Please run UPDATE_PROJECTS_MULTILINGUAL.sql in Supabase first. Error: ${translationError.message}`);
                }
                
                throw translationError;
              }
              console.log(`Project service: UNIFIED SAVE - Successfully updated ${languageCode}`);
            } catch (error) {
              console.error(`Project service: UNIFIED SAVE - Exception updating ${languageCode}:`, error);
              throw error;
            }
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
      if (titles?.['en'] || descriptions?.['en'] || challenges_multilingual?.['en'] || solutions_multilingual?.['en'] || results_multilingual?.['en'] || locations_multilingual?.['en'] || clients_multilingual?.['en'] || categories_multilingual?.['en'] || completion_dates_multilingual?.['en'] || project_types_multilingual?.['en'] || project_values_multilingual?.['en'] || durations_multilingual?.['en']) {
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
        if (categories_multilingual?.['en']) {
          baseUpdates.category = categories_multilingual['en'].trim();
        }
        if (completion_dates_multilingual?.['en']) {
          baseUpdates.completion_date = completion_dates_multilingual['en'].trim();
        }
        if (project_types_multilingual?.['en']) {
          baseUpdates.project_type = project_types_multilingual['en'].trim();
        }
        if (project_values_multilingual?.['en']) {
          baseUpdates.project_value = project_values_multilingual['en'].trim();
        }
        if (durations_multilingual?.['en']) {
          baseUpdates.duration = durations_multilingual['en'].trim();
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
      if (projectData.titles || projectData.descriptions || projectData.challenges_multilingual || projectData.solutions_multilingual || projectData.results_multilingual || projectData.locations_multilingual || projectData.clients_multilingual || projectData.categories_multilingual || projectData.completion_dates_multilingual || projectData.project_types_multilingual || projectData.project_values_multilingual || projectData.durations_multilingual) {
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