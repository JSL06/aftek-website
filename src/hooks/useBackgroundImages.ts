import { useState, useEffect } from 'react';
import { mediaService } from '@/services/mediaService';
import { Database } from '@/integrations/supabase/types';

type PageBackground = Database['public']['Tables']['page_backgrounds']['Row'];

interface BackgroundImageHook {
  getBackgroundStyle: (pageIdentifier: string) => React.CSSProperties;
  getBackgroundImage: (pageIdentifier: string) => string | null;
  getBackgroundConfig: (pageIdentifier: string) => PageBackground | null;
  isLoading: boolean;
  error: string | null;
}

export const useBackgroundImages = (): BackgroundImageHook => {
  const [backgrounds, setBackgrounds] = useState<Map<string, PageBackground>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allBackgrounds = await mediaService.getAllPageBackgrounds();
      const backgroundsMap = new Map();
      
      allBackgrounds.forEach(bg => {
        backgroundsMap.set(bg.page_identifier, bg);
      });
      
      setBackgrounds(backgroundsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load background images');
      console.error('Error loading background images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackgroundStyle = (pageIdentifier: string): React.CSSProperties => {
    const background = backgrounds.get(pageIdentifier);
    
    if (!background || !background.background_image_url) {
      return {};
    }

    const style: React.CSSProperties = {
      backgroundImage: `url(${background.background_image_url})`,
      backgroundPosition: background.background_position,
      backgroundSize: background.background_size,
      backgroundRepeat: background.background_repeat,
      backgroundAttachment: background.background_attachment,
    };

    // Add overlay if configured
    if (background.overlay_color && background.overlay_opacity && background.overlay_opacity > 0) {
      // For overlay, we'll need to use a pseudo-element or wrapper
      // This is handled in the component using this hook
    }

    return style;
  };

  const getBackgroundImage = (pageIdentifier: string): string | null => {
    const background = backgrounds.get(pageIdentifier);
    return background?.background_image_url || null;
  };

  const getBackgroundConfig = (pageIdentifier: string): PageBackground | null => {
    return backgrounds.get(pageIdentifier) || null;
  };

  return {
    getBackgroundStyle,
    getBackgroundImage,
    getBackgroundConfig,
    isLoading,
    error
  };
};

export default useBackgroundImages;
