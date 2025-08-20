import React, { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const Resources = () => {
  const { t } = useTranslation();
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Resources page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);
  
  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: 'url(/src/assets/17580.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      {/* Title Section with Special Background */}
      <div 
        className="relative py-16 mb-12"
        style={{
          backgroundImage: 'url(/src/assets/pexels-pixabay-159306.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {t('resources.title')}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Resources and documentation coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;