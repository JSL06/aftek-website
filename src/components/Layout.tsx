import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { useEffect } from 'react';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useTranslation, Language } from '@/hooks/useTranslation';
import { useMemo } from 'react';

const Layout = () => {
  const location = useLocation();
  const { isPageVisible } = usePageVisibility();
  const { currentLanguage, changeLanguage } = useTranslation();

  // Determine if current route is admin
  const isAdmin = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show Navigation for non-admin pages */}
      {!isAdmin && isPageVisible('navigation') && <Navigation />}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Only show Footer for non-admin pages */}
      {!isAdmin && isPageVisible('footer') && <Footer />}
    </div>
  );
};

export default Layout;