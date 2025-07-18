import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LANGUAGES, Language } from './LanguageSelector';

interface TranslationStatusProps {
  translations: Record<string, any>;
  requiredFields?: string[];
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export const TranslationStatus: React.FC<TranslationStatusProps> = ({
  translations,
  requiredFields = ['name', 'description'],
  className = '',
  showLabels = true,
  variant = 'default'
}) => {
  const getTranslationStatus = (langCode: string) => {
    const langData = translations[langCode] || {};
    
    // Check if all required fields have content
    const hasAllRequired = requiredFields.every(field => {
      const value = langData[field];
      return value && value.toString().trim().length > 0;
    });
    
    // Check if any fields have content
    const hasAnyContent = requiredFields.some(field => {
      const value = langData[field];
      return value && value.toString().trim().length > 0;
    });
    
    if (hasAllRequired) return 'complete';
    if (hasAnyContent) return 'partial';
    return 'missing';
  };

  const getStatusIcon = (status: 'complete' | 'partial' | 'missing') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'complete' | 'partial' | 'missing') => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: 'complete' | 'partial' | 'missing') => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'partial':
        return 'Partial';
      case 'missing':
        return 'Missing';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {LANGUAGES.map(lang => {
          const status = getTranslationStatus(lang.code);
          return (
            <TooltipProvider key={lang.code}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`p-1 rounded border ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{lang.nativeName}: {getStatusText(status)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {LANGUAGES.map(lang => {
          const status = getTranslationStatus(lang.code);
          return (
            <TooltipProvider key={lang.code}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)}
                    <span className="text-xs">{lang.code.toUpperCase()}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{lang.nativeName}: {getStatusText(status)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">翻译状态:</span>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {LANGUAGES.map(lang => {
          const status = getTranslationStatus(lang.code);
          return (
            <TooltipProvider key={lang.code}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-2 ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)}
                    <span>{lang.flag}</span>
                    <span className="text-xs">{lang.nativeName}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{lang.nativeName}: {getStatusText(status)}</p>
                  <p className="text-xs text-muted-foreground">
                    Required fields: {requiredFields.join(', ')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationStatus; 