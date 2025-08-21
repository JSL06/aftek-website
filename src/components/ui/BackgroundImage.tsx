import React from 'react';
import { useBackgroundImages } from '@/hooks/useBackgroundImages';
import { cn } from '@/lib/utils';

interface BackgroundImageProps {
  pageIdentifier: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  showOverlay?: boolean;
  fallbackBackground?: string;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  pageIdentifier,
  children,
  className,
  overlayClassName,
  showOverlay = true,
  fallbackBackground
}) => {
  const { getBackgroundStyle, getBackgroundConfig, isLoading, error } = useBackgroundImages();
  const backgroundConfig = getBackgroundConfig(pageIdentifier);
  const backgroundStyle = getBackgroundStyle(pageIdentifier);

  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        {children}
      </div>
    );
  }

  if (error) {
    console.warn('Background image error:', error);
  }

  const hasBackground = backgroundConfig?.background_image_url;
  const hasOverlay = showOverlay && 
    backgroundConfig?.overlay_color && 
    backgroundConfig.overlay_opacity && 
    backgroundConfig.overlay_opacity > 0;

  return (
    <div 
      className={cn("relative", className)}
      style={{
        ...backgroundStyle,
        backgroundColor: fallbackBackground || undefined
      }}
    >
      {hasOverlay && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            overlayClassName
          )}
          style={{
            backgroundColor: backgroundConfig?.overlay_color,
            opacity: backgroundConfig?.overlay_opacity
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundImage;
