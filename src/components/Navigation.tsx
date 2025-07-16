import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation, Language } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import aftekLogo from '@/assets/aftek-logo.png';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { CartIcon } from './CartIcon';

const Navigation = () => {
  const location = useLocation();
  const { currentLanguage, changeLanguage, t } = useTranslation();
  const { isPageVisible } = usePageVisibility();

  // State to control header visibility
  const [showHeader, setShowHeader] = useState(location.pathname === '/');

  useEffect(() => {
    if (location.pathname === '/') {
      setShowHeader(false);
      const handleScroll = () => setShowHeader(true);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowHeader(true);
    }
  }, [location.pathname]);

  const navigationItems = [
    { label: t('nav.home'), path: '/', page: 'home' },
    { label: t('nav.about'), path: '/about', page: 'about' },
    { label: t('nav.products'), path: '/products', page: 'products' },
    { label: t('nav.projects'), path: '/projects', page: 'projects' },
    { label: t('nav.articles'), path: '/articles', page: 'articles' },
    { label: t('nav.guide'), path: '/exploded-view', page: 'home' }, // Guide is part of home
    { label: t('nav.contact'), path: '/contact', page: 'contact' },
  ];

  const languageOptions = [
    { code: 'en', display: 'English' },
    { code: 'zh-Hant', display: '繁體中文' },
    { code: 'zh-Hans', display: '简体中文' },
    { code: 'th', display: 'ไทย' },
    { code: 'ja', display: '日本語' },
    { code: 'ko', display: '한국어' },
    { code: 'vi', display: 'Tiếng Việt' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={
        `fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border z-50 ${location.pathname === '/' ? 'transition-opacity duration-[10000ms] ease-in-out' : ''} ${showHeader ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`
      }
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={aftekLogo} alt="Aftek Logo" className="w-20 h-20 object-contain" />
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navigationItems
              .filter(item => isPageVisible(item.page as any))
              .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                  "text-sm font-medium transition-smooth hover:text-primary relative",
                  isActive(item.path)
                    ? "text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-foreground/70"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Cart and Language Selector */}
          <div className="flex items-center space-x-4">
            <CartIcon />
            <select 
              className="bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value as Language)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.display}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;