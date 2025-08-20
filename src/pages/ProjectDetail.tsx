import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, Star, Clock, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Project {
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
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, currentLanguage]);

    const loadProject = async () => {
      try {
        setLoading(true);
      
      // Fetch project data
      const { data: projectData, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_translations (
            language_code,
            title,
            description,
            challenges,
            solutions,
            results,
            location,
            category,
            client,
            completion_date,
            project_type,
            project_value,
            duration
          )
        `)
        .eq('id', projectId)
        .eq('isActive', true)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        return;
      }

        if (projectData) {
        // Transform the data to include multilingual fields
        const transformedProject: Project = {
          ...projectData,
          titles: {},
          descriptions: {},
          challenges_multilingual: {},
          solutions_multilingual: {},
          results_multilingual: {},
          locations_multilingual: {},
          categories_multilingual: {},
          clients_multilingual: {},
          completion_dates_multilingual: {},
          project_types_multilingual: {},
          project_values_multilingual: {},
          durations_multilingual: {}
        };

        // Extract multilingual data
        if (projectData.project_translations) {
          projectData.project_translations.forEach((translation: any) => {
            const langCode = translation.language_code;
            if (translation.title) transformedProject.titles![langCode] = translation.title;
            if (translation.description) transformedProject.descriptions![langCode] = translation.description;
            if (translation.challenges) transformedProject.challenges_multilingual![langCode] = translation.challenges;
            if (translation.solutions) transformedProject.solutions_multilingual![langCode] = translation.solutions;
            if (translation.results) transformedProject.results_multilingual![langCode] = translation.results;
            if (translation.location) transformedProject.locations_multilingual![langCode] = translation.location;
            if (translation.category) transformedProject.categories_multilingual![langCode] = translation.category;
            if (translation.client) transformedProject.clients_multilingual![langCode] = translation.client;
            if (translation.completion_date) transformedProject.completion_dates_multilingual![langCode] = translation.completion_date;
            if (translation.project_type) transformedProject.project_types_multilingual![langCode] = translation.project_type;
            if (translation.project_value) transformedProject.project_values_multilingual![langCode] = translation.project_value;
            if (translation.duration) transformedProject.durations_multilingual![langCode] = translation.duration;
          });
        }

        // Parse gallery images if they exist
        if (projectData.gallery_images && Array.isArray(projectData.gallery_images)) {
          transformedProject.gallery_images = projectData.gallery_images;
        } else {
          transformedProject.gallery_images = [];
        }

        setProject(transformedProject);
        }
    } catch (error) {
      console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

  const getLocalizedText = (field: keyof Project, fallback: string = '') => {
    if (!project) return fallback;
    
    const multilingualField = `${field}_multilingual` as keyof Project;
    const multilingualData = project[multilingualField] as Record<string, string> | undefined;
    
    if (multilingualData && multilingualData[currentLanguage]) {
      return multilingualData[currentLanguage];
    }
    
    // Fallback to main field
    return project[field] as string || fallback;
  };

  const getLocalizedTitle = () => {
    if (!project) return '';
    return project.titles?.[currentLanguage] || project.title || '';
  };

  const getLocalizedDescription = () => {
    if (!project) return '';
    return project.descriptions?.[currentLanguage] || project.description || '';
  };

  const openGallery = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setGalleryIndex(index);
  };

  const closeGallery = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (project?.gallery_images) {
      const nextIndex = (galleryIndex + 1) % project.gallery_images.length;
      setGalleryIndex(nextIndex);
      setSelectedImage(project.gallery_images[nextIndex]);
    }
  };

  const prevImage = () => {
    if (project?.gallery_images) {
      const prevIndex = galleryIndex === 0 ? project.gallery_images.length - 1 : galleryIndex - 1;
      setGalleryIndex(prevIndex);
      setSelectedImage(project.gallery_images[prevIndex]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Project Not Found</h2>
              <p className="text-red-600 mb-4">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/projects">
              <Button variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
            </Link>
                {project.showInFeatured && (
              <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                Featured Project
                  </Badge>
                )}
              </div>
          <h1 className="text-4xl font-bold mb-2">{getLocalizedTitle()}</h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl">
            {getLocalizedDescription()}
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Images */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Project Gallery</h2>
                
                {/* Main Image */}
                <div className="mb-4">
                  <img
                    src={project.image || project.gallery_images?.[0] || '/placeholder-project.jpg'}
                    alt={getLocalizedTitle()}
                    className="w-full h-80 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(project.image || project.gallery_images?.[0] || '', 0)}
                  />
                </div>

                {/* Thumbnail Gallery */}
                {project.gallery_images && project.gallery_images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {project.gallery_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${getLocalizedTitle()} - Image ${index + 1}`}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openGallery(image, index)}
                      />
                    ))}
                </div>
              )}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{getLocalizedText('location', project.location)}</p>
                      </div>
            </div>

                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                        <p className="text-sm text-muted-foreground">Client</p>
                        <p className="font-medium">{getLocalizedText('client', project.client)}</p>
                </div>
              </div>

                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{getLocalizedText('category', project.category)}</p>
                      </div>
                </div>
              </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                        <p className="text-sm text-muted-foreground">Completion Date</p>
                        <p className="font-medium">{getLocalizedText('completion_date', project.completion_date)}</p>
                </div>
              </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{getLocalizedText('duration', project.duration)}</p>
                </div>
              </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                        <p className="text-sm text-muted-foreground">Project Value</p>
                        <p className="font-medium">{getLocalizedText('project_value', project.project_value)}</p>
                      </div>
                    </div>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Story */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Project Story</h2>
                
                <div className="space-y-6">
                  {getLocalizedText('challenges', project.challenges) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-orange-600">Challenges</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {getLocalizedText('challenges', project.challenges)}
                      </p>
              </div>
            )}

                  {getLocalizedText('solutions', project.solutions) && (
              <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">Solutions</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {getLocalizedText('solutions', project.solutions)}
                      </p>
              </div>
            )}

                  {getLocalizedText('results', project.results) && (
              <div>
                      <h3 className="text-lg font-semibold mb-2 text-green-600">Results</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {getLocalizedText('results', project.results)}
                      </p>
              </div>
            )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Type */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Project Type</h3>
                <p className="text-muted-foreground">
                  {getLocalizedText('project_type', project.project_type)}
                </p>
              </CardContent>
            </Card>

            {/* Features & Technologies */}
            {project.features && project.features.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Features & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Used */}
            {project.products_used && project.products_used.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Products Used</h3>
                  <div className="space-y-2">
                    {project.products_used.map((product, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {product}
                      </div>
                    ))}
            </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
            >
              ×
            </button>
            
            <img
              src={selectedImage}
              alt={getLocalizedTitle()}
              className="max-w-full max-h-full object-contain"
            />
            
            {project.gallery_images && project.gallery_images.length > 1 && (
              <>
                <button
                    onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl z-10"
                >
                  ‹
                </button>
                <button
                    onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl z-10"
                  >
                  ›
                </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {galleryIndex + 1} of {project.gallery_images.length}
                  </div>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
