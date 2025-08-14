import { useState, useEffect } from 'react';

export interface PageSettings {
  home: boolean;
  about: boolean;
  products: boolean;
  projects: boolean;
  articles: boolean;
  contact: boolean;
  leadership: boolean;
  footer: boolean;
  navigation: boolean;
}

export const usePageVisibility = () => {
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    home: true,
    about: true,
    products: true,
    projects: true,
    articles: true,
    contact: true,
    leadership: true,
    footer: true,
    navigation: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('pageSettings');
    if (savedSettings) {
      try {
        setPageSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading page settings:', error);
      }
    }
  }, []);

  const isPageVisible = (page: keyof PageSettings): boolean => {
    return pageSettings[page] ?? true;
  };

  const togglePageVisibility = (page: keyof PageSettings) => {
    const updatedSettings = { ...pageSettings, [page]: !pageSettings[page] };
    setPageSettings(updatedSettings);
    localStorage.setItem('pageSettings', JSON.stringify(updatedSettings));
  };

  return {
    pageSettings,
    isPageVisible,
    togglePageVisibility
  };
}; 