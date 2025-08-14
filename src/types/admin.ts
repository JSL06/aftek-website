// Admin System Types
export type UserRole = 'admin' | 'editor' | 'translator' | 'viewer';
export type ContentType = 'product' | 'project' | 'article' | 'page';
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
export type Language = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja' | 'ko' | 'th' | 'vi';

// User Management
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  languageAccess: Language[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Permission {
  resource: ContentType | 'media' | 'users' | 'analytics';
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish')[];
  languages?: Language[];
}

// Content Management
export interface BaseContent {
  id: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  publishedAt?: string;
  scheduledAt?: string;
  seo: SEOData;
  tags: string[];
  featured: boolean;
  order: number;
}

export interface MultilingualContent {
  [key: string]: {
    title: string;
    description?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schema?: Record<string, any>;
}

// Product Management
export interface Product extends BaseContent {
  type: 'product';
  sku: string;
  price: number;
  currency: string;
  inventory: number;
  category: string;
  features: string[];
  specifications: Record<string, any>;
  variants: ProductVariant[];
  relatedProducts: string[];
  images: MediaItem[];
  documents: MediaItem[];
  multilingual: MultilingualContent;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  attributes: Record<string, string>;
}

// Project Management
export interface Project extends BaseContent {
  type: 'project';
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  category: string;
  technologies: string[];
  images: MediaItem[];
  documents: MediaItem[];
  multilingual: MultilingualContent;
}

// Article Management
export interface Article extends BaseContent {
  type: 'article';
  author: string;
  category: string;
  readTime: number;
  featuredImage?: MediaItem;
  images: MediaItem[];
  multilingual: MultilingualContent;
}

// Media Management
export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos/audio
  altText: Record<Language, string>;
  caption: Record<Language, string>;
  tags: string[];
  folder: string;
  usage: MediaUsage[];
  uploadedBy: string;
  uploadedAt: string;
  optimized: boolean;
  metadata: Record<string, any>;
}

export interface MediaUsage {
  contentType: ContentType;
  contentId: string;
  field: string;
  usedAt: string;
}

// Translation Management
export interface TranslationJob {
  id: string;
  contentId: string;
  contentType: ContentType;
  sourceLanguage: Language;
  targetLanguage: Language;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
  aiSuggestions: AITranslationSuggestion[];
}

export interface AITranslationSuggestion {
  id: string;
  originalText: string;
  suggestedTranslation: string;
  confidence: number;
  alternatives: string[];
  context: string;
  accepted: boolean;
}

// Analytics
export interface AnalyticsData {
  visitors: {
    total: number;
    unique: number;
    returning: number;
  };
  pageViews: {
    total: number;
    byPage: Record<string, number>;
  };
  geographic: Record<string, number>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: Record<string, number>;
  searchTerms: Array<{
    term: string;
    count: number;
  }>;
  contentPerformance: Array<{
    id: string;
    type: ContentType;
    views: number;
    engagement: number;
  }>;
}

// Workflow & Version Control
export interface ContentVersion {
  id: string;
  contentId: string;
  contentType: ContentType;
  version: number;
  changes: ContentChange[];
  createdBy: string;
  createdAt: string;
  comment?: string;
}

export interface ContentChange {
  field: string;
  oldValue: any;
  newValue: any;
  language?: Language;
}

// Activity Logging
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// UI State Management
export interface AdminUIState {
  sidebar: {
    collapsed: boolean;
    activeSection: string;
  };
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
  };
  language: {
    current: Language;
    fallback: Language;
  };
  search: {
    query: string;
    filters: Record<string, any>;
    results: any[];
  };
  notifications: Notification[];
  recentItems: RecentItem[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface RecentItem {
  id: string;
  type: ContentType;
  title: string;
  url: string;
  lastAccessed: string;
}

// Form Types
export interface ContentFormData {
  basic: {
    status: ContentStatus;
    featured: boolean;
    order: number;
    tags: string[];
  };
  seo: SEOData;
  multilingual: Record<Language, {
    title: string;
    description: string;
    content: string;
    excerpt?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
  media: {
    images: MediaItem[];
    documents: MediaItem[];
  };
  specific: Record<string, any>; // Type-specific fields
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Command Palette
export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords: string[];
  category: string;
} 