import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WebsiteText {
  id: string;
  key: string;
  section: string;
  language: string;
  value: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' }
];

const WebsiteTextManager = () => {
  const [texts, setTexts] = useState<WebsiteText[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('zh-Hant');
  const [edited, setEdited] = useState<{ [id: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<{ [section: string]: boolean }>({});

  useEffect(() => {
    fetchTexts();
    // eslint-disable-next-line
  }, [language]);

  const fetchTexts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('website_texts')
      .select('*')
      .eq('language', language)
      .order('section', { ascending: true });
    if (!error) setTexts(data || []);
    setLoading(false);
  };

  const handleEdit = (id: string, value: string) => {
    setEdited((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    const newValue = edited[id];
    const { error } = await supabase
      .from('website_texts')
      .update({ value: newValue })
      .eq('id', id);
    if (!error) {
      setTexts((prev) => prev.map(t => t.id === id ? { ...t, value: newValue } : t));
      setEdited((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
    }
    setSaving(false);
  };

  const filteredTexts = texts.filter(t =>
    t.key.toLowerCase().includes(search.toLowerCase()) ||
    t.value.toLowerCase().includes(search.toLowerCase()) ||
    t.section.toLowerCase().includes(search.toLowerCase())
  );

  // Group by section
  const grouped = filteredTexts.reduce((acc, t) => {
    if (!acc[t.section]) acc[t.section] = [];
    acc[t.section].push(t);
    return acc;
  }, {} as { [section: string]: WebsiteText[] });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Website Text Manager</h1>
          <p className="text-primary-foreground/80 mb-2">Edit all text on the website, including titles, captions, filter labels, and body content. Changes are live.</p>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by key, value, or section..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-96"
            />
          </div>
          <div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          Object.entries(grouped).map(([section, items]) => (
            <Card key={section} className="mb-8">
              <CardHeader>
                <button
                  className="flex items-center w-full text-left focus:outline-none"
                  onClick={() => toggleSection(section)}
                  aria-expanded={!!expanded[section]}
                >
                  {expanded[section] ? (
                    <ChevronDown className="h-5 w-5 mr-2" />
                  ) : (
                    <ChevronRight className="h-5 w-5 mr-2" />
                  )}
                  <CardTitle>{section}</CardTitle>
                </button>
              </CardHeader>
              {expanded[section] && (
                <CardContent className="space-y-4">
                  {items.map(t => (
                    <div key={t.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="w-full md:w-1/4 text-muted-foreground text-xs md:text-sm font-mono break-all">{t.key}</div>
                      <Input
                        value={edited[t.id] !== undefined ? edited[t.id] : t.value}
                        onChange={e => handleEdit(t.id, e.target.value)}
                        className="flex-1"
                      />
                      {edited[t.id] !== undefined && (
                        <Button size="sm" onClick={() => handleSave(t.id)} disabled={saving} className="bg-primary hover:bg-primary-hover">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WebsiteTextManager; 