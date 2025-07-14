import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Globe, FileText, Home, Users, Package, Building, Newspaper, Phone, MessageSquare, Settings, Image, BookOpen, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface WebsiteText {
  key: string;
  section: string;
  language: Language;
  value: string;
}

interface TextField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'long-text';
  required?: boolean;
}

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
];

const SECTIONS = [
  { 
    id: 'navigation', 
    name: 'Navigation Menu', 
    icon: <FileText className="h-5 w-5" />,
    description: 'Edit the main navigation menu items that appear at the top of every page'
  },
  { 
    id: 'home', 
    name: 'Home Page', 
    icon: <Home className="h-5 w-5" />,
    description: 'Edit all text content on the main homepage including hero section, services, and featured content'
  },
  { 
    id: 'about', 
    name: 'About Page', 
    icon: <Users className="h-5 w-5" />,
    description: 'Edit company information, mission statement, and leadership team details'
  },
  { 
    id: 'products', 
    name: 'Products', 
    icon: <Package className="h-5 w-5" />,
    description: 'Edit product categories, descriptions, and technical specifications'
  },
  { 
    id: 'projects', 
    name: 'Projects', 
    icon: <Building className="h-5 w-5" />,
    description: 'Edit project showcase content and case study descriptions'
  },
  { 
    id: 'articles', 
    name: 'Articles & News', 
    icon: <Newspaper className="h-5 w-5" />,
    description: 'Edit article categories, titles, and content descriptions'
  },
  { 
    id: 'contact', 
    name: 'Contact Page', 
    icon: <Phone className="h-5 w-5" />,
    description: 'Edit contact form labels, office information, and contact details'
  },
  { 
    id: 'footer', 
    name: 'Footer', 
    icon: <FileText className="h-5 w-5" />,
    description: 'Edit footer links, company information, and contact details'
  },
  { 
    id: 'chatbot', 
    name: 'AI Chatbot', 
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Edit chatbot welcome messages and response templates'
  },
  { 
    id: 'common', 
    name: 'Common UI Elements', 
    icon: <Settings className="h-5 w-5" />,
    description: 'Edit buttons, labels, and common interface elements used throughout the site'
  },
  { 
    id: 'media', 
    name: 'Media & Resources', 
    icon: <Image className="h-5 w-5" />,
    description: 'Edit media gallery descriptions and resource page content'
  },
  { 
    id: 'resources', 
    name: 'Resources', 
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Edit resource page content, guides, and documentation'
  }
];

// Define text fields for each section with descriptions
const TEXT_FIELDS: Record<string, TextField[]> = {
  navigation: [
    {
      key: 'nav.home',
      label: 'Home Menu Item',
      description: 'The text that appears in the navigation menu for the Home page',
      placeholder: 'Enter the home menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.about',
      label: 'About Menu Item',
      description: 'The text that appears in the navigation menu for the About page',
      placeholder: 'Enter the about menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.products',
      label: 'Products Menu Item',
      description: 'The text that appears in the navigation menu for the Products page',
      placeholder: 'Enter the products menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.projects',
      label: 'Projects Menu Item',
      description: 'The text that appears in the navigation menu for the Projects page',
      placeholder: 'Enter the projects menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.articles',
      label: 'Articles Menu Item',
      description: 'The text that appears in the navigation menu for the Articles page',
      placeholder: 'Enter the articles menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.guide',
      label: 'User Guide Menu Item',
      description: 'The text that appears in the navigation menu for the User Guide page',
      placeholder: 'Enter the user guide menu text...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.contact',
      label: 'Contact Menu Item',
      description: 'The text that appears in the navigation menu for the Contact page',
      placeholder: 'Enter the contact menu text...',
      type: 'text',
      required: true
    }
  ],
  home: [
    {
      key: 'home.hero.title',
      label: 'Main Hero Title',
      description: 'The large main title that appears at the top of the homepage',
      placeholder: 'Enter the main hero title...',
      type: 'text',
      required: true
    },
    {
      key: 'home.hero.subtitle',
      label: 'Hero Subtitle',
      description: 'The subtitle that appears below the main hero title',
      placeholder: 'Enter the hero subtitle...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.hero.aboutBtn',
      label: 'About Us Button',
      description: 'The text on the button that links to the About page',
      placeholder: 'Enter the about us button text...',
      type: 'text',
      required: true
    },
    {
      key: 'home.hero.companyProfileBtn',
      label: 'Company Profile Button',
      description: 'The text on the button that downloads the company profile PDF',
      placeholder: 'Enter the company profile button text...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.title',
      label: 'Mission Statement Title',
      description: 'The title for the mission statement section',
      placeholder: 'Enter the mission statement title...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.paragraph1',
      label: 'Mission Statement - First Paragraph',
      description: 'The first paragraph of the company mission statement',
      placeholder: 'Enter the first paragraph of the mission statement...',
      type: 'long-text',
      required: true
    },
    {
      key: 'home.mission.paragraph2',
      label: 'Mission Statement - Second Paragraph',
      description: 'The second paragraph of the company mission statement',
      placeholder: 'Enter the second paragraph of the mission statement...',
      type: 'long-text',
      required: true
    },
    {
      key: 'home.services.title',
      label: 'Services Section Title',
      description: 'The title for the services section on the homepage',
      placeholder: 'Enter the services section title...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.subtitle',
      label: 'Services Section Subtitle',
      description: 'The subtitle for the services section',
      placeholder: 'Enter the services section subtitle...',
      type: 'textarea',
      required: true
    }
  ],
  about: [
    {
      key: 'about.title',
      label: 'About Page Title',
      description: 'The main title that appears at the top of the About page',
      placeholder: 'Enter the about page title...',
      type: 'text',
      required: true
    },
    {
      key: 'about.p1',
      label: 'About Paragraph 1',
      description: 'The first paragraph describing the company',
      placeholder: 'Enter the first about paragraph...',
      type: 'long-text',
      required: true
    },
    {
      key: 'about.p2',
      label: 'About Paragraph 2',
      description: 'The second paragraph describing the company',
      placeholder: 'Enter the second about paragraph...',
      type: 'long-text',
      required: true
    },
    {
      key: 'about.p3',
      label: 'About Paragraph 3',
      description: 'The third paragraph describing the company',
      placeholder: 'Enter the third about paragraph...',
      type: 'long-text',
      required: true
    },
    {
      key: 'about.p4',
      label: 'About Paragraph 4',
      description: 'The fourth paragraph describing the company',
      placeholder: 'Enter the fourth about paragraph...',
      type: 'long-text',
      required: true
    },
    {
      key: 'about.p5',
      label: 'About Paragraph 5',
      description: 'The fifth paragraph describing the company',
      placeholder: 'Enter the fifth about paragraph...',
      type: 'long-text',
      required: true
    },
    {
      key: 'about.videoBtn',
      label: 'Watch Video Button',
      description: 'The text on the button that opens the company video',
      placeholder: 'Enter the watch video button text...',
      type: 'text',
      required: true
    },
    {
      key: 'about.pdfBtn',
      label: 'Download PDF Button',
      description: 'The text on the button that downloads the company profile PDF',
      placeholder: 'Enter the download PDF button text...',
      type: 'text',
      required: true
    }
  ],
  contact: [
    {
      key: 'contact.info.hours.days',
      label: 'Business Hours',
      description: 'The text showing business operating days',
      placeholder: 'Enter business hours text...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.address.title',
      label: 'Address Label',
      description: 'The label for the address field',
      placeholder: 'Enter the address label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.address.value',
      label: 'Office Address',
      description: 'The complete office address',
      placeholder: 'Enter the office address...',
      type: 'textarea',
      required: true
    },
    {
      key: 'contact.info.email.title',
      label: 'Email Label',
      description: 'The label for the email field',
      placeholder: 'Enter the email label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.email.value',
      label: 'Contact Email',
      description: 'The company contact email address',
      placeholder: 'Enter the contact email...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.title',
      label: 'Contact Form Title',
      description: 'The title for the contact form section',
      placeholder: 'Enter the contact form title...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.firstName',
      label: 'First Name Label',
      description: 'The label for the first name input field',
      placeholder: 'Enter the first name label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.lastName',
      label: 'Last Name Label',
      description: 'The label for the last name input field',
      placeholder: 'Enter the last name label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.company',
      label: 'Company Label',
      description: 'The label for the company input field',
      placeholder: 'Enter the company label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.email',
      label: 'Email Label',
      description: 'The label for the email input field',
      placeholder: 'Enter the email label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.phone',
      label: 'Phone Label',
      description: 'The label for the phone input field',
      placeholder: 'Enter the phone label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.subject',
      label: 'Subject Label',
      description: 'The label for the subject input field',
      placeholder: 'Enter the subject label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.message',
      label: 'Message Label',
      description: 'The label for the message textarea field',
      placeholder: 'Enter the message label...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.submit',
      label: 'Submit Button',
      description: 'The text on the submit button',
      placeholder: 'Enter the submit button text...',
      type: 'text',
      required: true
    }
  ],
  footer: [
    {
      key: 'footer.contact.title',
      label: 'Contact Section Title',
      description: 'The title for the contact section in the footer',
      placeholder: 'Enter the contact section title...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.phone',
      label: 'Phone Label',
      description: 'The label for the phone number in the footer',
      placeholder: 'Enter the phone label...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.phone.value',
      label: 'Phone Number',
      description: 'The company phone number displayed in the footer',
      placeholder: 'Enter the phone number...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.hours',
      label: 'Hours Label',
      description: 'The label for business hours in the footer',
      placeholder: 'Enter the hours label...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.hours.value',
      label: 'Business Hours',
      description: 'The business hours displayed in the footer',
      placeholder: 'Enter the business hours...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.address',
      label: 'Address Label',
      description: 'The label for the address in the footer',
      placeholder: 'Enter the address label...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.address.value',
      label: 'Office Address',
      description: 'The office address displayed in the footer',
      placeholder: 'Enter the office address...',
      type: 'textarea',
      required: true
    },
    {
      key: 'footer.contact.email',
      label: 'Email Label',
      description: 'The label for the email in the footer',
      placeholder: 'Enter the email label...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contact.email.value',
      label: 'Contact Email',
      description: 'The contact email displayed in the footer',
      placeholder: 'Enter the contact email...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.company.title',
      label: 'Company Section Title',
      description: 'The title for the company links section in the footer',
      placeholder: 'Enter the company section title...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.company.about',
      label: 'About Us Link',
      description: 'The text for the About Us link in the footer',
      placeholder: 'Enter the about us link text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.company.products',
      label: 'Products Link',
      description: 'The text for the Products link in the footer',
      placeholder: 'Enter the products link text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.company.projects',
      label: 'Projects Link',
      description: 'The text for the Projects link in the footer',
      placeholder: 'Enter the projects link text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.connect.title',
      label: 'Connect Section Title',
      description: 'The title for the connect section in the footer',
      placeholder: 'Enter the connect section title...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.connect.privacy',
      label: 'Privacy Policy Link',
      description: 'The text for the Privacy Policy link in the footer',
      placeholder: 'Enter the privacy policy link text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.connect.terms',
      label: 'Terms of Service Link',
      description: 'The text for the Terms of Service link in the footer',
      placeholder: 'Enter the terms of service link text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.copyright',
      label: 'Copyright Text',
      description: 'The copyright notice displayed in the footer',
      placeholder: 'Enter the copyright text...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.tagline',
      label: 'Company Tagline',
      description: 'The company tagline displayed in the footer',
      placeholder: 'Enter the company tagline...',
      type: 'text',
      required: true
    }
  ],
  chatbot: [
    {
      key: 'chatbot.welcome',
      label: 'Welcome Message',
      description: 'The initial greeting message when users open the chatbot',
      placeholder: 'Enter the chatbot welcome message...',
      type: 'long-text',
      required: true
    },
    {
      key: 'chatbot.title',
      label: 'Chatbot Title',
      description: 'The title displayed in the chatbot interface',
      placeholder: 'Enter the chatbot title...',
      type: 'text',
      required: true
    },
    {
      key: 'chatbot.subtitle',
      description: 'The subtitle displayed in the chatbot interface',
      label: 'Chatbot Subtitle',
      placeholder: 'Enter the chatbot subtitle...',
      type: 'text',
      required: true
    },
    {
      key: 'chatbot.placeholder',
      label: 'Input Placeholder',
      description: 'The placeholder text in the chatbot input field',
      placeholder: 'Enter the input placeholder text...',
      type: 'text',
      required: true
    },
    {
      key: 'chatbot.send',
      label: 'Send Button',
      description: 'The text on the send button in the chatbot',
      placeholder: 'Enter the send button text...',
      type: 'text',
      required: true
    }
  ],
  common: [
    {
      key: 'ui.viewMore',
      label: 'View More Button',
      description: 'The text for "View More" buttons used throughout the site',
      placeholder: 'Enter the view more button text...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.backToProducts',
      label: 'Back to Products Button',
      description: 'The text for the "Back to Products" button',
      placeholder: 'Enter the back to products button text...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.contactUs',
      label: 'Contact Us Button',
      description: 'The text for "Contact Us" buttons used throughout the site',
      placeholder: 'Enter the contact us button text...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.viewSpecs',
      label: 'View Specifications Button',
      description: 'The text for "View Specifications" buttons',
      placeholder: 'Enter the view specifications button text...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.relatedProducts',
      label: 'Related Products Title',
      description: 'The title for the related products section',
      placeholder: 'Enter the related products title...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.loadingRelatedProducts',
      label: 'Loading Related Products',
      description: 'The text shown while loading related products',
      placeholder: 'Enter the loading text...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.selectRelatedProducts',
      label: 'Select Related Products',
      description: 'The text for the related products selection interface',
      placeholder: 'Enter the select related products text...',
      type: 'text',
      required: true
    }
  ]
};

function WebsiteTextEditor() {
  const [texts, setTexts] = useState<WebsiteText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('navigation');

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching texts:', error);
        toast({
          title: "Error",
          description: "Failed to load website texts",
          variant: "destructive",
        });
      } else {
        setTexts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load website texts",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleTextChange = (key: string, value: string) => {
    setTexts(prev => 
      prev.map(text => 
        text.key === key && text.language === selectedLanguage 
          ? { ...text, value } 
          : text
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const textsToSave = texts.filter(text => text.language === selectedLanguage);
      
      const { error } = await supabase
        .from('website_texts')
        .upsert(textsToSave, { onConflict: 'key,language' });

      if (error) {
        console.error('Error saving texts:', error);
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "All changes saved successfully!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const getTextValue = (key: string) => {
    const text = texts.find(t => t.key === key && t.language === selectedLanguage);
    return text?.value || '';
  };

  const renderTextField = (field: TextField) => {
    const value = getTextValue(field.key);
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              {field.required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {field.description}
            </p>
            {field.type === 'text' && (
              <Input
                value={value}
                onChange={(e) => handleTextChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full"
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                value={value}
                onChange={(e) => handleTextChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-[80px]"
              />
            )}
            {field.type === 'long-text' && (
              <Textarea
                value={value}
                onChange={(e) => handleTextChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-[120px]"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading website texts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Website Text Manager</h1>
              <p className="text-primary-foreground/80">
                Edit every piece of text on your website. Organized by pages and sections for easy management.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Use This Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Select a language from the dropdown to edit text for that specific language</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Use the tabs below to navigate between different sections of your website</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Each field includes a description explaining where the text appears on your website</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Click "Save All Changes" to update your website with the new text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
              {SECTIONS.map(section => (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                  {section.icon}
                  <span className="hidden lg:inline">{section.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {SECTIONS.map(section => (
              <TabsContent key={section.id} value={section.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {section.icon}
                      {section.name}
                    </CardTitle>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {TEXT_FIELDS[section.id] ? (
                      TEXT_FIELDS[section.id].map(field => renderTextField(field))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No text fields defined for this section yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default WebsiteTextEditor; 