import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CompanyConfig, companies, defaultCompany, getCompanyByRoute } from '@/config/companies';

interface CompanyContextType {
  currentCompany: CompanyConfig;
  setCurrentCompany: (companyId: string) => void;
  allCompanies: CompanyConfig[];
  isCompanyRoute: boolean;
  companyRoute: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: React.ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const location = useLocation();
  const [currentCompany, setCurrentCompanyState] = useState<CompanyConfig>(companies[defaultCompany]);
  const [companyRoute, setCompanyRoute] = useState<string>('');

  // Detect company from route
  useEffect(() => {
    const pathname = location.pathname;
    const detectedCompany = getCompanyByRoute(pathname);
    
    if (detectedCompany) {
      setCurrentCompanyState(detectedCompany);
      setCompanyRoute(detectedCompany.route);
    } else {
      // Default to Aftek if no company route detected
      setCurrentCompanyState(companies[defaultCompany]);
      setCompanyRoute('');
    }
  }, [location.pathname]);

  const setCurrentCompany = (companyId: string) => {
    const company = companies[companyId];
    if (company) {
      setCurrentCompanyState(company);
      setCompanyRoute(company.route);
      
      // Update document title
      document.title = `${company.displayName} - Construction Solutions`;
      
      // Update CSS custom properties for company colors
      document.documentElement.style.setProperty('--company-primary', company.primaryColor);
      document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
      document.documentElement.style.setProperty('--company-accent', company.accentColor);
    }
  };

  // Update CSS custom properties when company changes
  useEffect(() => {
    document.documentElement.style.setProperty('--company-primary', currentCompany.primaryColor);
    document.documentElement.style.setProperty('--company-secondary', currentCompany.secondaryColor);
    document.documentElement.style.setProperty('--company-accent', currentCompany.accentColor);
    
    // Update document title
    document.title = `${currentCompany.displayName} - Construction Solutions`;
  }, [currentCompany]);

  const contextValue: CompanyContextType = {
    currentCompany,
    setCurrentCompany,
    allCompanies: Object.values(companies),
    isCompanyRoute: companyRoute !== '',
    companyRoute
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
