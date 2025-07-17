import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, useTranslation } from '@/hooks/useTranslation';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  refreshTranslations: () => void;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { currentLanguage, changeLanguage, refreshTranslations, loading } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('aftek-language');
      if (savedLanguage && savedLanguage !== currentLanguage) {
        changeLanguage(savedLanguage as Language);
      }
      setIsInitialized(true);
    }
  }, []);

  // Handle route changes to ensure language persistence
  useEffect(() => {
    const handleRouteChange = () => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const savedLanguage = localStorage.getItem('aftek-language');
        if (savedLanguage && savedLanguage !== currentLanguage) {
          changeLanguage(savedLanguage as Language);
        }
      }, 100);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for custom route change events
    window.addEventListener('routeChange', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [currentLanguage, changeLanguage]);

  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    refreshTranslations,
    loading: loading || !isInitialized
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}; 