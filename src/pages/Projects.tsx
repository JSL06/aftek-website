import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'construction', label: 'Construction' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'infrastructure', label: 'Infrastructure' }
  ];

  const projects = [
    {
      title: '[PROJECT_1_TITLE_PLACEHOLDER] Taipei Metro Extension',
      location: 'Taipei, Taiwan',
      year: '2023',
      category: 'infrastructure',
      description: '[PROJECT_1_DESC_PLACEHOLDER] Waterproofing and sealant solutions for subway tunnel construction.',
      gallery: '[PROJECT_1_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_1_CASE_STUDY_PDF_PLACEHOLDER]'
    },
    {
      title: '[PROJECT_2_TITLE_PLACEHOLDER] Industrial Complex Renovation',
      location: 'Kaohsiung, Taiwan',
      year: '2023',
      category: 'industrial',
      description: '[PROJECT_2_DESC_PLACEHOLDER] Structural repair and protective coating applications.',
      gallery: '[PROJECT_2_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_2_CASE_STUDY_PDF_PLACEHOLDER]'
    },
    {
      title: '[PROJECT_3_TITLE_PLACEHOLDER] Shopping Mall Construction',
      location: 'Taichung, Taiwan',
      year: '2022',
      category: 'construction',
      description: '[PROJECT_3_DESC_PLACEHOLDER] Flooring systems and architectural sealants installation.',
      gallery: '[PROJECT_3_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_3_CASE_STUDY_PDF_PLACEHOLDER]'
    },
    {
      title: '[PROJECT_4_TITLE_PLACEHOLDER] Semiconductor Facility',
      location: 'Hsinchu, Taiwan',
      year: '2022',
      category: 'manufacturing',
      description: '[PROJECT_4_DESC_PLACEHOLDER] Cleanroom flooring and specialized sealant solutions.',
      gallery: '[PROJECT_4_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_4_CASE_STUDY_PDF_PLACEHOLDER]'
    },
    {
      title: '[PROJECT_5_TITLE_PLACEHOLDER] Hospital Renovation',
      location: 'Tainan, Taiwan',
      year: '2021',
      category: 'construction',
      description: '[PROJECT_5_DESC_PLACEHOLDER] Medical-grade flooring and antimicrobial coatings.',
      gallery: '[PROJECT_5_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_5_CASE_STUDY_PDF_PLACEHOLDER]'
    },
    {
      title: '[PROJECT_6_TITLE_PLACEHOLDER] Power Plant Maintenance',
      location: 'New Taipei, Taiwan',
      year: '2021',
      category: 'industrial',
      description: '[PROJECT_6_DESC_PLACEHOLDER] High-temperature resistant coatings and structural repair.',
      gallery: '[PROJECT_6_GALLERY_PLACEHOLDER]',
      caseStudy: '[PROJECT_6_CASE_STUDY_PDF_PLACEHOLDER]'
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  const clearFilters = () => {
    setActiveFilter('all');
  };

  const hasActiveFilters = activeFilter !== 'all';

  return (
    <div className="min-h-screen pt-16">
      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-6">
          <nav className="text-sm text-muted-foreground">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-foreground">Projects</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-20">
        <div className="container mx-auto px-6 mb-24">
          <div className="text-center mb-16">
            <div className="title-container">
              <h1 className="uniform-page-title">Projects</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              [PROJECTS_INTRO_PLACEHOLDER] Explore our portfolio of successful projects across various industries, showcasing our expertise in construction materials and engineering solutions.
            </p>
          </div>

          {/* Filter Section */}
          <FilterSection
            title="Filter Projects"
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          >
            <FilterCategory title="Project Categories">
              {filters.map((filter) => (
                <FilterButton
                  key={filter.id}
                  label={filter.label}
                  isSelected={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                />
              ))}
            </FilterCategory>
          </FilterSection>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Project Image Placeholder */}
                  <div className="h-64 bg-muted rounded-t-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <span className="text-muted-foreground text-sm font-medium">
                      {project.gallery}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full capitalize">
                        {project.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project.year}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      📍 {project.location}
                    </p>
                    
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Gallery
                      </Button>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                        Case Study PDF
                        <span className="ml-1 text-xs">📄</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Project Statistics */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Project Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">200+</div>
              <div className="text-primary-foreground/80">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">39</div>
              <div className="text-primary-foreground/80">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Industry Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">99%</div>
              <div className="text-primary-foreground/80">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;