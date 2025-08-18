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
    <div className="min-h-screen bg-background pt-32">
      <div className="container mx-auto px-6 mb-24">
        <div className="title-container">
          <h1 className="uniform-page-title">{t('resources.title')}</h1>
        </div>
      </div>
    </div>
  );
};

export default Resources;