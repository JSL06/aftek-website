import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const socialIcons = {
  facebook: (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
  ),
  instagram: (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.388 3.635 1.355 2.668 2.322 2.41 3.495 2.352 4.772.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.058 1.277.316 2.45 1.283 3.417.967.967 2.14 1.225 3.417 1.283C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.058 2.45-.316 3.417-1.283.967-.967 1.225-2.14 1.283-3.417.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.058-1.277-.316-2.45-1.283-3.417-.967-.967-2.14-1.225-3.417-1.283C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.2-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
  ),
  line: (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184C17.436 1.13 14.13.012 10.823.002 5.13.002.002 4.13.002 9.823c0 2.93 1.615 5.615 4.184 7.615v3.56c0 .22.18.4.4.4.08 0 .16-.02.23-.07l3.56-2.36c.98.19 1.99.29 3.02.29 5.693 0 10.82-4.128 10.82-9.82 0-2.307-1.13-5.613-3.185-7.792zM8.82 13.82H7.82v-3.82h1v3.82zm2.18 0h-1v-3.82h1v3.82zm2.18 0h-1v-3.82h1v3.82zm2.18 0h-1v-3.82h1v3.82z"/></svg>
  ),
  issuu: (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12c0-6.628-5.372-12-12-12zm0 22.153c-5.605 0-10.153-4.548-10.153-10.153S6.395 1.847 12 1.847 22.153 6.395 22.153 12 17.605 22.153 12 22.153zm0-16.306a6.153 6.153 0 1 0 0 12.306 6.153 6.153 0 0 0 0-12.306zm0 10.153a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998z"/></svg>
  ),
  youtube: (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.24 3.5 12 3.5 12 3.5s-7.24 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.332 0 12 0 12s0 3.668.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.76 20.5 12 20.5 12 20.5s7.24 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.668 24 12 24 12s0-3.668-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-background border-t border-border py-8 px-4 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
        {/* Related Platforms */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.relatedPlatforms')}</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="https://www.rlapolymers.com.au/" target="_blank" rel="noopener noreferrer" className="hover:underline">{t('footer.rlaPolymers')}</a>
            </li>
            <li>
              <a href="https://www.facebook.com/candc.media" target="_blank" rel="noopener noreferrer" className="hover:underline">{t('footer.ccMagazine')}</a>
            </li>
          </ul>
        </div>
        {/* Contact Us */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.contactUs')}</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t('footer.phone')} / <a href="tel:0227996558" className="hover:underline">02-27996558</a></li>
            <li>{t('footer.hours')} / 08:30 - 17:30</li>
            <li>{t('footer.address')} / {t('footer.addressValue')}</li>
            <li>{t('footer.email')} / <a href="mailto:aftek.web@gmail.com" className="hover:underline">aftek.web@gmail.com</a></li>
          </ul>
        </div>
        {/* Other Platforms */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.otherPlatforms')}</h3>
          {/* Add your new icons and links here */}
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} Aftek. {t('footer.rightsReserved')}</div>
    </footer>
  );
};

export default Footer;