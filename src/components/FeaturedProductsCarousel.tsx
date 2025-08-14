import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ProductCard';

interface FeaturedProductsCarouselProps {
  products: Product[];
  autoScroll?: boolean;
  autoScrollInterval?: number;
  className?: string;
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  products,
  autoScroll = true,
  autoScrollInterval = 4000,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    if (width < 768) return 1; // mobile
    if (width < 1024) return 2; // tablet
    return 3; // desktop
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || isHovered || products.length <= itemsPerView) return;

    const interval = setInterval(() => {
      scrollToNext();
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, isHovered, currentIndex, itemsPerView, products.length]);

  // Update scroll button states
  useEffect(() => {
    updateScrollButtons();
  }, [currentIndex, itemsPerView, products.length]);

  const updateScrollButtons = () => {
    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < products.length - itemsPerView);
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    
    const newIndex = Math.max(0, Math.min(index, products.length - itemsPerView));
    setCurrentIndex(newIndex);
    
    const cardWidth = carouselRef.current.scrollWidth / products.length;
    const scrollPosition = newIndex * cardWidth;
    
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const scrollToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= products.length - itemsPerView + 1) {
      // Loop back to start
      scrollToIndex(0);
    } else {
      scrollToIndex(nextIndex);
    }
  };

  const scrollToPrev = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      // Loop to end
      scrollToIndex(products.length - itemsPerView);
    } else {
      scrollToIndex(prevIndex);
    }
  };

  const handleDotClick = (index: number) => {
    scrollToIndex(index);
  };

  // Calculate total dots needed
  const totalDots = Math.max(1, products.length - itemsPerView + 1);

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">No featured products available</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrows */}
      {products.length > itemsPerView && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border border-border rounded-full transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={scrollToPrev}
            disabled={!canScrollLeft}
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border border-border rounded-full transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={scrollToNext}
            disabled={!canScrollRight}
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Carousel Container */}
      <div className="px-12">
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none"
              style={{
                width: `calc((100% - ${(itemsPerView - 1) * 1.5}rem) / ${itemsPerView})`,
                scrollSnapAlign: 'start'
              }}
            >
              <ProductCard 
                product={product} 
                variant="compact"
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicators */}
      {products.length > itemsPerView && totalDots > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }, (_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-110'
                  : 'bg-border hover:bg-muted-foreground/50'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-scroll indicator */}
      {autoScroll && !isHovered && products.length > itemsPerView && (
        <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Auto-scroll enabled
        </div>
      )}


    </div>
  );
};

export default FeaturedProductsCarousel; 