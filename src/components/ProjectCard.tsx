import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Building2, ExternalLink, FileText } from 'lucide-react';
import { Project } from '@/services/projectService';
import { useTranslation } from '@/hooks/useTranslation';

interface ProjectCardProps {
  project: Project;
  onViewGallery?: (project: Project) => void;
  onViewCaseStudy?: (project: Project) => void;
  className?: string;
}

const ProjectCard = ({ project, onViewGallery, onViewCaseStudy, className = '' }: ProjectCardProps) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleViewGallery = () => {
    if (onViewGallery) {
      onViewGallery(project);
    }
  };

  const handleViewCaseStudy = () => {
    if (onViewCaseStudy) {
      onViewCaseStudy(project);
    }
  };

  // Mapping of category values to translation keys
  const categoryTranslationMap: Record<string, string> = {
    'Infrastructure': 'projectCategory.infrastructure',
    'Industrial': 'projectCategory.industrial',
    'High-Tech': 'projectCategory.highTech',
    'Commercial': 'projectCategory.commercial',
    'Residential': 'projectCategory.residential',
    'Healthcare': 'projectCategory.healthcare',
    'Education': 'projectCategory.education',
    'Transportation': 'projectCategory.transportation',
    'Energy': 'projectCategory.energy',
    'Water Treatment': 'projectCategory.waterTreatment',
    'Manufacturing': 'projectCategory.manufacturing',
    'General': 'projectCategory.general',
  };

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${className}`}>
      <CardContent className="p-0">
        {/* Project Image */}
        <div className="relative h-64 bg-muted rounded-t-lg overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse flex space-x-4 w-full h-full items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted group-hover:bg-muted/80 transition-colors">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <span className="text-muted-foreground text-sm font-medium">
                  Project Image
                </span>
              </div>
            </div>
          ) : (
            <img
              src={project.image || '/placeholder.svg'}
              alt={project.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {(() => {
                const translated = t(categoryTranslationMap[project.category]);
                return translated === categoryTranslationMap[project.category] ? project.category : translated;
              })()}
            </Badge>
          </div>
          
          {/* Featured Badge */}
          {project.showInFeatured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary/90 backdrop-blur-sm">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {/* Project Meta Information */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {project.completion_date}
            </div>
            {project.project_value && (
              <div className="text-sm font-medium text-primary">
                {project.project_value}
              </div>
            )}
          </div>
          
          {/* Project Title */}
          <h3 className="text-xl font-semibold text-foreground mb-3">
            {project.title}
          </h3>
          
          {/* Location and Client */}
          <div className="flex flex-col gap-2 mb-4">
            {project.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            )}
            {project.client && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{project.client}</span>
              </div>
            )}
          </div>
          
          {/* Project Description */}
          {project.description && (
            <p className="text-muted-foreground mb-5 text-sm leading-relaxed line-clamp-3">
              {project.description}
            </p>
          )}
          
          {/* Features/Technologies */}
          {project.features && project.features.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
              <div className="flex flex-wrap gap-2">
                {project.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {project.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Products Used */}
          {project.products_used && project.products_used.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Products Used:</p>
              <div className="flex flex-wrap gap-2">
                {project.products_used.slice(0, 2).map((product, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {product}
                  </Badge>
                ))}
                {project.products_used.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.products_used.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Duration */}
          {project.duration && (
            <div className="text-xs text-muted-foreground mb-5">
              Duration: {project.duration}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleViewGallery}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Gallery
            </Button>
            {project.case_study_pdf && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={handleViewCaseStudy}
              >
                <FileText className="h-4 w-4 mr-2" />
                Case Study
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 