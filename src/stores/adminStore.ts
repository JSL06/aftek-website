import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AdminUIState, 
  Notification, 
  RecentItem, 
  Language, 
  ContentType,
  AdminUser,
  MediaItem,
  TranslationJob
} from '@/types/admin';

interface AdminState extends AdminUIState {
  // User Management
  currentUser: AdminUser | null;
  users: AdminUser[];
  
  // Content Management
  selectedContent: {
    id: string;
    type: ContentType;
    language: Language;
  } | null;
  
  // Media Management
  mediaLibrary: {
    items: MediaItem[];
    selectedItems: string[];
    currentFolder: string;
    viewMode: 'grid' | 'list';
    sortBy: 'name' | 'date' | 'size' | 'type';
    sortOrder: 'asc' | 'desc';
  };
  
  // Translation Management
  translationJobs: TranslationJob[];
  
  // Bulk Operations
  bulkSelection: {
    [key in ContentType]: string[];
  };
  
  // Search & Filters
  globalSearch: {
    query: string;
    filters: Record<string, any>;
    results: any[];
    isSearching: boolean;
  };
  
  // Auto-save
  autoSave: {
    enabled: boolean;
    interval: number;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
  };
}

interface AdminActions {
  // UI Actions
  toggleSidebar: () => void;
  setActiveSection: (section: string) => void;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
  
  // Language Actions
  setCurrentLanguage: (language: Language) => void;
  setFallbackLanguage: (language: Language) => void;
  
  // User Actions
  setCurrentUser: (user: AdminUser | null) => void;
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  
  // Content Actions
  setSelectedContent: (content: { id: string; type: ContentType; language: Language } | null) => void;
  
  // Media Actions
  setMediaItems: (items: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  selectMediaItem: (id: string, selected: boolean) => void;
  setCurrentFolder: (folder: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Translation Actions
  setTranslationJobs: (jobs: TranslationJob[]) => void;
  addTranslationJob: (job: TranslationJob) => void;
  updateTranslationJob: (id: string, updates: Partial<TranslationJob>) => void;
  
  // Bulk Actions
  selectBulkItem: (type: ContentType, id: string, selected: boolean) => void;
  selectAllBulkItems: (type: ContentType, selected: boolean) => void;
  clearBulkSelection: (type: ContentType) => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Record<string, any>) => void;
  setSearchResults: (results: any[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Recent Items Actions
  addRecentItem: (item: Omit<RecentItem, 'lastAccessed'>) => void;
  removeRecentItem: (id: string) => void;
  clearRecentItems: () => void;
  
  // Auto-save Actions
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setLastSaved: (timestamp: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Utility Actions
  resetState: () => void;
}

const initialState: AdminState = {
  // UI State
  sidebar: {
    collapsed: false,
    activeSection: 'dashboard'
  },
  theme: {
    mode: 'system',
    primaryColor: '#8b5cf6'
  },
  language: {
    current: 'zh-Hans',
    fallback: 'zh-Hant'
  },
  search: {
    query: '',
    filters: {},
    results: [],
  },
  notifications: [],
  recentItems: [],
  
  // User Management
  currentUser: null,
  users: [],
  
  // Content Management
  selectedContent: null,
  
  // Media Management
  mediaLibrary: {
    items: [],
    selectedItems: [],
    currentFolder: '/',
    viewMode: 'grid',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  
  // Translation Management
  translationJobs: [],
  
  // Bulk Operations
  bulkSelection: {
    product: [],
    project: [],
    article: [],
    page: []
  },
  
  // Search & Filters
  globalSearch: {
    query: '',
    filters: {},
    results: [],
    isSearching: false
  },
  
  // Auto-save
  autoSave: {
    enabled: true,
    interval: 30000, // 30 seconds
    lastSaved: null,
    hasUnsavedChanges: false
  }
};

export const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // UI Actions
      toggleSidebar: () => set(state => ({
        sidebar: { ...state.sidebar, collapsed: !state.sidebar.collapsed }
      })),
      
      setActiveSection: (section: string) => set(state => ({
        sidebar: { ...state.sidebar, activeSection: section }
      })),
      
      toggleTheme: () => set(state => ({
        theme: { 
          ...state.theme, 
          mode: state.theme.mode === 'light' ? 'dark' : 'light' 
        }
      })),
      
      setTheme: (mode: 'light' | 'dark' | 'system') => set(state => ({
        theme: { ...state.theme, mode }
      })),
      
      setPrimaryColor: (color: string) => set(state => ({
        theme: { ...state.theme, primaryColor: color }
      })),
      
      // Language Actions
      setCurrentLanguage: (language: Language) => set(state => ({
        language: { ...state.language, current: language }
      })),
      
      setFallbackLanguage: (language: Language) => set(state => ({
        language: { ...state.language, fallback: language }
      })),
      
      // User Actions
      setCurrentUser: (user: AdminUser | null) => set({ currentUser: user }),
      
      updateUser: (userId: string, updates: Partial<AdminUser>) => set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        ),
        currentUser: state.currentUser?.id === userId 
          ? { ...state.currentUser, ...updates }
          : state.currentUser
      })),
      
      // Content Actions
      setSelectedContent: (content) => set({ selectedContent: content }),
      
      // Media Actions
      setMediaItems: (items: MediaItem[]) => set(state => ({
        mediaLibrary: { ...state.mediaLibrary, items }
      })),
      
      addMediaItem: (item: MediaItem) => set(state => ({
        mediaLibrary: { 
          ...state.mediaLibrary, 
          items: [item, ...state.mediaLibrary.items] 
        }
      })),
      
      updateMediaItem: (id: string, updates: Partial<MediaItem>) => set(state => ({
        mediaLibrary: {
          ...state.mediaLibrary,
          items: state.mediaLibrary.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        }
      })),
      
      deleteMediaItem: (id: string) => set(state => ({
        mediaLibrary: {
          ...state.mediaLibrary,
          items: state.mediaLibrary.items.filter(item => item.id !== id),
          selectedItems: state.mediaLibrary.selectedItems.filter(itemId => itemId !== id)
        }
      })),
      
      selectMediaItem: (id: string, selected: boolean) => set(state => ({
        mediaLibrary: {
          ...state.mediaLibrary,
          selectedItems: selected
            ? [...state.mediaLibrary.selectedItems, id]
            : state.mediaLibrary.selectedItems.filter(itemId => itemId !== id)
        }
      })),
      
      setCurrentFolder: (folder: string) => set(state => ({
        mediaLibrary: { ...state.mediaLibrary, currentFolder: folder }
      })),
      
      setViewMode: (mode: 'grid' | 'list') => set(state => ({
        mediaLibrary: { ...state.mediaLibrary, viewMode: mode }
      })),
      
      setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type') => set(state => ({
        mediaLibrary: { ...state.mediaLibrary, sortBy }
      })),
      
      setSortOrder: (order: 'asc' | 'desc') => set(state => ({
        mediaLibrary: { ...state.mediaLibrary, sortOrder: order }
      })),
      
      // Translation Actions
      setTranslationJobs: (jobs: TranslationJob[]) => set({ translationJobs: jobs }),
      
      addTranslationJob: (job: TranslationJob) => set(state => ({
        translationJobs: [job, ...state.translationJobs]
      })),
      
      updateTranslationJob: (id: string, updates: Partial<TranslationJob>) => set(state => ({
        translationJobs: state.translationJobs.map(job =>
          job.id === id ? { ...job, ...updates } : job
        )
      })),
      
      // Bulk Actions
      selectBulkItem: (type: ContentType, id: string, selected: boolean) => set(state => ({
        bulkSelection: {
          ...state.bulkSelection,
          [type]: selected
            ? [...state.bulkSelection[type], id]
            : state.bulkSelection[type].filter(itemId => itemId !== id)
        }
      })),
      
      selectAllBulkItems: (type: ContentType, selected: boolean) => set(state => ({
        bulkSelection: {
          ...state.bulkSelection,
          [type]: selected ? state.bulkSelection[type] : []
        }
      })),
      
      clearBulkSelection: (type: ContentType) => set(state => ({
        bulkSelection: {
          ...state.bulkSelection,
          [type]: []
        }
      })),
      
      // Search Actions
      setSearchQuery: (query: string) => set(state => ({
        globalSearch: { ...state.globalSearch, query }
      })),
      
      setSearchFilters: (filters: Record<string, any>) => set(state => ({
        globalSearch: { ...state.globalSearch, filters }
      })),
      
      setSearchResults: (results: any[]) => set(state => ({
        globalSearch: { ...state.globalSearch, results }
      })),
      
      setIsSearching: (isSearching: boolean) => set(state => ({
        globalSearch: { ...state.globalSearch, isSearching }
      })),
      
      clearSearch: () => set(state => ({
        globalSearch: { ...state.globalSearch, query: '', results: [], isSearching: false }
      })),
      
      // Notification Actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        };
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },
      
      markNotificationAsRead: (id: string) => set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      })),
      
      removeNotification: (id: string) => set(state => ({
        notifications: state.notifications.filter(notification => notification.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Recent Items Actions
      addRecentItem: (item) => {
        const recentItem: RecentItem = {
          ...item,
          lastAccessed: new Date().toISOString()
        };
        set(state => ({
          recentItems: [
            recentItem,
            ...state.recentItems.filter(existing => existing.id !== item.id)
          ].slice(0, 10) // Keep only 10 most recent
        }));
      },
      
      removeRecentItem: (id: string) => set(state => ({
        recentItems: state.recentItems.filter(item => item.id !== id)
      })),
      
      clearRecentItems: () => set({ recentItems: [] }),
      
      // Auto-save Actions
      setAutoSaveEnabled: (enabled: boolean) => set(state => ({
        autoSave: { ...state.autoSave, enabled }
      })),
      
      setAutoSaveInterval: (interval: number) => set(state => ({
        autoSave: { ...state.autoSave, interval }
      })),
      
      setLastSaved: (timestamp: string) => set(state => ({
        autoSave: { ...state.autoSave, lastSaved: timestamp }
      })),
      
      setHasUnsavedChanges: (hasChanges: boolean) => set(state => ({
        autoSave: { ...state.autoSave, hasUnsavedChanges: hasChanges }
      })),
      
      // Utility Actions
      resetState: () => set(initialState)
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        sidebar: state.sidebar,
        theme: state.theme,
        language: state.language,
        autoSave: state.autoSave,
        recentItems: state.recentItems
      })
    }
  )
); 