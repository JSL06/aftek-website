import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

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
    <div>
      <h1>Media Gallery</h1>
      {loading ? (
        <p>Loading media...</p>
      ) : (
        <div className="media-grid">
          {media.map(item => (
            <div key={item.id} className="media-item">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title} />
              ) : (
                <video src={item.url} controls />
              )}
              <div>{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;