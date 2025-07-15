import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Play, Star, Users, Award, Target, Building2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import heroImage from '@/assets/hero-aftek-construction.jpg';
import companyProfilePdf from '@/assets/Aftek_Company_Profile_English.pdf';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
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
  const [featuredProducts, setFeaturedProducts] = useState([]);

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
        console.log('Page refresh detected - showing animations');
        // Page refresh - show animations
        setTimeout(() => setShowTitle(true), 200);
        setTimeout(() => setBgLighten(true), 200);
        setTimeout(() => setShowDesc(true), 700);
        setTimeout(() => setShowButtons(true), 1200);
      } else {
        console.log('Navigation from another page - showing content immediately');
        // Navigation from another page - show everything immediately
        setShowTitle(true);
        setShowDesc(true);
        setShowButtons(true);
        setBgLighten(true);
      }
    }
  }, [location.pathname]);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, description, image, features, names, isFeatured')
          .eq('isFeatured', true)
          .eq('isActive', true)
          .limit(10);
        
        if (error) {
          console.warn('Featured products not available:', error.message);
          setFeaturedProducts([]);
        } else {
          setFeaturedProducts(data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch featured products:', err);
        setFeaturedProducts([]);
      }
    };
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    const card = cardRefs.current[currentProject];
    if (container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const containerScrollLeft = container.scrollLeft;
      // Calculate the new scrollLeft so the card is centered
      const offset = cardRect.left - containerRect.left;
      const scrollTo = containerScrollLeft + offset - (containerRect.width / 2) + (cardRect.width / 2);
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [currentProject]);

  // Infinite auto-scroll effect
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    let frame: number;
    let speed = 1.2; // px per frame
    let running = true;

    const scroll = () => {
      if (!running) return;
      if (!isCarouselHovered) {
        container.scrollLeft += speed;
        // If we've scrolled past the first set, reset to the start
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [isCarouselHovered]);

  const serviceCards = [
    {
      title: t('home.services.sealants.title'),
      description: t('home.services.sealants.desc'),
      icon: Target
    },
    {
      title: t('home.services.waterproofing.title'), 
      description: t('home.services.waterproofing.desc'),
      icon: Award
    },
    {
      title: t('home.services.flooring.title'),
      description: t('home.services.flooring.desc'),
      icon: Building2
    },
    {
      title: t('home.services.grout.title'),
      description: t('home.services.grout.desc'),
      icon: Users
    }
  ];

  const getProjectData = (index: number) => {
    const projectKeys = [
      {
        title: 'home.projects.project1.title',
        location: 'home.projects.project1.location',
        image: 'home.projects.project1.image',
        category: 'home.projects.project1.category'
      },
      {
        title: 'home.projects.project2.title', 
        location: 'home.projects.project2.location',
        image: 'home.projects.project2.image',
        category: 'home.projects.project2.category'
      },
      {
        title: 'home.projects.project3.title',
        location: 'home.projects.project3.location', 
        image: 'home.projects.project3.image',
        category: 'home.projects.project3.category'
      }
    ];
    
    const project = projectKeys[index];
    return {
      title: t(project.title),
      location: t(project.location),
      image: t(project.image),
      category: t(project.category)
    };
  };

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
              <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
                {t('home.mission.paragraph2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('home.services.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCards.map((service, index) => (
              <Card key={index} className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
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
                            
                            {/* Features */}
                            {(() => {
                              const safeFeatures = Array.isArray(product.features) 
                                ? product.features 
                                : typeof product.features === 'string' && product.features.length > 0
                                  ? [product.features]
                                  : [];
                              
                              if (safeFeatures.length > 0) {
                                return (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {safeFeatures.slice(0, 2).map((feature, index) => (
                                      <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-full">
                                        {feature}
                                      </span>
                                    ))}
                                    {safeFeatures.length > 2 && (
                                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                        +{safeFeatures.length - 2}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
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

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-4">
              {featuredProducts.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full border-2 ${currentRecommendedProduct === idx ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                  onClick={() => setCurrentRecommendedProduct(idx)}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>

            {/* View All Products Button */}
            <div className="flex justify-center mt-12">
              <Link to="/products">
                <Button variant="outline">
                  {t('home.recommended.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Products & Articles Teaser */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('home.explore.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group overflow-hidden h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="h-64 bg-gradient-accent flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.explore.products.title')}</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    {t('home.explore.products.desc')}
                  </p>
                  <Link to="/products">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      {t('home.explore.products.btn')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group overflow-hidden h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="h-64 bg-gradient-accent flex items-center justify-center">
                  <FileText className="h-16 w-16 text-primary" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.explore.articles.title')}</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    {t('home.explore.articles.desc')}
                  </p>
                  <Link to="/articles">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      {t('home.explore.articles.btn')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Past Projects Carousel */}
      <section className="py-12 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('home.projects.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.projects.desc')}
            </p>
          </div>

          {/* 2D Horizontal Carousel */}
          <div className="relative flex items-center justify-center max-w-6xl mx-auto mb-12" style={{ minHeight: '340px' }}>
            {/* Left Arrow */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/80 border border-border rounded-full shadow-lg p-2 transition-all backdrop-blur-md"
              style={{ backdropFilter: 'blur(8px)' }}
              onClick={() => setCurrentProject((prev) => (prev - 1 + 3) % 3)}
              aria-label="Previous project"
            >
              <ChevronLeft className="h-8 w-8 text-primary" />
            </button>
            {/* Cards Row */}
            <div className="flex flex-row items-center justify-center gap-8 w-full px-20">
              {[0, 1, 2].map((idx) => {
                const project = getProjectData(idx);
                const isSelected = idx === currentProject;
                return (
                  <div
                    key={idx}
                    className={`transition-transform duration-500 ${isSelected ? 'scale-105' : 'scale-90 opacity-70'} cursor-pointer`}
                    style={{ minWidth: '320px', maxWidth: '480px', width: '80vw', height: '320px' }}
                    onClick={() => setCurrentProject(idx)}
                  >
                    <Card
                      className={`bg-white/80 border-border shadow-card overflow-hidden w-full h-full flex-shrink-0 ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      style={{ aspectRatio: '3 / 2', height: '320px' }}
                    >
                      <CardContent className="p-0 h-full flex flex-row items-center">
                        <div className="flex-1 h-full flex flex-col justify-center px-8">
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            📍 {project.location}
                          </p>
                          <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full inline-block">
                            {project.category}
                          </span>
                        </div>
                        <div className="w-1/3 h-full flex items-center justify-center bg-gradient-accent rounded-r-lg">
                          <span className="text-muted-foreground text-lg">
                            {project.image}
                          </span>
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
              onClick={() => setCurrentProject((prev) => (prev + 1) % 3)}
              aria-label="Next project"
            >
              <ChevronRight className="h-8 w-8 text-primary" />
            </button>
          </div>
          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-4">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 ${currentProject === idx ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                onClick={() => setCurrentProject(idx)}
                aria-label={`Go to project ${idx + 1}`}
              />
            ))}
          </div>
          {/* View All Projects Button */}
          <div className="flex justify-center mt-12">
            <Link to="/projects">
              <Button variant="outline">
                {t('home.projects.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Slider (placeholder for partners) */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              合作夥伴 / Partners
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Here will be a showcase of our partner companies and platforms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;