import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from '@/hooks/useTranslation';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('NotFound page: Language changed to:', event.detail);
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
      className="min-h-screen flex items-center justify-center" 
      style={{
        backgroundImage: 'url(/aftek-website/src/assets/17580.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-12 border border-border text-center max-w-md mx-4">
        <h1 className="text-4xl font-bold mb-4 text-foreground">{t('notFound.title')}</h1>
        <p className="text-xl text-muted-foreground mb-6">{t('notFound.subtitle')}</p>
        <a href="/" className="text-primary hover:text-primary-hover underline font-medium">
          {t('notFound.home')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
