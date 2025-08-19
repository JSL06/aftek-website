import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  ExternalLink, 
  FileText,
  Star,
  Package,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Project } from '@/services/projectService';
import { projectService } from '@/services/projectService';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const projectData = await projectService.getProjectBySlug(slug);
        if (projectData) {
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [slug]);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  const nextImage = () => {
    if (project?.gallery) {
      setCurrentImageIndex((prev) => 
        prev === project.gallery!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project?.gallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.gallery!.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The project you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline">{project.category}</Badge>
                {project.showInFeatured && (
                  <Badge className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{project.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {project.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                )}
                {project.completion_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {project.completion_date}</span>
                  </div>
                )}
                {project.client && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Client: {project.client}</span>
                  </div>
                )}
                {project.project_value && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Value: {project.project_value}</span>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Duration: {project.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {project.image && project.image !== '/placeholder.svg' ? (
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => handleImageClick(0)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Project Description */}
            {project.description && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Project Overview</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {project.description}
                </div>
              </div>
            )}

            {/* Challenges, Solutions, Results */}
            {project.challenges && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Challenges</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {project.challenges}
                </div>
              </div>
            )}

            {project.solutions && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Solutions</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {project.solutions}
                </div>
              </div>
            )}

            {project.results && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Results</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {project.results}
                </div>
              </div>
            )}

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-primary text-lg mt-0.5">•</span>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Used */}
            {project.products_used && project.products_used.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Products Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.products_used.map((product, index) => (
                    <Badge key={index} variant="secondary">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Project Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.gallery.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => handleImageClick(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.project_type && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Type:</span>
                    <p className="text-foreground">{project.project_type}</p>
                  </div>
                )}
                {project.testimonial && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Client Testimonial:</span>
                    <p className="text-foreground italic">"{project.testimonial}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {project.case_study_pdf && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(project.case_study_pdf, '_blank')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Case Study
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`mailto:info@aftek.com?subject=Inquiry about ${project.title}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && project?.gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-4xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="relative">
              <img
                src={project.gallery[currentImageIndex]}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {project.gallery.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                    {currentImageIndex + 1} / {project.gallery.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
