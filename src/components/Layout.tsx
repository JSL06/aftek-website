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
      {/* Fixed language selector for admin pages only */}
      {isAdmin && (
        <div className="fixed top-4 right-6 z-50">
          <select
            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow"
            value={currentLanguage}
            onChange={e => changeLanguage(e.target.value as Language)}
            style={{ minWidth: 120 }}
          >
            <option value="EN">English</option>
            <option value="繁體">繁體中文</option>
            <option value="简体">简体中文</option>
            <option value="ไทย">ไทย</option>
            <option value="日本語">日本語</option>
            <option value="한국어">한국어</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
          </select>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {isPageVisible('footer') && <Footer />}
    </div>
  );
};

export default Layout;