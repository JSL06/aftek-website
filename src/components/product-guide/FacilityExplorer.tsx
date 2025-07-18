import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play,
  Pause
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  category: string;
  products: Product[];
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  specifications: string[];
  applications: string[];
}

interface FacilityExplorerProps {
  facilityType: string;
  onHotspotSelect: (hotspot: Hotspot) => void;
  selectedHotspot: Hotspot | null;
}

const FacilityExplorer: React.FC<FacilityExplorerProps> = ({
  facilityType,
  onHotspotSelect,
  selectedHotspot
}) => {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Sample hotspots data - this would come from your database
  const hotspots: Hotspot[] = [
    {
      id: 'foundation',
      x: 50,
      y: 80,
      z: 0,
      label: t('guide.hotspots.foundation.label'),
      category: 'waterproofing',
      description: t('guide.hotspots.foundation.description'),
      products: [
        {
          id: 'flex-pro-pu',
          name: 'Flex-Pro PU',
          description: t('guide.products.flexProPU.description'),
          image: '/products/flex-pro-pu.jpg',
          category: 'sealants',
          specifications: ['High flexibility', 'UV resistant', 'Chemical resistant'],
          applications: ['Foundation joints', 'Expansion joints', 'Concrete cracks']
        }
      ]
    },
    {
      id: 'walls',
      x: 30,
      y: 40,
      z: 20,
      label: t('guide.hotspots.walls.label'),
      category: 'coatings',
      description: t('guide.hotspots.walls.description'),
      products: [
        {
          id: 'protective-coating',
          name: 'Protective Coating System',
          description: t('guide.products.protectiveCoating.description'),
          image: '/products/protective-coating.jpg',
          category: 'coatings',
          specifications: ['Weather resistant', 'Durable finish', 'Easy application'],
          applications: ['Exterior walls', 'Concrete protection', 'Weatherproofing']
        }
      ]
    },
    {
      id: 'roof',
      x: 70,
      y: 20,
      z: 40,
      label: t('guide.hotspots.roof.label'),
      category: 'waterproofing',
      description: t('guide.hotspots.roof.description'),
      products: [
        {
          id: 'liquid-membrane',
          name: 'Liquid Membrane System',
          description: t('guide.products.liquidMembrane.description'),
          image: '/products/liquid-membrane.jpg',
          category: 'waterproofing',
          specifications: ['Seamless application', 'High elongation', 'Root resistant'],
          applications: ['Roof waterproofing', 'Balcony protection', 'Terraces']
        }
      ]
    }
  ];

  // Auto-rotation animation
  useEffect(() => {
    if (isAutoRotating) {
      const animate = () => {
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.5
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoRotating]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
    setIsAutoRotating(false);
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 3D Facility Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div
          className="relative w-80 h-80 transition-transform duration-300"
          style={{
            transform: `
              perspective(1000px) 
              rotateX(${rotation.x}deg) 
              rotateY(${rotation.y}deg) 
              rotateZ(${rotation.z}deg)
              scale(${zoom})
            `,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Facility Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-400 to-gray-200 rounded-lg opacity-50" />
          </div>

          {/* Facility Structure */}
          <div className="absolute inset-4 bg-gradient-to-b from-blue-200 to-blue-400 rounded-lg shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-300 to-blue-100 rounded-lg opacity-70" />
          </div>

          {/* Interactive Hotspots */}
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              onClick={() => onHotspotSelect(hotspot)}
              className="absolute w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg hover:scale-125 transition-transform duration-200 z-10 group"
              style={{ 
                left: `${hotspot.x}%`, 
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Pulsing Animation */}
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
            </button>
          ))}

          {/* Hotspot Labels */}
          {hotspots.map((hotspot) => (
            <div
              key={`${hotspot.id}-label`}
              className="absolute text-sm font-medium text-white bg-black/70 px-3 py-1 rounded-full shadow-lg pointer-events-none backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ 
                left: `${hotspot.x}%`, 
                top: `${hotspot.y - 8}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              {hotspot.label}
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomIn}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomOut}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 ${
            isAutoRotating ? 'bg-blue-500/50' : ''
          }`}
        >
          {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReset}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Facility Type Badge */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white">
          {facilityType}
        </Badge>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 text-white/80 text-sm max-w-xs">
        <p>Click hotspots to explore products</p>
        <p>Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default FacilityExplorer; 