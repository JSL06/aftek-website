import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  FileText, 
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  User,
  Calendar,
  Upload,
  X
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: string;
  subject: string;
  message: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  attachments: File[];
}

interface OfficeHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

const Contact: React.FC = () => {
  const { t } = useTranslation();
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Contact page: Language changed to:', event.detail);
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    subject: '',
    message: '',
    attachments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseTime, setResponseTime] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Office hours data
  const officeHours: OfficeHours[] = [
    { day: 'Monday', hours: '08:30 - 17:30', isOpen: true },
    { day: 'Tuesday', hours: '08:30 - 17:30', isOpen: true },
    { day: 'Wednesday', hours: '08:30 - 17:30', isOpen: true },
    { day: 'Thursday', hours: '08:30 - 17:30', isOpen: true },
    { day: 'Friday', hours: '08:30 - 17:30', isOpen: true },
    { day: 'Saturday', hours: '09:00 - 12:00', isOpen: false },
    { day: 'Sunday', hours: 'Closed', isOpen: false }
  ];

  const isCurrentlyOpen = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    if (day === 0) return false; // Sunday
    if (day === 6) return currentTime >= 9 * 60 && currentTime <= 12 * 60; // Saturday
    return currentTime >= 8.5 * 60 && currentTime <= 17.5 * 60; // Weekdays
  };

  const calculateResponseTime = (inquiryType: string) => {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isAfterHours = hour < 8 || hour >= 18;

    if (isWeekend || isAfterHours) {
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

  const inquiryTypes = [
    { id: 'sales', label: 'Sales Inquiry', icon: Building, description: 'Product quotes and pricing' },
    { id: 'support', label: 'Technical Support', icon: MessageSquare, description: 'Technical assistance and troubleshooting' },
    { id: 'general', label: 'General Question', icon: FileText, description: 'General information and inquiries' }
  ];

  const projectTypes = [
    'Residential Construction',
    'Commercial Building',
    'Industrial Facility',
    'Infrastructure Project',
    'Renovation',
    'New Construction',
    'Other'
  ];

  const budgetRanges = [
    'Under $10,000',
    '$10,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000 - $500,000',
    'Over $500,000'
  ];

  const timelineOptions = [
    'Immediate',
    'Within 1 month',
    '1-3 months',
    '3-6 months',
    '6+ months'
  ];

  useEffect(() => {
    if (formData.inquiryType) {
      setResponseTime(calculateResponseTime(formData.inquiryType));
    }
  }, [formData.inquiryType]);

  const validateField = (name: Exclude<keyof FormData, 'attachments'>, value: string) => {
    const newErrors: Record<string, string> = { ...errors };
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'firstName':
      case 'lastName':
        if (value && value.length < 2) {
          newErrors[name] = 'Name must be at least 2 characters';
        } else {
          delete newErrors[name];
        }
        break;
      case 'message':
        if (value && value.length < 10) {
          newErrors.message = 'Message must be at least 10 characters';
        } else {
          delete newErrors.message;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (name: Exclude<keyof FormData, 'attachments'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.size <= 10 * 1024 * 1024 && // 10MB limit
        ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      );
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields: (keyof FormData)[] = ['firstName', 'lastName', 'email', 'inquiryType', 'message'];
    const newErrors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    // Handle success - in real app, this would show a success message
    alert('Thank you for your inquiry! We will respond within the estimated time.');
  };

  const renderDynamicFields = () => {
    switch (formData.inquiryType) {
      case 'sales':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map(budget => (
                    <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeline">Project Timeline</Label>
              <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map(timeline => (
                    <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      
      case 'support':
        return (
          <div className="space-y-2">
            <Label htmlFor="subject">Issue Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: 'url(/src/assets/17580.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      {/* Title Section with Special Background */}
      <div 
        className="relative py-16 mb-12"
        style={{
          backgroundImage: 'url(/src/assets/pexels-pixabay-159306.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="uniform-page-title text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {t('contact.title')}
          </h1>
          <p className="text-lg text-white/90 text-center max-w-2xl mt-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            Get in touch with our team for expert consultation and support
          </p>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Smart Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                {/* Query Type Selector */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">What can we help you with?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {inquiryTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.inquiryType === type.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('inquiryType', type.id)}
                      >
                        <div className="flex items-center mb-2">
                          <type.icon className="h-5 w-5 text-primary mr-2" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Time Indicator */}
                {responseTime && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">
                        Typical response time: <span className="font-bold">{responseTime}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Dynamic Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-[#9e1717]' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-[#9e1717] text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-[#9e1717]' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-[#9e1717] text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-[#9e1717]' : ''}
                    />
                    {errors.email && (
                      <p className="text-[#9e1717] text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-[#9e1717]' : ''}
                      />
                      {errors.phone && (
                        <p className="text-[#9e1717] text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Dynamic Fields Based on Inquiry Type */}
                  {formData.inquiryType && renderDynamicFields()}

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={errors.message ? 'border-[#9e1717]' : ''}
                    />
                    {errors.message && (
                      <p className="text-[#9e1717] text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Attachments (Optional)</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer text-primary hover:text-primary/80">
                        Choose files
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 10MB per file. Supported: JPG, PNG, GIF, PDF, DOC
                      </p>
                    </div>
                    
                    {/* File List */}
                    {formData.attachments.length > 0 && (
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quick Contact Sidebar */}
          <div className="space-y-6">
            {/* Office Hours */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Office Hours
                </h3>
                
                <div className="mb-4">
                  <Badge variant={isCurrentlyOpen() ? "default" : "secondary"} className="mb-2">
                    {isCurrentlyOpen() ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {officeHours.map((day) => (
                    <div key={day.day} className="flex justify-between items-center text-sm">
                      <span className={day.isOpen ? 'text-foreground' : 'text-muted-foreground'}>
                        {day.day}
                      </span>
                      <span className={day.isOpen ? 'text-foreground' : 'text-muted-foreground'}>
                        {day.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Direct Contact Options */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Contact</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Call Us</p>
                      <p className="text-sm text-blue-600">02-2799-6558</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">Email Us</p>
                      <p className="text-sm text-green-600">info@aftek.com.tw</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-purple-800">Visit Us</p>
                      <p className="text-sm text-purple-600">Taipei, Taiwan</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Resources */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resources</h3>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Product Catalog
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Technical Guide
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Contact;