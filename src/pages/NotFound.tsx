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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('notFound.title')}</h1>
        <p className="text-xl text-gray-600 mb-4">{t('notFound.subtitle')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('notFound.home')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
