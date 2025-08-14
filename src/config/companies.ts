export interface CompanyConfig {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  logoAlt: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain: string;
  route: string;
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export const companies: { [key: string]: CompanyConfig } = {
  aftek: {
    id: 'aftek',
    name: 'Aftek',
    displayName: 'Aftek Co., Ltd.',
    logo: '/aftek-logo.png',
    logoAlt: 'Aftek Company Logo',
    primaryColor: '#dc2626', // Red
    secondaryColor: '#1f2937', // Dark gray
    accentColor: '#f59e0b', // Amber
    domain: 'aftek.example.com',
    route: '/aftek',
    description: 'Professional construction materials and solutions provider across Asia-Pacific region.',
    contactInfo: {
      phone: '02-2799-6558',
      email: 'info@aftek.com.tw',
      address: 'No. 123, Section 2, Xinyi Road, Da\'an District, Taipei City 106, Taiwan'
    }
  },
  rla: {
    id: 'rla',
    name: 'RLA Polymers',
    displayName: 'RLA Polymers International',
    logo: '/rla-logo.png',
    logoAlt: 'RLA Polymers Logo',
    primaryColor: '#2563eb', // Blue
    secondaryColor: '#1e40af', // Dark blue
    accentColor: '#06b6d4', // Cyan
    domain: 'rla.example.com',
    route: '/rla',
    description: 'Leading manufacturer of high-performance polymer solutions for construction and industrial applications.',
    contactInfo: {
      phone: '+61 2 9876 5432',
      email: 'info@rla-polymers.com',
      address: '123 Industrial Way, Sydney NSW 2000, Australia'
    }
  },
  itls: {
    id: 'itls',
    name: 'ITLS',
    displayName: 'ITLS Construction Solutions',
    logo: '/itls-logo.png',
    logoAlt: 'ITLS Logo',
    primaryColor: '#059669', // Green
    secondaryColor: '#047857', // Dark green
    accentColor: '#10b981', // Emerald
    domain: 'itls.example.com',
    route: '/itls',
    description: 'Innovative construction technology and sustainable building solutions for modern infrastructure.',
    contactInfo: {
      phone: '+65 6789 0123',
      email: 'info@itls-solutions.com',
      address: '456 Innovation Drive, Singapore 123456'
    }
  }
};

export const defaultCompany = 'aftek';

export const getCompanyByRoute = (route: string): CompanyConfig | null => {
  const companyId = Object.keys(companies).find(id => 
    companies[id].route === route || route.startsWith(companies[id].route)
  );
  return companyId ? companies[companyId] : null;
};

export const getCompanyById = (id: string): CompanyConfig | null => {
  return companies[id] || null;
};

export const getAllCompanies = (): CompanyConfig[] => {
  return Object.values(companies);
};
