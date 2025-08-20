import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Upload, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Building,
  User,
  MessageSquare,
  FileText,
  Download,
  Sparkles,
  Lightbulb,
  Target
} from 'lucide-react';

interface FormData {
  inquiryType: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  productInterest: string;
  projectType: string;
  budget: string;
  timeline: string;
  attachments: File[];
}

interface ValidationErrors {
  [key: string]: string;
}

const NewContact: React.FC = () => {
  const { t } = useTranslation();
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('NewContact page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);
  
  const [formData, setFormData] = useState<FormData>({
    inquiryType: '',
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    productInterest: '',
    projectType: '',
    budget: '',
    timeline: '',
    attachments: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [officeHours, setOfficeHours] = useState({
    isOpen: true,
    nextOpen: '09:00',
    responseTime: '2-4 hours'
  });

  // Auto-complete suggestions
  const companySuggestions = [
    'ABC Construction Co.',
    'XYZ Engineering Ltd.',
    'Modern Builders Inc.',
    'Green Development Corp.',
    'Urban Architects Group'
  ];

  const productSuggestions = [
    'Epoxy Floor Coatings',
    'Waterproofing Systems',
    'Sealant & Adhesive',
    'Industrial Flooring',
    'Acoustic Solutions'
  ];

  // Calculate response time based on inquiry type and current time
  const calculateResponseTime = (inquiryType: string): string => {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    if (isWeekend) {
      return 'Next business day';
    }
    
    if (hour < 9 || hour >= 17) {
      return 'Next business day';
    }
    
    switch (inquiryType) {
      case 'sales':
        return '2-4 hours';
      case 'support':
        return '1-2 hours';
      case 'general':
        return '4-6 hours';
      default:
        return '2-4 hours';
    }
  };

  // Update response time when inquiry type changes
  useEffect(() => {
    if (formData.inquiryType) {
      setOfficeHours(prev => ({
        ...prev,
        responseTime: calculateResponseTime(formData.inquiryType)
      }));
    }
  }, [formData.inquiryType]);

  // Real-time validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/\s/g, '')) ? '' : 'Please enter a valid phone number';
      
      case 'name':
        return value.length >= 2 ? '' : 'Name must be at least 2 characters';
      
      case 'message':
        return value.length >= 10 ? '' : 'Message must be at least 10 characters';
      
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'attachments') {
        const error = validateField(key, formData[key as keyof FormData] as string);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        inquiryType: '',
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        productInterest: '',
        projectType: '',
        budget: '',
        timeline: '',
        attachments: []
      });
      setErrors({});
    }, 5000);
  };

  // Get form fields based on inquiry type
  const getFormFields = () => {
    const baseFields = ['name', 'email', 'company', 'phone', 'subject', 'message'];
    
    switch (formData.inquiryType) {
      case 'sales':
        return [...baseFields, 'productInterest', 'budget', 'timeline'];
      case 'support':
        return [...baseFields, 'productInterest', 'projectType'];
      case 'general':
        return baseFields;
      default:
        return baseFields;
    }
  };

  const isFieldVisible = (fieldName: string) => {
    return getFormFields().includes(fieldName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-[#F5E6D3]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
                          <h1 className="text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Smart Contact Form
                </CardTitle>
                <p className="text-gray-600">
                  Tell us about your inquiry and we'll customize the form to help you better
                </p>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you! Your message has been sent successfully. We'll respond within {officeHours.responseTime}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Query Type Selector */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        What type of inquiry do you have?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'sales', label: 'Sales Inquiry', icon: Building, desc: 'Product quotes and pricing' },
                          { id: 'support', label: 'Technical Support', icon: MessageSquare, desc: 'Technical assistance' },
                          { id: 'general', label: 'General Question', icon: FileText, desc: 'General information' }
                        ].map((type) => (
                          <div
                            key={type.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.inquiryType === type.id
                                                ? 'border-primary bg-primary-muted'
                : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                            onClick={() => handleInputChange('inquiryType', type.id)}
                          >
                            <div className="flex items-center gap-3">
                              <type.icon className="w-5 h-5 text-[rgba(238,50,57,1)]" />
                              <div>
                                <h3 className="font-medium text-foreground">{type.label}</h3>
                                <p className="text-sm text-gray-600">{type.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.inquiryType && (
                      <>
                        <Separator />
                        
                        {/* Dynamic Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {isFieldVisible('name') && (
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Full Name *
                              </label>
                              <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                className={`border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)] ${errors.name ? 'border-red-500' : ''}`}
                              />
                              {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                              )}
                            </div>
                          )}

                          {isFieldVisible('email') && (
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address *
                              </label>
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="your.email@company.com"
                                className={`border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)] ${errors.email ? 'border-red-500' : ''}`}
                              />
                              {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                              )}
                            </div>
                          )}

                          {isFieldVisible('company') && (
                            <div>
                              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                                Company
                              </label>
                              <Input
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                placeholder="Your company name"
                                list="company-suggestions"
                                className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]"
                              />
                              <datalist id="company-suggestions">
                                {companySuggestions.map((company) => (
                                  <option key={company} value={company} />
                                ))}
                              </datalist>
                            </div>
                          )}

                          {isFieldVisible('phone') && (
                            <div>
                              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                                Phone Number
                              </label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className={`border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)] ${errors.phone ? 'border-red-500' : ''}`}
                              />
                              {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {isFieldVisible('subject') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Subject *
                            </label>
                            <Input
                              value={formData.subject}
                              onChange={(e) => handleInputChange('subject', e.target.value)}
                              placeholder="Brief description of your inquiry"
                              className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]"
                            />
                          </div>
                        )}

                        {/* Conditional Fields */}
                        {isFieldVisible('productInterest') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Product Interest
                            </label>
                            <Select value={formData.productInterest} onValueChange={(value) => handleInputChange('productInterest', value)}>
                              <SelectTrigger className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]">
                                <SelectValue placeholder="Select a product category" />
                              </SelectTrigger>
                              <SelectContent>
                                {productSuggestions.map((product) => (
                                  <SelectItem key={product} value={product}>
                                    {product}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {isFieldVisible('projectType') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Project Type
                            </label>
                            <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                              <SelectTrigger className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]">
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {isFieldVisible('budget') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Budget Range
                            </label>
                            <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                              <SelectTrigger className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]">
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-10k">Under $10,000</SelectItem>
                                <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                                <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                                <SelectItem value="over-100k">Over $100,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {isFieldVisible('timeline') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Project Timeline
                            </label>
                            <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                              <SelectTrigger className="border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)]">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="1-3months">1-3 months</SelectItem>
                                <SelectItem value="3-6months">3-6 months</SelectItem>
                                <SelectItem value="6months+">6+ months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {isFieldVisible('message') && (
                          <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                              Message *
                            </label>
                            <Textarea
                              value={formData.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              placeholder="Please provide details about your inquiry..."
                              rows={5}
                              className={`border-gray-200 focus:border-[rgba(238,50,57,1)] focus:ring-[rgba(238,50,57,0.2)] ${errors.message ? 'border-red-500' : ''}`}
                            />
                            {errors.message && (
                              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                            )}
                          </div>
                        )}

                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                            Attachments (Optional)
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              dragActive ? 'border-primary bg-primary-muted' : 'border-gray-300 hover:border-primary/50'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">
                              Drag and drop files here, or{' '}
                              <label className="text-[rgba(238,50,57,1)] hover:text-[rgba(238,50,57,0.85)] cursor-pointer">
                                browse
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e.target.files)}
                                />
                              </label>
                            </p>
                            <p className="text-sm text-gray-500">
                              PDF, DOC, JPG, PNG up to 10MB each
                            </p>
                          </div>
                          
                          {formData.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {formData.attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-primary hover:bg-primary-muted"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-sm text-gray-600">
                            Expected response time: <span className="font-medium text-[rgba(238,50,57,1)]">{officeHours.responseTime}</span>
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Contact Sidebar */}
          <div className="space-y-6">
            {/* Office Hours */}
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1E3A8A]">
                  <Clock className="w-5 h-5 text-primary" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monday - Friday</span>
                  <span className="text-sm font-medium text-[#1E3A8A]">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saturday</span>
                  <span className="text-sm font-medium text-[#1E3A8A]">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sunday</span>
                  <span className="text-sm font-medium text-[#1E3A8A]">Closed</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${officeHours.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-[#1E3A8A]">
                    {officeHours.isOpen ? 'Currently Open' : 'Currently Closed'}
                  </span>
                </div>
                
                <div className="bg-primary-muted p-3 rounded-lg">
                  <p className="text-sm text-primary">
                    <strong>Response Time:</strong> {officeHours.responseTime}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Direct Contact Options */}
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1E3A8A]">Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-[#1E3A8A]">Call Us</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-[#1E3A8A]">Email Us</p>
                    <p className="text-sm text-gray-600">info@aftek.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-[#1E3A8A]">Visit Us</p>
                    <p className="text-sm text-gray-600">123 Business Ave, Suite 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Resources */}
            <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1E3A8A]">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary-muted">
                  <Download className="w-4 h-4 mr-2" />
                  Product Catalog
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary-muted">
                  <Download className="w-4 h-4 mr-2" />
                  Technical Specifications
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary-muted">
                  <Download className="w-4 h-4 mr-2" />
                  Installation Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContact; 