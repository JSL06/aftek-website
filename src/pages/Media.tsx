import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import bgMain from '@/assets/17580.jpg';
import bgTitle from '@/assets/pexels-pixabay-159306.png';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  title: string;
  isActive: boolean;
  order: number;
}

const Media = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Listen for language changes and force reload to ensure all translations are loaded
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Media page: Language changed to:', event.detail);
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
    const fetchMedia = async () => {
      setLoading(true);
      // FIX: Handle missing isActive column gracefully
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('order', { ascending: true });
      if (error) {
        console.error('Error fetching media:', error);
      } else {
        // Filter active media in memory if isActive column exists
        const activeMedia = data?.filter(item => 
          item.isActive === true || item.isActive === undefined
        ) || [];
        setMedia(activeMedia);
      }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundImage: `url(${bgMain})`,
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
          backgroundImage: `url(${bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Media Gallery
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto p-8 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading media...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {media.map(item => (
              <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-6 border border-border">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                ) : (
                  <video src={item.url} controls className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <div className="text-lg font-semibold text-foreground">{item.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;