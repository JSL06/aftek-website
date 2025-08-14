import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Languages, ArrowRight, CheckCircle } from 'lucide-react';
import { LANGUAGES, Language } from './LanguageSelector';
import { toast } from 'sonner';

interface QuickTranslationCopyProps {
  translations: Record<string, any>;
  onTranslationUpdate: (language: Language, updates: Record<string, any>) => void;
  className?: string;
}

export const QuickTranslationCopy: React.FC<QuickTranslationCopyProps> = ({
  translations,
  onTranslationUpdate,
  className = ''
}) => {
  const [fromLanguage, setFromLanguage] = useState<Language>('zh-Hant');
  const [toLanguage, setToLanguage] = useState<Language>('zh-Hans');
  const [isCopying, setIsCopying] = useState(false);

  const getAvailableLanguages = () => {
    return LANGUAGES.filter(lang => {
      const langData = translations[lang.code];
      return langData && Object.keys(langData).length > 0;
    });
  };

  const getEmptyLanguages = () => {
    return LANGUAGES.filter(lang => {
      const langData = translations[lang.code];
      return !langData || Object.keys(langData).length === 0;
    });
  };

  const handleCopyTranslation = async () => {
    if (fromLanguage === toLanguage) {
      toast.error('源语言和目标语言不能相同');
      return;
    }

    const sourceData = translations[fromLanguage];
    if (!sourceData || Object.keys(sourceData).length === 0) {
      toast.error('源语言没有可复制的内容');
      return;
    }

    setIsCopying(true);

    try {
      // Copy all fields from source language to target language
      const updates: Record<string, any> = {};
      Object.keys(sourceData).forEach(field => {
        updates[field] = sourceData[field];
      });

      onTranslationUpdate(toLanguage, updates);

      toast.success(`已从 ${LANGUAGES.find(l => l.code === fromLanguage)?.nativeName} 复制到 ${LANGUAGES.find(l => l.code === toLanguage)?.nativeName}`);

      // Auto-translate if target language is not English
      if (toLanguage !== 'en') {
        await autoTranslateContent(toLanguage, updates);
      }
    } catch (error) {
      console.error('Error copying translation:', error);
      toast.error('复制翻译时出错');
    } finally {
      setIsCopying(false);
    }
  };

  const autoTranslateContent = async (targetLang: Language, content: Record<string, any>) => {
    try {
      // Simple auto-translation using Google Translate API (if available)
      // This is a placeholder - you can integrate with your translation service
      const translatedUpdates: Record<string, any> = {};
      
      for (const [field, value] of Object.entries(content)) {
        if (typeof value === 'string' && value.trim()) {
          // For now, just copy the content as-is
          // In production, you would call your translation service here
          translatedUpdates[field] = `[${targetLang.toUpperCase()}] ${value}`;
        } else if (Array.isArray(value)) {
          translatedUpdates[field] = value.map(item => 
            typeof item === 'string' ? `[${targetLang.toUpperCase()}] ${item}` : item
          );
        } else {
          translatedUpdates[field] = value;
        }
      }

      onTranslationUpdate(targetLang, translatedUpdates);
      toast.success(`已为 ${LANGUAGES.find(l => l.code === targetLang)?.nativeName} 生成翻译草稿`);
    } catch (error) {
      console.error('Error auto-translating:', error);
      toast.error('自动翻译时出错');
    }
  };

  const handleBulkCopy = async () => {
    const sourceData = translations[fromLanguage];
    if (!sourceData || Object.keys(sourceData).length === 0) {
      toast.error('源语言没有可复制的内容');
      return;
    }

    const emptyLanguages = getEmptyLanguages();
    if (emptyLanguages.length === 0) {
      toast.error('没有需要翻译的语言');
      return;
    }

    setIsCopying(true);

    try {
      for (const targetLang of emptyLanguages) {
        if (targetLang.code === fromLanguage) continue;

        const updates: Record<string, any> = {};
        Object.keys(sourceData).forEach(field => {
          updates[field] = sourceData[field];
        });

        onTranslationUpdate(targetLang.code as Language, updates);

        // Auto-translate for non-English languages
        if (targetLang.code !== 'en') {
          await autoTranslateContent(targetLang.code as Language, updates);
        }
      }

      toast.success(`已为 ${emptyLanguages.length} 种语言生成翻译草稿`);
    } catch (error) {
      console.error('Error bulk copying:', error);
      toast.error('批量复制时出错');
    } finally {
      setIsCopying(false);
    }
  };

  const availableLanguages = getAvailableLanguages();
  const emptyLanguages = getEmptyLanguages();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Languages className="h-5 w-5" />
          快速翻译复制
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="from-language">源语言</Label>
            <Select value={fromLanguage} onValueChange={(value) => setFromLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue placeholder="选择源语言" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          <div>
            <Label htmlFor="to-language">目标语言</Label>
            <Select value={toLanguage} onValueChange={(value) => setToLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标语言" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleCopyTranslation} 
            disabled={isCopying || fromLanguage === toLanguage}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {isCopying ? '复制中...' : '复制翻译'}
          </Button>

          {emptyLanguages.length > 0 && (
            <Button 
              onClick={handleBulkCopy} 
              disabled={isCopying || availableLanguages.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isCopying ? '批量复制中...' : `批量复制到 ${emptyLanguages.length} 种语言`}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• 复制会保留所有字段内容</p>
          <p>• 非英语语言会自动生成翻译草稿</p>
          <p>• 批量复制会为所有空语言生成内容</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTranslationCopy; 