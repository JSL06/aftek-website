import { useState, useEffect } from 'react';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectFilter, { ProjectFilters } from '@/components/ProjectFilter';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import { useTranslation } from '@/hooks/useTranslation';

const Projects = () => {
  const { t } = useTranslation();
  const { projects, loading } = useProjects();
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

  // Update filtered projects when projects or filters change
  useEffect(() => {
    if (!projects) return;

    let filtered = [...projects];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.client.toLowerCase().includes(searchLower) ||
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
  };

  const closeGallery = () => {
    setShowGallery(false);
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject?.gallery && currentImageIndex < selectedProject.gallery.length - 1) {
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
    if (project.gallery && project.gallery.length > 0) {
      images.push(...project.gallery);
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
          <div className="space-y-4">
            {currentProjects.map((project) => (
                                                                           <button
                  key={project.id}
                  onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                  className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden text-left"
                >
                 {/* Project Card with Full Left Image */}
                                   <div className="flex h-48">
                    {/* Left: Full Height Project Image Gallery */}
                    <div className="w-1/3 flex-shrink-0 relative overflow-hidden">
                      {(() => {
                        // Get images from gallery_images or create mock images for demonstration
                        const images = project.gallery_images && project.gallery_images.length > 0 
                          ? project.gallery_images 
                          : project.image 
                            ? [project.image] 
                            : [bgMain, bgTitle]; // Fallback to mock images
                        
                        return (
                          <div className="w-full h-full">
                            <img
                              src={images[0]}
                              alt={project.title || "Project"}
                              className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <div className="text-xs font-medium">+{images.length - 1} more</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                                                           {/* Right: Project Info */}
                   <div className="flex-1 px-8 py-4 flex justify-between">
                     {/* Project Info */}
                     <div className="flex-1 min-w-0 pt-4">
                       {/* Project Title */}
                       <h3 className="text-2xl font-bold text-gray-900 mb-3">
                         {project.title || "eng"}
                       </h3>
                       
                       {/* Description */}
                       <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                         {project.description}
                       </p>
                       
                       {/* Categories */}
                       <div className="flex flex-wrap gap-1">
                         {project.categories && project.categories.length > 0 ? (
                           project.categories.map((category, index) => (
                             <span
                               key={index}
                               className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium"
                             >
                               {category}
                             </span>
                           ))
                         ) : (
                           <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium">
                             No categories
                           </span>
                         )}
                       </div>
                       
                       {/* Gallery Controls */}
                       {(() => {
                         // Get images from gallery_images or create mock images for demonstration
                         const images = project.gallery_images && project.gallery_images.length > 0 
                           ? project.gallery_images 
                           : project.image 
                             ? [project.image] 
                             : [bgMain, bgTitle]; // Fallback to mock images
                         
                         // Only show controls if there are multiple images
                         return images.length > 1 ? (
                           <div className="mt-4 flex items-center">
                             <div className="flex space-x-1">
                               {images.map((_, index) => (
                                 <button
                                   key={index}
                                   className="w-12 h-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-200"
                                   aria-label={`Go to image ${index + 1}`}
                                   onClick={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     // TODO: Implement image switching logic
                                     console.log(`Switch to image ${index}`);
                                   }}
                                 />
                               ))}
                             </div>
                           </div>
                         ) : null;
                       })()}
                     </div>

                     {/* Date Display */}
                     <div className="text-right ml-4 flex items-center">
                       <div className="text-lg font-semibold text-gray-900">
                         {(() => {
                           try {
                             if (project.completion_date) {
                               const date = new Date(project.completion_date);
                               if (!isNaN(date.getTime())) {
                                 return date.toISOString().split('T')[0];
                               }
                             }
                             return 'yyyy-mm-dd';
                           } catch (error) {
                             return 'yyyy-mm-dd';
                           }
                         })()}
                       </div>
                     </div>
                   </div>
                 </div>
               </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <Dialog open={showGallery} onOpenChange={closeGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedProject.title} - Gallery</span>
                  <Button variant="ghost" size="sm" onClick={closeGallery}>
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              {(() => {
                const images = getProjectImages(selectedProject);
                return (
                  <div className="space-y-4">
                    {/* Main Image Display */}
                    {images.length > 0 && (
                      <div className="relative">
                        <img
                          src={images[currentImageIndex]}
                          alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-96 object-cover rounded-lg"
                        />
                        
                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={prevImage}
                              disabled={currentImageIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={nextImage}
                              disabled={currentImageIndex === images.length - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        {images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        )}
                      </div>
                    )}
                    
                                         {/* Project Details */}
                     <div className="space-y-4">
                       {/* Description */}
                       <div>
                         <p className="font-medium mb-2">Description:</p>
                         <p className="text-muted-foreground">{selectedProject.description}</p>
                       </div>
                       
                       {/* Project Information Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Left Column */}
                         <div className="space-y-3">
                           <div>
                             <p className="font-medium mb-1 text-sm">Client:</p>
                             <p className="text-muted-foreground text-sm">{selectedProject.client || "eng"}</p>
                           </div>
                           
                           <div>
                             <p className="font-medium mb-1 text-sm">Duration:</p>
                             <p className="text-muted-foreground text-sm">{selectedProject.duration || "eng"}</p>
                           </div>
                           
                                                       <div>
                              <p className="font-medium mb-1 text-sm">Completion Date:</p>
                              <Input
                                type="date"
                                className="text-sm"
                                defaultValue={(() => {
                                  try {
                                    if (selectedProject.completion_date) {
                                      const date = new Date(selectedProject.completion_date);
                                      if (!isNaN(date.getTime())) {
                                        return date.toISOString().split('T')[0];
                                      }
                                    }
                                    return '';
                                  } catch (error) {
                                    return '';
                                  }
                                })()}
                                onChange={(e) => {
                                  // Handle date change here if you want to save it
                                  console.log('Date changed:', e.target.value);
                                }}
                              />
                            </div>
                         </div>
                         
                         {/* Right Column */}
                         <div className="space-y-3">
                           {selectedProject.products_used && selectedProject.products_used.length > 0 && (
                             <div>
                               <p className="font-medium mb-2 text-sm">Products Used:</p>
                               <div className="flex flex-wrap gap-1">
                                 {selectedProject.products_used.map((product, index) => (
                                   <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                     {product}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}
                           
                           {selectedProject.features && selectedProject.features.length > 0 && (
                             <div>
                               <p className="font-medium mb-2 text-sm">Features:</p>
                               <div className="flex flex-wrap gap-1">
                                 {selectedProject.features.map((feature, index) => (
                                   <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                     {feature}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                    
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden ${
                              currentImageIndex === index ? "border-red-500" : "border-gray-300"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
