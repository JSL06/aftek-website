import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Play, Star, Users, Award, Target, Building2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import heroImage from '@/assets/hero-aftek-construction.jpg';
import companyProfilePdf from '@/assets/Aftek_Company_Profile_English.pdf';

const HomeTest = () => {
  const location = useLocation();
  const { t, currentLanguage } = useTranslation();
  const isInitialMount = useRef(true);
  const [currentReview, setCurrentReview] = useState(0);
  const [currentProject, setCurrentProject] = useState(0);
  const [currentRecommendedProduct, setCurrentRecommendedProduct] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [bgLighten, setBgLighten] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Sample featured products for testing
  const [featuredProducts] = useState([
    {
      id: '1',
      name: 'FlexPro PU Sealant',
      category: 'Sealants',
      description: 'High-performance polyurethane sealant for construction joints and waterproofing applications.',
      features: ['Waterproof', 'UV Resistant', 'Flexible', 'Fast Cure'],
      isFeatured: true,
      isActive: true,
      in_stock: true,
      names: {
        en: 'FlexPro PU Sealant',
        th: 'เฟล็กซ์โปร พียู ซีลแลนท์',
        ja: 'フレックスプロ PU シーラント',
        'zh-Hans': 'FlexPro PU 密封剂',
        'zh-Hant': 'FlexPro PU 密封劑',
        ko: 'FlexPro PU 실란트',
        vi: 'FlexPro PU Sealant'
      }
    },
    {
      id: '2',
      name: 'AquaStop Membrane',
      category: 'Waterproofing',
      description: 'Advanced waterproofing membrane system for basements and foundations.',
      features: ['Waterproof', 'Chemical Resistant', 'High Strength', 'Underwater'],
      isFeatured: true,
      isActive: true,
      in_stock: true,
      names: {
        en: 'AquaStop Membrane',
        th: 'แผ่นกันซึม อควาสต็อป',
        ja: 'アクアストップ メンブレン',
        'zh-Hans': 'AquaStop 防水膜',
        'zh-Hant': 'AquaStop 防水膜',
        ko: 'AquaStop 멤브레인',
        vi: 'Màng chống thấm AquaStop'
      }
    },
    {
      id: '3',
      name: 'StructureFlex Adhesive',
      category: 'Adhesives',
      description: 'Structural adhesive for concrete, steel and composite materials.',
      features: ['High Strength', 'Fast Cure', 'Temperature Resistant', 'Structural'],
      isFeatured: true,
      isActive: true,
      in_stock: true,
      names: {
        en: 'StructureFlex Adhesive',
        th: 'กาวโครงสร้าง สตรัคเจอร์เฟล็กซ์',
        ja: 'ストラクチャーフレックス 接着剤',
        'zh-Hans': 'StructureFlex 结构胶',
        'zh-Hant': 'StructureFlex 結構膠',
        ko: 'StructureFlex 접착제',
        vi: 'Keo dán StructureFlex'
      }
    },
    {
      id: '4',
      name: 'WeatherShield Coating',
      category: 'Coatings',
      description: 'Protective coating system for exterior concrete and masonry surfaces.',
      features: ['UV Resistant', 'Outdoor Use', 'Weather Resistant', 'Paintable'],
      isFeatured: true,
      isActive: true,
      in_stock: true,
      names: {
        en: 'WeatherShield Coating',
        th: 'สีเคลือบ เวเธอร์ชีลด์',
        ja: 'ウェザーシールド コーティング',
        'zh-Hans': 'WeatherShield 涂料',
        'zh-Hant': 'WeatherShield 塗料',
        ko: 'WeatherShield 코팅',
        vi: 'Lớp phủ WeatherShield'
      }
    }
  ]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Check if this is the first time the app has been loaded
    const hasAppBeenLoaded = localStorage.getItem('aftekAppLoaded');
    
    console.log('Home component mounted, hasAppBeenLoaded:', hasAppBeenLoaded);
    
    if (!hasAppBeenLoaded) {
      console.log('First time loading app - showing animations');
      // First time loading the app - show animations
      setTimeout(() => setShowTitle(true), 200);
      setTimeout(() => setBgLighten(true), 200);
      setTimeout(() => setShowDesc(true), 700);
      setTimeout(() => setShowButtons(true), 1200);
      
      // Mark that the app has been loaded
      localStorage.setItem('aftekAppLoaded', 'true');
    } else {
      // App has been loaded before - check if this is a page refresh
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const isPageRefresh = navigationEntry?.type === 'reload';
      
      console.log('App loaded before, navigation type:', navigationEntry?.type, 'isPageRefresh:', isPageRefresh);
      
      if (isPageRefresh) {
        console.log('Page refresh detected - showing quick animations');
        // Page refresh - show quick animations
        setTimeout(() => setShowTitle(true), 50);
        setTimeout(() => setBgLighten(true), 50);
        setTimeout(() => setShowDesc(true), 100);
        setTimeout(() => setShowButtons(true), 150);
      } else {
        console.log('SPA navigation detected - showing content immediately');
        // SPA navigation - show content immediately
        setShowTitle(true);
        setBgLighten(true);
        setShowDesc(true);
        setShowButtons(true);
      }
    }

    // Add some console logging for debugging
    console.log('Location:', location.pathname);
    console.log('isInitialMount:', isInitialMount.current);
    
    // Mark this as no longer the initial mount
    isInitialMount.current = false;
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clientReviews = [
    {
      quote: 'CLIENT_REVIEW_1_QUOTE',
      author: 'CLIENT_REVIEW_1_AUTHOR',
      position: 'CLIENT_REVIEW_1_POSITION',
      company: 'CLIENT_REVIEW_1_COMPANY'
    },
    {
      quote: 'CLIENT_REVIEW_2_QUOTE',
      author: 'CLIENT_REVIEW_2_AUTHOR', 
      position: 'CLIENT_REVIEW_2_POSITION',
      company: 'CLIENT_REVIEW_2_COMPANY'
    },
    {
      quote: 'CLIENT_REVIEW_3_QUOTE',
      author: 'CLIENT_REVIEW_3_AUTHOR',
      position: 'CLIENT_REVIEW_3_POSITION', 
      company: 'CLIENT_REVIEW_3_COMPANY'
    }
  ];

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % clientReviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + clientReviews.length) % clientReviews.length);
  };

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % 3);
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + 3) % 3);
  };

  // Helper to get the correct card node for centering
  const getCardNode = (idx: number) => {
    // Always center the card in the first set (original)
    return cardRefs.current[idx];
  };

  // Center selected card on arrow/dot click
  const centerCard = (idx: number) => {
    const container = carouselRef.current;
    const card = getCardNode(idx);
    if (container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const containerScrollLeft = container.scrollLeft;
      const offset = cardRect.left - containerRect.left;
      const scrollTo = containerScrollLeft + offset - (containerRect.width / 2) + (cardRect.width / 2);
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
      // After scroll, if we're in the duplicate set, jump to the original
      setTimeout(() => {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          // Jump to the original set
          const cardOrig = cardRefs.current[idx];
          if (cardOrig) {
            const origRect = cardOrig.getBoundingClientRect();
            const offsetOrig = origRect.left - containerRect.left;
            const scrollToOrig = containerScrollLeft + offsetOrig - (containerRect.width / 2) + (origRect.width / 2);
            container.scrollLeft = scrollToOrig;
          }
        }
      }, 400); // match smooth scroll duration
    }
    setCurrentProject(idx);
  };

  return (
    <div className="home-gradient min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${parallaxOffset}px`,
        }}
      >
        {/* Animated overlay */}
        <div
          className="absolute inset-0 z-0 transition-all duration-[10000ms]"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,${bgLighten ? 0.7 : 0.98}) 0%, rgba(220,38,38,${bgLighten ? 0.3 : 0.05}) 100%)`,
            transitionProperty: 'background, opacity'
          }}
        />
        <div className="container mx-auto px-6 relative z-10 mb-24">
          <div className="max-w-5xl">
            <h1
              className={`text-5xl md:text-7xl font-bold mb-6 text-white leading-tight transition-opacity duration-700 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
              style={{ transitionProperty: 'opacity, transform' }}
            >
              {t('home.hero.title')}
            </h1>
            <p
              className={`text-xl md:text-2xl mb-8 text-white/90 max-w-3xl transition-opacity duration-700 ${showDesc ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
              style={{ transitionProperty: 'opacity, transform', transitionDelay: '0.2s' }}
            >
              {t('home.hero.subtitle')}
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 mb-8 transition-opacity duration-700 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
              style={{ transitionProperty: 'opacity, transform', transitionDelay: '0.4s' }}
            >
              <a
                href="https://youtu.be/TT9sLsEGBqI?list=TLGGq_kDVToKf2kwODA3MjAyNQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow">
                  <Play className="mr-2 h-5 w-5" />
                  {t('home.hero.aboutBtn')}
                </Button>
              </a>
              <a
                href={companyProfilePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="lg" className="border-white/30 text-primary hover:bg-white/10">
                  <FileText className="mr-2 h-5 w-5" />
                  {t('home.hero.companyProfileBtn')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t('home.mission.title')}
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-center">
              {t('home.mission.content').split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg md:text-xl text-foreground leading-relaxed font-medium mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-secondary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t('home.services.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('home.services.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <Card key={num} className="bg-card border-border shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      {t(`home.services.service${num}.title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`home.services.service${num}.description`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t('home.recommended.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('home.recommended.subtitle')}
              </p>
            </div>

            {/* Products Carousel */}
            <div className="relative flex items-center justify-center max-w-6xl mx-auto mb-12" style={{ minHeight: '360px' }}>
              {/* Left Arrow */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/80 border border-border rounded-full shadow-lg p-2 transition-all backdrop-blur-md"
                style={{ backdropFilter: 'blur(8px)' }}
                onClick={() => setCurrentRecommendedProduct((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                aria-label="Previous product"
              >
                <ChevronLeft className="h-8 w-8 text-primary" />
              </button>

              {/* Products Row */}
              <div className="flex flex-row items-center justify-center gap-8 w-full px-20">
                {featuredProducts.map((product, idx) => {
                  const isSelected = idx === currentRecommendedProduct;
                  const productName = product.names?.[currentLanguage] || product.name;
                  return (
                    <div
                      key={product.id}
                      className={`transition-transform duration-500 ${isSelected ? 'scale-105' : 'scale-90 opacity-70'} cursor-pointer`}
                      style={{ minWidth: '320px', maxWidth: '480px', width: '80vw', height: '360px' }}
                      onClick={() => setCurrentRecommendedProduct(idx)}
                    >
                      <Card
                        className={`bg-white/80 border-border shadow-card overflow-hidden w-full h-full flex-shrink-0 ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        style={{ height: '360px' }}
                      >
                        <CardContent className="p-0 h-full flex flex-col">
                          {/* Product Image/Icon */}
                          <div className="h-48 bg-gradient-accent flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={productName} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="h-16 w-16 text-primary" />
                            )}
                          </div>
                          {/* Product Info */}
                          <div className="flex-1 flex flex-col justify-center px-6 py-4">
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {productName}
                            </h3>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full inline-block mb-3 w-fit">
                              {product.category}
                            </span>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {product.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/80 border border-border rounded-full shadow-lg p-2 transition-all backdrop-blur-md"
                style={{ backdropFilter: 'blur(8px)' }}
                onClick={() => setCurrentRecommendedProduct((prev) => (prev + 1) % featuredProducts.length)}
                aria-label="Next product"
              >
                <ChevronRight className="h-8 w-8 text-primary" />
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2">
              {featuredProducts.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentRecommendedProduct ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/60'
                  }`}
                  onClick={() => setCurrentRecommendedProduct(idx)}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <Link to="/products">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  {t('home.recommended.viewAllBtn')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Rest of the page... */}
    </div>
  );
};

export default HomeTest; 