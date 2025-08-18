import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simple notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Simple admin state interface
interface AdminState {
  sidebar: {
    collapsed: boolean;
    activeSection: string;
  };
  notifications: Notification[];
}

// Admin actions interface
interface AdminActions {
  toggleSidebar: () => void;
  setActiveSection: (section: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// Combined context type
type AdminContextType = AdminState & AdminActions;

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export const AdminStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebar, setSidebar] = useState({
    collapsed: false,
    activeSection: 'dashboard'
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleSidebar = () => {
    setSidebar(prev => ({ ...prev, collapsed: !prev.collapsed }));
  };

  const setActiveSection = (section: string) => {
    setSidebar(prev => ({ ...prev, activeSection: section }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: AdminContextType = {
    sidebar,
    notifications,
    toggleSidebar,
    setActiveSection,
    addNotification,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook to use the admin store
export const useAdminStore = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminStore must be used within an AdminStoreProvider');
  }
  return context;
}; 