import { useState, useEffect } from 'react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectFilter, { ProjectFilters } from '@/components/ProjectFilter';
import { useProjects } from '@/hooks/useProjects';
import { useCategories } from '@/hooks/useCategories';
import { Project } from '@/services/projectService';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const { categories } = useCategories(currentLanguage);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Projects page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const [filters, setFilters] = useState<ProjectFilters>({ 
    search: '', 
    category: [], 
    features: [], 
    completionYear: []
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedImageCaptions, setEditedImageCaptions] = useState<string[]>([]);
  const [editedImageDescriptions, setEditedImageDescriptions] = useState<string[]>([]);

  // Update filtered projects when projects or filters change
  useEffect(() => {
    if (!projects) return;

    let filtered = [...projects];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        (project.titles?.[currentLanguage] || project.title).toLowerCase().includes(searchLower) ||
        (project.descriptions?.[currentLanguage] || project.description).toLowerCase().includes(searchLower) ||
        (project.locations_multilingual?.[currentLanguage] || project.location).toLowerCase().includes(searchLower) ||
        (project.clients_multilingual?.[currentLanguage] || project.client).toLowerCase().includes(searchLower) ||
        project.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(project =>
                        filters.category.includes(project.category)
      );
    }

    // Apply completion year filter
    if (filters.completionYear.length > 0) {
      filtered = filtered.filter(project =>
        filters.completionYear.includes(project.completion_date)
      );
    }

    // Apply features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(project =>
        filters.features.some(filterFeature =>
          project.features.some(projectFeature =>
            projectFeature.toLowerCase().includes(filterFeature.toLowerCase())
          )
        )
      );
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  // Use all filtered projects since we're showing them in detail view
  const currentProjects = filteredProjects;

  const handleViewGallery = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setShowGallery(true);
    setIsEditing(false);
    setEditedDescription(project.description || '');
    setEditedImageCaptions(new Array(getProjectImages(project).length).fill(''));
    setEditedImageDescriptions(new Array(getProjectImages(project).length).fill(''));
  };

  const closeGallery = () => {
    setShowGallery(false);
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject?.gallery_images && currentImageIndex < selectedProject.gallery_images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Get all project images (main image + gallery)
  const getProjectImages = (project: Project): string[] => {
    const images: string[] = [];
    if (project.image) images.push(project.image);
    if (project.gallery_images && project.gallery_images.length > 0) {
      images.push(...project.gallery_images);
    }
    return images;
  };

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: `url(${bgMain})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      {/* Title Section with Special Background */}
      <div 
        className="relative py-16 mb-12"
        style={{
          backgroundImage: `url(${bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {t('projects.title') || 'Projects'}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Filter Section */}
        {projects && projects.length > 0 && (
          <ProjectFilter
            projects={projects}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {/* Divider between filters and projects */}
        {projects && projects.length > 0 && (
          <div className="border-t border-slate-200 my-8"></div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading projects...</p>
          </div>
        )}

        {/* No Projects State */}
        {!loading && filteredProjects.length === 0 && projects && projects.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects match your current filters.</p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: '', category: [], features: [], completionYear: [] })}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects available at the moment.</p>
          </div>
        )}

        {/* Flat Project Layout - Essential Info Only */}
        {!loading && currentProjects.length > 0 && (
          <div className="space-y-8">
            {currentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="w-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer overflow-hidden border border-slate-200"
              >
                {/* Project Card with Larger Image */}
                <div className="flex flex-col lg:flex-row h-auto">
                  {/* Left: Large Project Image Gallery */}
                  <div className="w-full lg:w-2/5 flex-shrink-0 relative overflow-hidden">
                    <div className="aspect-[4/3] lg:h-80">
                      {(() => {
                        // Get images from gallery or create mock images for demonstration
                        const images = project.gallery_images && project.gallery_images.length > 0 
                          ? project.gallery_images 
                          : project.image 
                            ? [project.image] 
                            : [bgMain, bgTitle]; // Fallback to mock images
                        
                        return (
                          <div className="w-full h-full relative group">
                            <img
                              src={images[0]}
                              alt={project.title || "Project"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {images.length > 1 && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="text-center text-white">
                                  <div className="text-lg font-medium">+{images.length - 1} more images</div>
                                  <div className="text-sm opacity-90">Click to view gallery</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Image Counter Badge */}
                            {images.length > 1 && (
                              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {images.length} images
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right: Project Info */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                    {/* Project Info */}
                    <div className="space-y-6">
                      {/* Project Title */}
                      <div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-3">
                          {project.titles?.[currentLanguage] || project.title || "eng"}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                          {project.descriptions?.[currentLanguage] || project.description}
                        </p>
                      </div>
                      
                      {/* Categories */}
                      <div className="flex flex-wrap gap-2">
                        {project.category ? (
                          <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-200">
                            {(() => {
                              // Try to get localized category name
                              if (categories.length > 0) {
                                const centralizedCategory = categories.find(cat => cat.name === project.category);
                                if (centralizedCategory) {
                                  return centralizedCategory.names?.[currentLanguage] || centralizedCategory.names?.['en'] || centralizedCategory.name;
                                }
                              }
                              // Fallback to original category name
                              return project.category;
                            })()}
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-sm font-medium border border-red-200">
                            {t('projects.noCategory')}
                          </span>
                        )}
                      </div>
                      
                      {/* Project Meta Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200">
                        <div>
                          <div className="text-sm text-slate-500 mb-1 font-medium">{t('projects.client')}</div>
                          <div className="font-semibold text-slate-900">{project.clients_multilingual?.[currentLanguage] || project.client || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1 font-medium">{t('projects.location')}</div>
                          <div className="font-semibold text-slate-900">{project.locations_multilingual?.[currentLanguage] || project.location || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1 font-medium">{t('projects.duration')}</div>
                          <div className="font-semibold text-slate-900">{project.durations_multilingual?.[currentLanguage] || project.duration || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1 font-medium">{t('projects.completion')}</div>
                          <div className="font-semibold text-slate-900">
                            {(() => {
                              try {
                                if (project.completion_dates_multilingual?.[currentLanguage]) {
                                  return project.completion_dates_multilingual[currentLanguage];
                                }
                                if (project.completion_date) {
                                  const date = new Date(project.completion_date);
                                  if (!isNaN(date.getTime())) {
                                    return date.getFullYear().toString();
                                  }
                                }
                                return 'N/A';
                              } catch (error) {
                                return 'N/A';
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        {/* Gallery Indicators */}
                        {(() => {
                          const images = project.gallery_images && project.gallery_images.length > 0 
                            ? project.gallery_images 
                            : project.image 
                              ? [project.image] 
                              : [bgMain, bgTitle];
                          
                          return images.length > 1 ? (
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-slate-500">Gallery:</div>
                              <div className="flex space-x-1">
                                {images.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                      index === 0 ? 'bg-red-500' : 'bg-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}
                        
                        {/* View Project Button */}
                        <div className="text-right">
                          <div className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors">
                            <span>View Project</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Self-Scrolling Gallery Modal */}
      {showGallery && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Gallery Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                <p className="text-white/80 text-sm">{selectedProject.client} • {selectedProject.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-white hover:bg-white/20 ${isEditing ? 'bg-white/20' : ''}`}
                >
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeGallery}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="h-full flex">
            {/* Left: Image Gallery */}
            <div className="flex-1 relative overflow-hidden">
              {(() => {
                const images = getProjectImages(selectedProject);
                return (
                  <div className="h-full relative">
                    {/* Main Image */}
                    <img
                      src={images[currentImageIndex]}
                      alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Caption Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="text-white">
                        <h3 className="text-lg font-semibold mb-2">
                          {editedImageCaptions[currentImageIndex] || `Image ${currentImageIndex + 1}`}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {editedImageDescriptions[currentImageIndex] || 'Click to add description'}
                        </p>
                        {isEditing && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Image caption"
                              value={editedImageCaptions[currentImageIndex] || ''}
                              onChange={(e) => {
                                const newCaptions = [...editedImageCaptions];
                                newCaptions[currentImageIndex] = e.target.value;
                                setEditedImageCaptions(newCaptions);
                              }}
                              className="bg-white/20 text-white placeholder-white/70 border-white/30"
                            />
                            <Input
                              placeholder="Image description"
                              value={editedImageDescriptions[currentImageIndex] || ''}
                              onChange={(e) => {
                                const newDescriptions = [...editedImageDescriptions];
                                newDescriptions[currentImageIndex] = e.target.value;
                                setEditedImageDescriptions(newDescriptions);
                              }}
                              className="bg-white/20 text-white placeholder-white/70 border-white/30"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={prevImage}
                          disabled={currentImageIndex === 0}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={nextImage}
                          disabled={currentImageIndex === images.length - 1}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute top-20 right-4 bg-black/60 text-white px-3 py-2 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}

                    {/* Thumbnail Navigation */}
                    {images.length > 1 && (
                      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              currentImageIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right: Project Information Panel */}
            <div className="w-96 bg-white overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Project Overview */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Overview</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Client:</span>
                      <span className="ml-2 text-gray-600">{selectedProject.client || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-600">{selectedProject.location || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-600">{selectedProject.category || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Completion Date:</span>
                      <span className="ml-2 text-gray-600">
                        {selectedProject.completion_date || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="ml-2 text-gray-600">{selectedProject.duration || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          // Save changes
                          setIsEditing(false);
                          // Here you would typically save to the database
                          console.log('Saving description:', editedDescription);
                        } else {
                          // Start editing
                          setIsEditing(true);
                          setEditedDescription(selectedProject.description || '');
                        }
                      }}
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {isEditing ? (
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter project description..."
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        {editedDescription || selectedProject.description || 'No description available. Click Edit to add project description.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Description */}
                {selectedProject.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Description</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                          {selectedProject.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Details</h3>
                  <div className="space-y-3">
                    {selectedProject.features && selectedProject.features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Features & Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.features.map((feature, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedProject.products_used && selectedProject.products_used.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Products Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.products_used.map((product, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-scroll Controls */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery Controls</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Auto-scroll through images
                        const images = getProjectImages(selectedProject);
                        if (images.length > 1) {
                          const interval = setInterval(() => {
                            setCurrentImageIndex(prev => {
                              if (prev >= images.length - 1) {
                                clearInterval(interval);
                                return 0;
                              }
                              return prev + 1;
                            });
                          }, 3000); // Change image every 3 seconds
                          
                          // Store interval ID to clear it later
                          setTimeout(() => clearInterval(interval), images.length * 3000);
                        }
                      }}
                    >
                      Start Auto-Scroll
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
