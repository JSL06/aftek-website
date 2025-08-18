import React from 'react';
import { Button } from '@/components/ui/button';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export default function AdminLanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-Hant' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <span className="text-lg">
        {language === 'en' ? '🇺🇸' : '🇹🇼'}
      </span>
      <span className="hidden sm:inline">
        {language === 'en' ? 'English' : '繁體中文'}
      </span>
    </Button>
  );
}
