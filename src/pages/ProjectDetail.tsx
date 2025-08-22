import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, Star, Clock, DollarSign, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { projectService } from '@/services/projectService';

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
  gallery: string[];
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
  features_multilingual?: Record<string, string[]>;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [categories, setCategories] = useState<{ id: string; name: string; display_name: string }[]>([]);
  const [features, setFeatures] = useState<{ id: string; feature_key: string; display_name: string; category: string }[]>([]);
  const [productsUsed, setProductsUsed] = useState<{ id: string; name: string; category: string }[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadCategories();
      loadFeatures();
    }
  }, [projectId, currentLanguage]);

  // Debug: Test translation keys
  useEffect(() => {
    console.log('Translation test:', {
      'projects.projectStory': t('projects.projectStory'),
      'projects.challenges': t('projects.challenges'),
      'projects.technicalDetails': t('projects.technicalDetails'),
      'projects.projectOverview': t('projects.projectOverview'),
      currentLanguage
    });
  }, [t, currentLanguage]);

  // Force re-render when language changes to update translations
  useEffect(() => {
    // This will trigger a re-render when currentLanguage changes
    console.log('Language changed to:', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (project && project.products_used && project.products_used.length > 0) {
      loadProductsUsed();
    }
  }, [project]);

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
            duration,
            features
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
          durations_multilingual: {},
          features_multilingual: {}
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
            if (translation.category) {
              transformedProject.categories_multilingual![langCode] = translation.category;
            }
            if (translation.client) transformedProject.clients_multilingual![langCode] = translation.client;
            if (translation.completion_date) transformedProject.completion_dates_multilingual![langCode] = translation.completion_date;
            if (translation.project_type) transformedProject.project_types_multilingual![langCode] = translation.project_type;
            if (translation.project_value) transformedProject.project_values_multilingual![langCode] = translation.project_value;
            if (translation.duration) transformedProject.durations_multilingual![langCode] = translation.duration;
            if (translation.features) {
              try {
                // Parse features if it's a JSON string, otherwise use as is
                const featuresData = typeof translation.features === 'string' 
                  ? JSON.parse(translation.features) 
                  : translation.features;
                transformedProject.features_multilingual![langCode] = Array.isArray(featuresData) ? featuresData : [];
              } catch (e) {
                console.warn('Failed to parse features for language:', langCode, e);
                transformedProject.features_multilingual![langCode] = [];
              }
            }
          });
        } else {
          // No project translations found
        }

        // Parse gallery images if they exist
        if (projectData.gallery && Array.isArray(projectData.gallery)) {
          transformedProject.gallery = projectData.gallery;
        } else {
          transformedProject.gallery = [];
        }

        setProject(transformedProject);
        }
    } catch (error) {
      console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

  const loadCategories = async () => {
    try {
      const categoriesData = await projectService.getCategories(currentLanguage);
      console.log('Categories loaded:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set empty array to trigger fallback translations
      setCategories([]);
    }
  };

  const loadFeatures = async () => {
    try {
      const featuresData = await projectService.getFeatures(currentLanguage);
      console.log('Features loaded:', featuresData);
      setFeatures(featuresData);
    } catch (error) {
      console.error('Error loading features:', error);
      // Set empty array to trigger fallback translations
      setFeatures([]);
    }
  };

  const loadProductsUsed = async () => {
    if (!project || !project.products_used) return;
    
    try {
      const productsData = await projectService.getProductsByIds(project.products_used);
      setProductsUsed(productsData);
    } catch (error) {
      console.error('Error loading products used:', error);
    }
  };

  const getLocalizedCategory = () => {
    if (!project) return '';
    
    console.log('getLocalizedCategory called:', {
      projectCategory: project.category,
      categories: categories,
      currentLanguage,
      categories_multilingual: project.categories_multilingual
    });
    
    // First try to get from centralized categories
    if (categories.length > 0) {
      const centralizedCategory = categories.find(cat => cat.name === project.category);
      if (centralizedCategory) {
        console.log('Found centralized category:', centralizedCategory);
        return centralizedCategory.display_name;
      }
    }
    
    // If no centralized categories loaded yet, try multilingual
    if (project.categories_multilingual?.[currentLanguage]) {
      console.log('Using multilingual category:', project.categories_multilingual[currentLanguage]);
      return project.categories_multilingual[currentLanguage];
    }
    
    // Final fallback: translate common category names manually
    const categoryTranslations: Record<string, Record<string, string>> = {
      'Sealant & Adhesive': {
        'en': 'Sealant & Adhesive',
        'zh-Hant': '密封膠與黏合劑',
        'zh-Hans': '密封胶与黏合剂',
        'ja': 'シーラント・接着剤',
        'ko': '실런트 및 접착제',
        'th': 'ซีแลนท์และกาวยาแนว',
        'vi': 'Chất bịt kín & Chất kết dính'
      },
      'Waterproofing': {
        'en': 'Waterproofing',
        'zh-Hant': '防水',
        'zh-Hans': '防水',
        'ja': '防水',
        'ko': '방수',
        'th': 'กันน้ำ',
        'vi': 'Chống thấm nước'
      },
      'Flooring': {
        'en': 'Flooring',
        'zh-Hant': '地板',
        'zh-Hans': '地板',
        'ja': '床材',
        'ko': '바닥재',
        'th': 'พื้น',
        'vi': 'Sàn'
      },
      'Redi-Mix G&M': {
        'en': 'Redi-Mix G&M',
        'zh-Hant': 'Redi-Mix G&M',
        'zh-Hans': 'Redi-Mix G&M',
        'ja': 'Redi-Mix G&M',
        'ko': 'Redi-Mix G&M',
        'th': 'Redi-Mix G&M',
        'vi': 'Redi-Mix G&M'
      },
      'Other Specialties': {
        'en': 'Other Specialties',
        'zh-Hant': '其他專業',
        'zh-Hans': '其他专业',
        'ja': 'その他の専門',
        'ko': '기타 전문',
        'th': 'ความเชี่ยวชาญอื่นๆ',
        'vi': 'Chuyên môn khác'
      }
    };
    
    const translation = categoryTranslations[project.category];
    if (translation && translation[currentLanguage]) {
      console.log('Using manual category translation:', translation[currentLanguage]);
      return translation[currentLanguage];
    }
    
    // Last resort: return the original category name
    console.log('No translation found, using original:', project.category);
    return project.category;
  };

  const getLocalizedFeatures = () => {
    if (!project) return [];
    
    // First try to get from centralized features
    if (features.length > 0 && project.features && project.features.length > 0) {
      const centralizedFeatures = project.features.map(featureKey => {
        const centralizedFeature = features.find(f => f.feature_key === featureKey);
        return centralizedFeature ? centralizedFeature.display_name : featureKey;
      });
      
      if (centralizedFeatures.length > 0) {
        console.log('Using centralized features:', centralizedFeatures);
        return centralizedFeatures;
      }
    }
    
    // If no centralized features loaded yet, try multilingual
    if (project.features_multilingual?.[currentLanguage]) {
      console.log('Using multilingual features:', project.features_multilingual[currentLanguage]);
      return project.features_multilingual[currentLanguage];
    }
    
    // Final fallback: translate common feature names manually
    const featureTranslations: Record<string, Record<string, string>> = {
      'Rapid Curing': {
        'en': 'Rapid Curing',
        'zh-Hant': '快速固化',
        'zh-Hans': '快速固化',
        'ja': '急速硬化',
        'ko': '급속 경화',
        'th': 'การแข็งตัวเร็ว',
        'vi': 'Đóng rắn nhanh'
      },
      'High Strength': {
        'en': 'High Strength',
        'zh-Hant': '高強度',
        'zh-Hans': '高强度',
        'ja': '高強度',
        'ko': '고강도',
        'th': 'ความแข็งแรงสูง',
        'vi': 'Cường độ cao'
      },
      'Waterproof': {
        'en': 'Waterproof',
        'zh-Hant': '防水',
        'zh-Hans': '防水',
        'ja': '防水',
        'ko': '방수',
        'th': 'กันน้ำ',
        'vi': 'Chống thấm nước'
      },
      'Chemical Resistant': {
        'en': 'Chemical Resistant',
        'zh-Hant': '耐化學性',
        'zh-Hans': '耐化学性',
        'ja': '耐薬品性',
        'ko': '화학 저항성',
        'th': 'ทนต่อสารเคมี',
        'vi': 'Chống hóa chất'
      },
      'Flexible': {
        'en': 'Flexible',
        'zh-Hant': '柔韌性',
        'zh-Hans': '柔韧性',
        'ja': '柔軟性',
        'ko': '유연성',
        'th': 'ความยืดหยุ่น',
        'vi': 'Linh hoạt'
      }
    };
    
    // Try to translate each feature
    if (project.features && project.features.length > 0) {
      const translatedFeatures = project.features.map(feature => {
        const translation = featureTranslations[feature];
        if (translation && translation[currentLanguage]) {
          return translation[currentLanguage];
        }
        return feature; // Return original if no translation found
      });
      
      console.log('Using manual feature translations:', translatedFeatures);
      return translatedFeatures;
    }
    
    // Last resort: return the original features
    return project.features || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h1>
          <Link to="/projects" className="text-red-600 hover:text-red-700 underline">
            Back to Projects
              </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Elegant Header */}
      <div className="relative bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link 
                to="/projects" 
                className="group flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{t('projects.backToProjects')}</span>
            </Link>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">
                {getLocalizedCategory()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">{t('projects.completion')}</div>
              <div className="text-lg font-semibold text-slate-900">
                {project.completion_date ? new Date(project.completion_date).getFullYear() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section with Main Image Background */}
        <div className="relative py-16 mb-12" style={{
          backgroundImage: `url(${project.image || '/placeholder.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 container mx-auto text-center">
            <h1 className="uniform-page-title text-white" style={{textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px'}}>
              {project.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Large Impactful Gallery */}
          <div className="space-y-8">
            {/* Gallery Section */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
              {/* Gallery Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Project Gallery</h3>
                  {(() => {
                    const images = project.gallery && project.gallery.length > 0 
                      ? project.gallery 
                      : [project.image]; // Use main image if no gallery
                    
                    return images.length > 1 ? (
                      <div className="text-sm text-slate-600">
                        {galleryIndex + 1} of {images.length} images
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Gallery Main Image */}
              <div className="relative aspect-[4/3] bg-slate-100">
                {(() => {
                  const images = project.gallery && project.gallery.length > 0 
                    ? project.gallery 
                    : [project.image]; // Use main image if no gallery
                  
                  return (
                    <>
                      <img
                        src={images[galleryIndex]}
                        alt={`${project.title} - Gallery Image ${galleryIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setGalleryIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 border border-slate-200"
                          >
                            <ChevronLeft className="h-7 w-7 text-slate-700" />
                          </button>
                          <button
                            onClick={() => setGalleryIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 border border-slate-200"
                          >
                            <ChevronRight className="h-7 w-7 text-slate-700" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter Badge */}
                      {images.length > 1 && (
                        <div className="absolute top-6 right-6 bg-black/80 text-white px-4 py-2 rounded-full text-lg font-semibold">
                          {galleryIndex + 1} / {images.length}
                </div>
              )}
                    </>
                  );
                })()}
              </div>
              
              {/* Dynamic Image Caption Section - Only shows if caption exists */}
              {(() => {
                // This would be where you'd get captions from the database
                // For now, showing placeholder captions that can be easily replaced
                const captions = [
                  "Main project overview showing the complete scope and scale of the waterproofing system",
                  "Detailed view of the technical implementation with close-up of sealant application",
                  "Close-up of key features and specifications demonstrating quality craftsmanship",
                  "Final result showcasing the completed work with before/after comparison",
                  "Technical specifications and material details for professional reference"
                ];
                
                const currentCaption = captions[galleryIndex];
                
                // Only show caption section if there's a caption
                return currentCaption ? (
                  <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="text-center">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-slate-700">Progress</span>
                          <span className="text-sm text-slate-500">
                            {galleryIndex + 1} of {(() => {
                              const images = project.gallery && project.gallery.length > 0 
                                ? project.gallery 
                                : [project.image];
                              return images.length;
                            })()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${(() => {
                                const images = project.gallery && project.gallery.length > 0 
                                  ? project.gallery 
                                  : [project.image];
                                return ((galleryIndex + 1) / images.length) * 100;
                              })()}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        {currentCaption}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
              
              {/* Enhanced Thumbnail Gallery with Better Selection */}
              {(() => {
                const images = project.gallery && project.gallery.length > 0 
                  ? project.gallery 
                  : [project.image]; // Use main image if no gallery
                
                return images.length > 1 ? (
                  <div className="p-6 bg-white">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Select Image:</h4>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setGalleryIndex(index)}
                          className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
                            index === galleryIndex 
                              ? 'border-red-500 ring-4 ring-red-200 shadow-lg scale-105' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-105'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Selection indicator */}
                          {index === galleryIndex && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Image Navigation Controls */}
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      
                      <div className="flex space-x-1">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setGalleryIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === galleryIndex ? 'bg-red-500' : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Project Overview Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('projects.projectOverview')}</h3>
              <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                    <div className="text-sm text-slate-500">{t('projects.projectType')}</div>
                    <div className="font-medium text-slate-900">{project.project_type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">{t('projects.location')}</div>
                    <div className="font-medium text-slate-900">{project.location}</div>
                </div>
              </div>
                    <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                    <div className="text-sm text-slate-500">{t('projects.completion')}</div>
                    <div className="font-medium text-slate-900">
                      {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                      </div>
                </div>
              </div>

          {/* Right Column - Project Story */}
          <div className="space-y-12">
            {/* Project Meta */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h3>
              <div className="grid grid-cols-2 gap-6">
              <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.client')}</div>
                  <div className="font-semibold text-slate-900">{project.client}</div>
                </div>
              <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.location')}</div>
                  <div className="font-semibold text-slate-900">{project.location}</div>
                </div>
              <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.duration')}</div>
                  <div className="font-semibold text-slate-900">{project.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.projectValue')}</div>
                  <div className="font-semibold text-slate-900">{project.project_value}</div>
                </div>
              </div>
            </div>

            {/* Project Story */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('projects.projectStory')}</h2>
                <div className="space-y-6">
                  {project.challenges && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">{t('projects.challenges')}</h3>
                      <p className="text-slate-600 leading-relaxed">{project.challenges}</p>
              </div>
            )}
                  {project.solutions && (
              <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">{t('projects.solutions')}</h3>
                      <p className="text-slate-600 leading-relaxed">{project.solutions}</p>
              </div>
            )}
                  {project.results && (
              <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">{t('projects.results')}</h3>
                      <p className="text-slate-600 leading-relaxed">{project.results}</p>
              </div>
            )}
                </div>
              </div>
          </div>

            {/* Technical Details */}
            {project.features && project.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('projects.technicalDetails')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getLocalizedFeatures().map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                    ))}
                  </div>
              </div>
            )}

            {/* Products Used */}
            {productsUsed.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('projects.productsUsed')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productsUsed.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block bg-white rounded-lg p-4 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-sm text-slate-500">{product.category}</div>
                        </div>
                        <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                    ))}
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
