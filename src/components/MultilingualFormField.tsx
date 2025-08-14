import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LANGUAGES, Language } from './LanguageSelector';
import { TranslationStatus } from './TranslationStatus';

interface MultilingualFormFieldProps {
  label: string;
  fieldName: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'rich-text';
  translations: Record<string, any>;
  onTranslationChange: (language: Language, fieldName: string, value: any) => void;
  currentLanguage: Language;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  showTranslationStatus?: boolean;
  requiredFields?: string[];
}

export const MultilingualFormField: React.FC<MultilingualFormFieldProps> = ({
  label,
  fieldName,
  type,
  translations,
  onTranslationChange,
  currentLanguage,
  placeholder,
  options = [],
  required = false,
  className = '',
  showTranslationStatus = true,
  requiredFields = ['name', 'description']
}) => {
  const getCurrentValue = () => {
    const langData = translations[currentLanguage] || {};
    return langData[fieldName] || '';
  };

  const handleChange = (value: any) => {
    onTranslationChange(currentLanguage, fieldName, value);
  };

  const renderField = () => {
    const currentValue = getCurrentValue();
    const currentLang = LANGUAGES.find(l => l.code === currentLanguage);

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || `${label} (${currentLang?.nativeName})`}
            className="min-h-[100px]"
          />
        );

      case 'select':
        return (
          <Select value={currentValue} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `选择${label} (${currentLang?.nativeName})`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div className="space-y-2">
            <select
              multiple
              className="w-full border rounded-md p-2 min-h-[100px]"
              value={currentValues}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleChange(selected);
              }}
            >
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              按住 Ctrl (Windows) 或 Cmd (Mac) 选择多个选项
            </p>
          </div>
        );

      case 'rich-text':
        return (
          <div className="space-y-2">
            <Textarea
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || `${label} (${currentLang?.nativeName})`}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              支持 HTML 标签和 Markdown 格式
            </p>
          </div>
        );

      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || `${label} (${currentLang?.nativeName})`}
          />
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`${fieldName}-${currentLanguage}`} className="text-sm font-medium">
          {label} ({LANGUAGES.find(l => l.code === currentLanguage)?.nativeName})
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {showTranslationStatus && (
          <TranslationStatus
            translations={translations}
            requiredFields={requiredFields}
            variant="minimal"
            showLabels={false}
          />
        )}
      </div>
      
      {renderField()}
      
      {type === 'multiselect' && getCurrentValue() && Array.isArray(getCurrentValue()) && (
        <div className="flex flex-wrap gap-1">
          {getCurrentValue().map((value: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultilingualFormField; 