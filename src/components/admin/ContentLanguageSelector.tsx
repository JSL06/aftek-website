import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ContentLanguage = 'en' | 'zh-Hant' | 'ja' | 'ko' | 'th' | 'vi';

export const contentLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },

  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

interface ContentLanguageSelectorProps {
  value: ContentLanguage;
  onValueChange: (value: ContentLanguage) => void;
  className?: string;
}

export default function ContentLanguageSelector({ 
  value, 
  onValueChange, 
  className = "" 
}: ContentLanguageSelectorProps) {
  const currentLanguage = contentLanguages.find(lang => lang.code === value) || contentLanguages[0];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Edit Content Language:</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {contentLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
