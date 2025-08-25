import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, Star, Clock, DollarSign, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
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
  gallery_images: string[];
  gallery_captions?: string[]; // Array of captions for gallery images
  gallery_hotspots?: Array<{
    productName: string;
    x: number;
    y: number;
  }>[]; // Array of hotspots for each image
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
  const { products } = useProducts();
  const { categories } = useCategories(currentLanguage);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [features, setFeatures] = useState<{ id: string; feature_key: string; display_name: string; category: string }[]>([]);
  const [productsUsed, setProductsUsed] = useState<{ id: string; name: string; category: string }[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
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
  
  // Close hotspot labels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[id^="hotspot-label-"]') && !target.closest('[id^="thumbnail-hotspot-label-"]')) {
        // Close all hotspot labels
        document.querySelectorAll('[id^="hotspot-label-"], [id^="thumbnail-hotspot-label-"]').forEach(label => {
          label.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
    
    // First try to get from centralized categories with localized names
    if (categories.length > 0) {
      const centralizedCategory = categories.find(cat => cat.name === project.category);
      if (centralizedCategory) {
        // Use the localized name if available, otherwise fall back to English
        return centralizedCategory.names?.[currentLanguage] || centralizedCategory.names?.['en'] || centralizedCategory.name;
      }
    }
    
    // Fallback: translate common category names manually
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

          {/* Title Section with Special Background - Positioned right under header */}
          <div 
            className="relative py-16 mb-12 mt-0"
            style={{
              backgroundImage: `url(${project.image || '/placeholder.svg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 container mx-auto text-center">
              <h1 className="uniform-page-title text-white" style={{textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px'}}>
                {project.titles?.[currentLanguage] || project.title}
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Left Column - Large Impactful Gallery (Takes 2/3 of space) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Gallery Section */}
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                  {/* Gallery Header */}
                  <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-900">{t('projects.gallery')}</h3>
                      {(() => {
                        const images = project.gallery_images && project.gallery_images.length > 0 
                          ? project.gallery_images 
                          : [project.image]; // Use main image if no gallery
                        
                        return images.length > 1 ? (
                          <div className="text-sm text-slate-600">
                            {t('projects.imageCounter').replace('{current}', String(galleryIndex + 1)).replace('{total}', String(images.length))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Gallery Main Image - Made Much Larger */}
                  <div className="relative aspect-[4/3] bg-slate-100">
                {(() => {
                  const images = project.gallery_images && project.gallery_images.length > 0 
                    ? project.gallery_images 
                    : [project.image]; // Use main image if no gallery
                  
                  // Get hotspots for current image
                  const hotspots = project.gallery_hotspots || [];
                  const currentHotspots = hotspots[galleryIndex] || [];
                  
                  return (
                    <>
                      <img
                        src={images[galleryIndex]}
                        alt={`${project.titles?.[currentLanguage] || project.title} - Gallery Image ${galleryIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Product Hotspots on Image */}
                      {currentHotspots.map((hotspot, idx) => (
                        <div
                          key={idx}
                          className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white cursor-pointer shadow-lg hover:bg-red-600 transition-colors"
                          style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={(() => {
                            const product = products.find(p => p.name === hotspot.productName || p.names?.en === hotspot.productName);
                            return product ? (product.names?.[currentLanguage] || product.name) : hotspot.productName;
                          })()}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle hotspot label visibility
                            const hotspotLabel = document.getElementById(`hotspot-label-${galleryIndex}-${idx}`);
                            if (hotspotLabel) {
                              hotspotLabel.classList.toggle('hidden');
                            }
                          }}
                        />
                      ))}
                      
                      {/* Hotspot Labels */}
                      {currentHotspots.map((hotspot, idx) => {
                        // Find the product details
                        const product = products.find(p => p.name === hotspot.productName || p.names?.en === hotspot.productName);
                        
                        return (
                          <div
                            key={idx}
                            id={`hotspot-label-${galleryIndex}-${idx}`}
                            className="absolute hidden bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-w-xs overflow-hidden"
                            style={{
                              left: `${hotspot.x}%`,
                              top: `${hotspot.y}%`,
                              transform: 'translate(-50%, -100%)',
                              marginTop: '-10px'
                            }}
                          >
                            {product ? (
                              <Link 
                                to={`/products/${product.id}`}
                                className="block hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                  // Close the label when navigating
                                  const label = document.getElementById(`hotspot-label-${galleryIndex}-${idx}`);
                                  if (label) label.classList.add('hidden');
                                }}
                              >
                                <div className="flex items-center space-x-3 p-3">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={product.image || '/placeholder.svg'}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                    />
                                  </div>
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 truncate">
                                      {product.names?.[currentLanguage] || product.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                      {product.category}
                                    </div>
                                  </div>
                                  {/* Arrow Icon */}
                                  <div className="flex-shrink-0">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              <div className="p-3">
                                <div className="text-sm font-medium text-slate-900 text-center">
                                  {hotspot.productName}
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        );
                      })}
                      
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
              
              {/* Gallery Captions and Hotspots Display */}
              {(() => {
                const images = project.gallery_images && project.gallery_images.length > 0 
                  ? project.gallery_images 
                  : [project.image];
                
                // Get captions and hotspots from project data
                const captions = project.gallery_captions || {};
                const hotspots = project.gallery_hotspots || [];
                const currentCaption = captions[currentLanguage]?.[galleryIndex] || captions['en']?.[galleryIndex] || '';
                const currentHotspots = hotspots[galleryIndex] || [];
                
                return (
                  <div className="p-6 bg-white border-t border-slate-200">
                    <div className="space-y-6">
                      {/* Progress Bar */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-slate-700">{t('projects.progress')}</span>
                          <span className="text-sm text-slate-500">
                            {t('projects.imageCounter').replace('{current}', String(galleryIndex + 1)).replace('{total}', String(images.length))}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${((galleryIndex + 1) / images.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Caption Display */}
                      {currentCaption && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <h4 className="text-sm font-medium text-slate-700 mb-2 text-center">{t('projects.imageCaption')}</h4>
                          <p className="text-slate-700 leading-relaxed text-center">
                            {currentCaption}
                          </p>
                        </div>
                      )}
                      

                      
                      {/* No Content Message */}
                      {!currentCaption && (
                        <div className="text-center text-slate-500 italic">
                          {t('projects.noCaptionAvailable')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              {/* Enhanced Thumbnail Gallery with Better Selection */}
              {(() => {
                const images = project.gallery_images && project.gallery_images.length > 0 
                  ? project.gallery_images 
                  : [project.image]; // Use main image if no gallery
                
                // Get hotspots for all images
                const hotspots = project.gallery_hotspots || [];
                
                return images.length > 1 ? (
                  <div className="p-8 bg-white border-t border-slate-200">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">{t('projects.galleryImages')}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => {
                        const imageHotspots = hotspots[index] || [];
                        return (
                          <button
                            key={index}
                            onClick={() => setGalleryIndex(index)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
                              index === galleryIndex 
                                ? 'border-red-500 ring-4 ring-red-200 shadow-lg scale-105' 
                                : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-105'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${project.titles?.[currentLanguage] || project.title} - Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Product Hotspots on Thumbnail */}
                            {imageHotspots.map((hotspot, hotspotIdx) => (
                              <div
                                key={hotspotIdx}
                                className="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm cursor-pointer"
                                style={{
                                  left: `${hotspot.x}%`,
                                  top: `${hotspot.y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                                title={(() => {
                                  const product = products.find(p => p.name === hotspot.productName || p.names?.en === hotspot.productName);
                                  return product ? (product.names?.[currentLanguage] || product.name) : hotspot.productName;
                                })()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle hotspot label visibility
                                  const thumbnailLabel = document.getElementById(`thumbnail-hotspot-label-${index}-${hotspotIdx}`);
                                  if (thumbnailLabel) {
                                    thumbnailLabel.classList.toggle('hidden');
                                  }
                                }}
                              />
                            ))}
                            
                            {/* Thumbnail Hotspot Labels */}
                            {imageHotspots.map((hotspot, hotspotIdx) => {
                              // Find the product details
                              const product = products.find(p => p.name === hotspot.productName || p.names?.en === hotspot.productName);
                              
                              return (
                                <div
                                  key={hotspotIdx}
                                  id={`thumbnail-hotspot-label-${index}-${hotspotIdx}`}
                                  className="absolute hidden bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-w-32 overflow-hidden"
                                  style={{
                                    left: `${hotspot.x}%`,
                                    top: `${hotspot.y}%`,
                                    transform: 'translate(-50%, -100%)',
                                    marginTop: '-5px'
                                  }}
                                >
                                  {product ? (
                                    <Link 
                                      to={`/products/${product.id}`}
                                      className="block hover:bg-slate-50 transition-colors"
                                      onClick={() => {
                                        // Close the label when navigating
                                        const label = document.getElementById(`thumbnail-hotspot-label-${index}-${hotspotIdx}`);
                                        if (label) label.classList.add('hidden');
                                      }}
                                    >
                                      <div className="flex items-center space-x-2 p-2">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                          <img
                                            src={product.image || '/placeholder.svg'}
                                            alt={product.name}
                                            className="w-8 h-8 object-cover rounded border border-slate-200"
                                          />
                                        </div>
                                        {/* Product Name */}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-medium text-slate-900 truncate">
                                            {product.names?.[currentLanguage] || product.name}
                                          </div>
                                        </div>
                                        {/* Arrow Icon */}
                                        <div className="flex-shrink-0">
                                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    </Link>
                                  ) : (
                                    <div className="p-2">
                                      <div className="text-xs font-medium text-slate-900 text-center truncate">
                                        {hotspot.productName}
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white"></div>
                                </div>
                              );
                            })}
                            
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
                        );
                      })}
                    </div>
                    
                    {/* Image Navigation Controls */}
                    <div className="mt-6 flex items-center justify-center space-x-6">
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="flex items-center space-x-2 px-6 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                      >
                        <ChevronLeft className="h-5 w-5" />
                        <span>{t('common.previous')}</span>
                      </button>
                      
                      <div className="flex space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setGalleryIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              index === galleryIndex ? 'bg-red-500' : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="flex items-center space-x-2 px-6 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                      >
                        <span>{t('common.next')}</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

          </div>

          {/* Right Column - Project Description (Takes 1/3 of space) */}
          <div className="lg:col-span-1 space-y-12">
            
            {/* Project Details Card - Moved to Right Side */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">{t('projects.projectDetails')}</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Client */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.client')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.clients_multilingual?.[currentLanguage] || project.client || 'N/A'}
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.location')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.locations_multilingual?.[currentLanguage] || project.location || 'N/A'}
                  </div>
                </div>
                
                {/* Category */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.category')}</div>
                  <div className="font-semibold text-slate-900">
                    {getLocalizedCategory() || 'N/A'}
                  </div>
                </div>
                
                {/* Project Type */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.projectType')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.project_types_multilingual?.[currentLanguage] || project.project_type || 'N/A'}
                  </div>
                </div>
                
                {/* Project Value */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.projectValue')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.project_values_multilingual?.[currentLanguage] || project.project_value || 'N/A'}
                  </div>
                </div>
                
                {/* Duration */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.duration')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.durations_multilingual?.[currentLanguage] || project.duration || 'N/A'}
                  </div>
                </div>
                
                {/* Completion Date */}
                <div>
                  <div className="text-sm text-slate-500 mb-1">{t('projects.completion')}</div>
                  <div className="font-semibold text-slate-900">
                    {project.completion_dates_multilingual?.[currentLanguage] || 
                     (project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A')}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('projects.projectDescription')}</h2>
                <div className="space-y-6">
                  {/* Project Description Display */}
                  <div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      {project.descriptions?.[currentLanguage] || project.description ? (
                        <div 
                          className="text-slate-700 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: project.descriptions?.[currentLanguage] || project.description || '' }}
                        />
                      ) : (
                        <p className="text-slate-500 italic">{t('projects.noDescriptionAvailable')}</p>
                      )}
                    </div>
                  </div>
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
