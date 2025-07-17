import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilter, { ProjectFilters } from '@/components/ProjectFilter';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useTranslation } from '@/hooks/useTranslation';

const Projects = () => {
  const { t } = useTranslation();
  const { projects, loading } = useProjects();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>({ 
    search: '', 
    category: [], 
    features: [], 
    completionYear: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const PROJECTS_PER_PAGE = 6;

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [projects, filters]);

  // Handle pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

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

  const handleViewCaseStudy = (project: Project) => {
    // Handle case study view - could open PDF or navigate to case study page
    if (project.case_study_pdf) {
      window.open(project.case_study_pdf, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      <div className="container mx-auto p-8">
          <div className="flex flex-col items-center mb-12">
            <h1 className="uniform-page-title">{t('projects.title') || 'Projects'}</h1>
          </div>

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

          {/* Projects Grid */}
          {!loading && currentProjects.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewGallery={handleViewGallery}
                    onViewCaseStudy={handleViewCaseStudy}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Description:</p>
                        <p className="text-muted-foreground">{selectedProject.description}</p>
                      </div>
                      
                      {selectedProject.products_used && selectedProject.products_used.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Products Used:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedProject.products_used.map((product, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            className={cn(
                              "flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden",
                              currentImageIndex === index ? "border-primary" : "border-muted"
                            )}
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