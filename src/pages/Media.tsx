import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  title: string;
  isActive: boolean;
  order: number;
}

const Media = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('isActive', true)
        .order('order', { ascending: true });
      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data || []);
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