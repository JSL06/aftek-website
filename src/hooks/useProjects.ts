import { useState, useEffect } from 'react';
import { projectService, Project } from '@/services/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getWebsiteProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch
  };
};

export const useAdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAdminProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching admin projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async (projectData: Partial<Project>) => {
    try {
      const newProject = await projectService.addProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(project => 
          project.id === id ? updatedProject : project
        ));
      }
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const success = await projectService.deleteProject(id);
      if (success) {
        setProjects(prev => prev.filter(project => project.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetch
  };
}; 