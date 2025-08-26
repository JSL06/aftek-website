import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export type Language = 'en' | 'zh-Hant' | 'ja' | 'ko' | 'th' | 'vi';

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },

  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
];

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  showLabel = true,
  variant = 'default',
  className = ''
}) => {
  const getLanguageButton = (lang: typeof LANGUAGES[0]) => {
    const isSelected = selectedLanguage === lang.code;
    
    if (variant === 'minimal') {
      return (
        <Button
          key={lang.code}
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange(lang.code as Language)}
          className={`px-2 py-1 text-xs ${className}`}
        >
          <span>{lang.flag}</span>
        </Button>
      );
    }
    
    if (variant === 'compact') {
      return (
        <Button
          key={lang.code}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onLanguageChange(lang.code as Language)}
          className={`px-3 py-1 text-sm ${className}`}
        >
          <span>{lang.flag}</span>
          <span className="ml-1">{lang.code.toUpperCase()}</span>
        </Button>
      );
    }
    
    return (
      <Button
        key={lang.code}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={() => onLanguageChange(lang.code as Language)}
        className={`flex items-center gap-2 ${className}`}
      >
        <span>{lang.flag}</span>
        <span>{lang.nativeName}</span>
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-4">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {variant === 'minimal' ? 'Lang:' : '编辑语言:'}
          </span>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {LANGUAGES.map(getLanguageButton)}
      </div>
    </div>
  );
};

export default LanguageSelector; 