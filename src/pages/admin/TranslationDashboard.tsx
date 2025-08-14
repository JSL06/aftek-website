import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Languages, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  ArrowLeft,
  FileText,
  Settings,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  performTranslationAudit, 
  exportCompleteTranslations, 
  validateTranslations,
  getTranslationStats,
  type Language 
} from '@/utils/translationAudit';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslationStatus {
  complete: number;
  missing: number;
  autoTranslated: number;
  total: number;
  coverage: number;
}

interface TranslationAuditResult {
  translationStatus: { [K in Language]: TranslationStatus };
  missingKeys: string[];
  hardcodedText: Array<{
    file: string;
    line: number;
    text: string;
    suggestedKey: string;
  }>;
  duplicateKeys: string[];
  inconsistentTranslations: Array<{
    key: string;
    languages: Language[];
    values: string[];
  }>;
  recommendations: string[];
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
];

const TranslationDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [auditResult, setAuditResult] = useState<TranslationAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    performAudit();
  }, []);

  const performAudit = async () => {
    setLoading(true);
    try {
      const result = await performTranslationAudit();
      setAuditResult(result);
      
      // Also perform validation
      const validation = validateTranslations();
      setValidationResult(validation);
    } catch (error) {
      console.error('Error performing translation audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await performAudit();
    setRefreshing(false);
  };

  const handleExportTranslations = async () => {
    try {
      const completeTranslations = await exportCompleteTranslations();
      
      // Create downloadable file
      const dataStr = JSON.stringify(completeTranslations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'complete-translations.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting translations:', error);
    }
  };

  const getLanguageStatus = (language: Language) => {
    if (!auditResult) return null;
    return auditResult.translationStatus[language];
  };

  const getStatusColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-600';
    if (coverage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (coverage: number) => {
    if (coverage >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (coverage >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const handleEditTranslation = (key: string, language: Language) => {
    // Navigate to WebsiteTextEditor with the specific key and language
    const section = key.split('.')[0]; // Extract section from key (e.g., 'nav' from 'nav.home')
    navigate(`/admin/website-text-editor?key=${encodeURIComponent(key)}&language=${language}&section=${section}&highlight=true`);
  };

  const handleQuickEdit = (key: string) => {
    // Navigate to WebsiteTextEditor with the key and current selected language
    const section = key.split('.')[0]; // Extract section from key (e.g., 'nav' from 'nav.home')
    navigate(`/admin/website-text-editor?key=${encodeURIComponent(key)}&language=${selectedLanguage}&section=${section}&highlight=true`);
  };

  // Get missing translations for a specific language
  const getMissingTranslationsForLanguage = (language: Language) => {
    if (!auditResult) return [];
    
    const allKeys = auditResult.missingKeys;
    const missingForLanguage: string[] = [];
    
    allKeys.forEach(key => {
      // Check if this key is missing in the specific language
      const status = auditResult.translationStatus[language];
      if (status && status.missing > 0) {
        // This is a simplified check - in a real implementation, you'd need to check each key individually
        missingForLanguage.push(key);
      }
    });
    
    return missingForLanguage;
  };

  const filteredMissingKeys = auditResult?.missingKeys.filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading translation audit...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/admin/dashboard">
                <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Translation Dashboard</h1>
              <p className="text-primary-foreground/80 mt-2">Monitor and manage translations across all languages</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="secondary"
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleExportTranslations}
                variant="secondary"
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Languages</p>
                  <p className="text-2xl font-bold">{LANGUAGES.length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                  <p className="text-2xl font-bold">{auditResult?.missingKeys.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Missing Keys</p>
                  <p className="text-2xl font-bold text-red-600">{auditResult?.missingKeys.length || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(auditResult?.duplicateKeys.length || 0) + (auditResult?.inconsistentTranslations.length || 0)}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Coverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {LANGUAGES.map(language => {
            const status = getLanguageStatus(language.code as Language);
            if (!status) return null;

            return (
              <Card key={language.code} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{language.flag}</div>
                    {getStatusIcon(status.coverage)}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{language.nativeName}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{language.name}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coverage</span>
                      <span className={getStatusColor(status.coverage)}>{status.coverage}%</span>
                    </div>
                    <Progress value={status.coverage} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="text-green-600">✓ {status.complete}</span>
                      </div>
                      <div>
                        <span className="text-red-600">✗ {status.missing}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="missing">Missing Keys</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Translation Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {LANGUAGES.map(language => {
                    const status = getLanguageStatus(language.code as Language);
                    if (!status) return null;

                    return (
                      <div key={language.code} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{language.flag}</span>
                          <div>
                            <h4 className="font-medium">{language.nativeName}</h4>
                            <p className="text-sm text-muted-foreground">{status.total} total keys</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status.coverage)}
                            <span className={`font-semibold ${getStatusColor(status.coverage)}`}>
                              {status.coverage}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {status.complete} complete, {status.missing} missing
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Missing Translation Keys
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search missing keys..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                  </div>
                  <Badge variant="secondary">
                    {filteredMissingKeys.length} keys
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Language-specific missing translations */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Missing Translations by Language</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {LANGUAGES.map(language => {
                        const missingKeys = getMissingTranslationsForLanguage(language.code as Language);
                        if (missingKeys.length === 0) return null;
                        
                        return (
                          <Card key={language.code} className="border-orange-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{language.flag}</span>
                                <div>
                                  <CardTitle className="text-sm">{language.nativeName}</CardTitle>
                                  <p className="text-xs text-muted-foreground">{missingKeys.length} missing keys</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {missingKeys.slice(0, 5).map(key => (
                                  <div key={key} className="flex items-center justify-between p-2 bg-orange-50 rounded text-xs">
                                    <span className="truncate flex-1">{key}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="ml-2 h-6 px-2 text-xs"
                                      onClick={() => handleEditTranslation(key, language.code as Language)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                ))}
                                {missingKeys.length > 5 && (
                                  <div className="text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-xs"
                                      onClick={() => {
                                        setSelectedLanguage(language.code as Language);
                                        setSearchTerm('');
                                      }}
                                    >
                                      View all {missingKeys.length} missing keys
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* All missing keys with quick edit */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">All Missing Translation Keys</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMissingKeys.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No missing keys found!
                        </p>
                      ) : (
                        filteredMissingKeys.map(key => (
                          <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium">{key}</p>
                              <p className="text-sm text-muted-foreground">
                                Missing in {LANGUAGES.filter(lang => {
                                  const status = getLanguageStatus(lang.code as Language);
                                  return status && !status.complete;
                                }).length} languages
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleQuickEdit(key)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Quick Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditTranslation(key, 'zh-Hant')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Edit in Traditional Chinese
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Duplicate Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Duplicate Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditResult?.duplicateKeys.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No duplicate keys found!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {auditResult?.duplicateKeys.slice(0, 10).map(key => (
                        <div key={key} className="p-3 border rounded-lg">
                          <p className="font-medium text-red-600">{key}</p>
                          <p className="text-sm text-muted-foreground">Duplicate translation key</p>
                        </div>
                      ))}
                      {auditResult && auditResult.duplicateKeys.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ... and {auditResult.duplicateKeys.length - 10} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inconsistent Translations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Inconsistent Translations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditResult?.inconsistentTranslations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No inconsistent translations found!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {auditResult?.inconsistentTranslations.slice(0, 5).map(item => (
                        <div key={item.key} className="p-3 border rounded-lg">
                          <p className="font-medium">{item.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.languages.length} languages have different values
                          </p>
                        </div>
                      ))}
                      {auditResult && auditResult.inconsistentTranslations.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ... and {auditResult.inconsistentTranslations.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResult?.recommendations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recommendations at this time!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {auditResult?.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TranslationDashboard; 