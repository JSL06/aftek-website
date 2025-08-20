import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import EnglishBrochure from '@/assets/Aftek_Company_Profile_English.pdf';
import ThaiBrochure from '@/assets/AFTEK_Company_Profile_Thai.pdf';

const About = () => {
  const { t, currentLanguage } = useTranslation();

  // Map language to brochure PDF
  const brochureMap = {
    'EN': EnglishBrochure,
    'ไทย': ThaiBrochure,
    // Add more as you upload new brochures
  };
  const brochureHref = brochureMap[currentLanguage] || EnglishBrochure;

  const VALUE_BOXES = [
    {
      title: t('about.value.quality'),
      desc: t('about.value.quality.desc')
    },
    {
      title: t('about.value.innovation'),
      desc: t('about.value.innovation.desc')
    },
    {
      title: t('about.value.sustainability'),
      desc: t('about.value.sustainability.desc')
    }
  ];

  const TIMELINE = [
    { year: '2008', events: [t('about.timeline.2008.1')] },
    { year: '2009', events: [t('about.timeline.2009.1'), t('about.timeline.2009.2'), t('about.timeline.2009.3'), t('about.timeline.2009.4')] },
    { year: '2011', events: [t('about.timeline.2011.1')] },
    { year: '2013', events: [t('about.timeline.2013.1')] },
    { year: '2014', events: [t('about.timeline.2014.1')] },
    { year: '2015', events: [t('about.timeline.2015.1')] },
    { year: '2017', events: [t('about.timeline.2017.1')] },
    { year: '2018', events: [t('about.timeline.2018.1')] }
  ];

  const RED_SECTION = {
    title: t('about.ctaTitle'),
    desc: t('about.ctaDesc'),
    buttons: [
      { label: t('about.ctaAbout'), href: 'https://youtu.be/TT9sLsEGBqI?list=TLGGq_kDVToKf2kxMDA3MjAyNQ', target: '_blank' },
      { label: t('about.ctaBrochure'), href: brochureHref, target: '_blank' }
    ]
  };

  // SVG icons for buttons (outlined, modern, and perfectly centered)
  const PlayIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', height: '1.2em', marginRight: '0.375em', transform: 'translateY(-2px) translateX(-2px)' }}>
      <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="10,8 16,12 10,16 10,8" />
      </svg>
    </span>
  );
  const FileIcon = () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', height: '1.2em', marginRight: '0.375em', transform: 'translateY(-4px) translateX(-2px)' }}>
      <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="14" y1="8" x2="20" y2="8" />
      </svg>
    </span>
  );

  // Determine font family based on language
  let fontFamily = 'Palatino Linotype, Book Antiqua, Palatino, serif';
  if (['zh-Hans', 'ja'].includes(currentLanguage)) {
    fontFamily = 'Times New Roman, Times, serif';
  }

  // Leadership team state
  const [leadership, setLeadership] = useState([]);
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('About page: Language changed to:', event.detail);
      // Force reload the page to ensure all translations are properly loaded
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
      // FIX: Handle missing isActive column gracefully
      const { data, error } = await supabase
        .from('leadership')
        .select('*')
        .order('display_order', { ascending: true });
        
        if (error) {
          // Silently handle the error - table might not exist or have different structure
          console.warn('Leadership table not available:', error.message);
          setLeadership([]);
        } else {
          // Filter active leadership in memory if isActive column exists
          const activeLeadership = data?.filter(leader => 
            leader.isActive === true || leader.isActive === undefined
          ) || [];
          setLeadership(activeLeadership);
        }
      } catch (err) {
        // Catch any other errors and handle silently
        console.warn('Failed to fetch leadership data:', err);
        setLeadership([]);
      }
    };
    fetchLeadership();
  }, []);

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        fontFamily,
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
            {t('about.title')}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-4xl">
        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto text-center mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-8 border border-border">
          <h2 className="text-3xl font-bold mb-6 text-foreground" style={{ fontFamily }}>{t('home.mission.title')}</h2>
          <div className="text-lg leading-relaxed text-foreground" style={{ fontFamily }}>
            {t('home.mission.content').split('\n\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-6' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {/* Value Boxes */}
        <div className="flex flex-col md:flex-row gap-6 justify-center mb-16">
          {VALUE_BOXES.map((box, i) => (
            <div key={i} className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-8 text-center border border-border" style={{ minWidth: 220 }}>
              <div className="text-xl font-bold mb-2 text-primary" style={{ fontFamily }}>{box.title}</div>
              <div className="text-base text-muted-foreground" style={{ fontFamily }}>{box.desc}</div>
            </div>
          ))}
        </div>
        {/* Timeline Section */}
        <section className="max-w-6xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            {t('about.timeline.title')}
          </h2>
          
          {/* Simple centered timeline */}
          <div className="max-w-4xl mx-auto">
          {TIMELINE.map((item, idx) => (
              <div key={item.year} className="flex justify-center mb-6">
                <div className="w-24 text-right pr-6 text-primary font-bold text-lg flex-shrink-0" style={{ fontFamily }}>{item.year}</div>
                <div className="flex-1 text-base max-w-3xl" style={{ fontFamily }}>
                {item.events.map((ev, i) => (
                    <div key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: ev }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        </section>
        {/* Leadership Team Section */}
        {leadership.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily }}>Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {leadership.map((leader) => (
                <div key={leader.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-6 flex flex-col items-center text-center border border-border">
                  {leader.image && (
                    <img src={leader.image} alt={leader.name} className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-primary" />
                  )}
                  <div className="text-xl font-bold mb-1 text-primary" style={{ fontFamily }}>{leader.name}</div>
                  <div className="text-base font-semibold mb-2" style={{ fontFamily }}>{leader.title}</div>
                  <div className="text-base text-muted-foreground" style={{ fontFamily }}>{leader.bio}</div>
            </div>
          ))}
        </div>
      </div>
        )}
      {/* Map and Contact Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-16 items-stretch container mx-auto max-w-4xl">
        <div className="flex-1 min-w-[300px] rounded-lg overflow-hidden shadow-elegant border border-border bg-white/90 backdrop-blur-sm">
          <iframe
            src="https://www.google.com/maps?q=台北市內湖區內湖路一段356號5樓&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Aftek Location Map"
          ></iframe>
        </div>
        <div className="flex-1 flex flex-col justify-center bg-white/90 backdrop-blur-sm rounded-lg shadow-elegant border border-border p-6" style={{ fontFamily }}>
          <h3 className="text-xl font-semibold mb-4" style={{ fontFamily }}>{t('about.contactTitle')}</h3>
          <div className="mb-2 text-lg" style={{ fontFamily }}>
            <span className="font-medium">{t('about.address')}</span>
            <div>{t('about.addressValue')}</div>
          </div>
          <div className="mb-2 text-lg" style={{ fontFamily }}>
            <span className="font-medium">{t('about.email')}</span>
            <a href="mailto:info@aftek.com.tw" className="text-primary underline">info@aftek.com.tw</a>
          </div>
          <div className="mb-2 text-lg" style={{ fontFamily }}>
            <span className="font-medium">{t('about.phone')}</span>
            <a href="tel:+886-2-8797-8990" className="text-primary underline">+886-2-8797-8990</a>
          </div>
        </div>
      </div>
      {/* Red Call-to-Action Section */}
      <div className="w-full py-16 bg-gradient-hero" style={{ color: 'white', fontFamily }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily }}>{RED_SECTION.title}</h2>
          <div className="mb-6 text-lg" style={{ fontFamily }}>{RED_SECTION.desc}</div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {RED_SECTION.buttons.map((btn, i) => (
              <a
                key={i}
                href={btn.href}
                target={btn.target}
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg font-semibold shadow-glow hover:bg-primary-hover transition text-lg bg-white/90 text-primary hover:text-primary-hover"
                style={{ fontFamily }}
              >
                {i === 0 ? <PlayIcon /> : <FileIcon />}
                {btn.label}
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;