import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Home, 
  Factory, 
  ArrowLeft,
  Play,
  Download,
  Share2,
  MessageSquare,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import FacilityExplorer from '@/components/product-guide/FacilityExplorer';
import ProductPanel from '@/components/product-guide/ProductPanel';
import SolutionBuilder from '@/components/product-guide/SolutionBuilder';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  category: string;
  products: any[];
  description: string;
}

interface Solution {
  id: string;
  name: string;
  description: string;
  products: string[];
  compatibility: number;
  cost: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: string;
}

const ProductGuide: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'entry' | 'facility-select' | 'explorer' | 'solution'>('entry');
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');

  const facilityTypes = [
    {
      id: 'residential',
      name: t('guide.facilities.residential'),
      description: t('guide.facilities.residentialDesc'),
      icon: Home,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'commercial',
      name: t('guide.facilities.commercial'),
      description: t('guide.facilities.commercialDesc'),
      icon: Building,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'industrial',
      name: t('guide.facilities.industrial'),
      description: t('guide.facilities.industrialDesc'),
      icon: Factory,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'infrastructure',
      name: t('guide.facilities.infrastructure'),
      description: t('guide.facilities.infrastructureDesc'),
      icon: Building,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  // Typewriter effect for entry animation
  useEffect(() => {
    if (currentStep === 'entry') {
      setIsTyping(true);
      const text = t('guide.entry.title');
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setTypedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    }
  }, [currentStep, t]);

  const handleFacilitySelect = (facilityId: string) => {
    setSelectedFacility(facilityId);
    setCurrentStep('explorer');
  };

  const handleHotspotSelect = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setSelectedProducts(prev => [...prev, ...hotspot.products.map(p => p.id)]);
  };

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    setCurrentStep('solution');
  };

  const handleStartExploration = () => {
    setCurrentStep('facility-select');
  };

  const handleBackToExplorer = () => {
    setCurrentStep('explorer');
    setSelectedSolution(null);
  };

  // Entry Animation
  if (currentStep === 'entry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-4xl mx-auto px-8">
            <div className="mb-8 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {typedText}
              </span>
              {isTyping && (
                <span className="ml-2 animate-pulse">
                  |
                </span>
              )}
            </h1>

            <p className="text-xl md:text-2xl text-blue-200 mb-8 animate-fade-in">
              {t('guide.entry.subtitle')}
            </p>

            <div className="animate-fade-in">
              <Button
                size="lg"
                onClick={handleStartExploration}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                {t('guide.entry.startButton')}
              </Button>
            </div>

            <div className="mt-12 text-blue-300 text-sm animate-fade-in">
              <p>{t('guide.entry.instruction')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Facility Selection
  if (currentStep === 'facility-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div style={{ height: '80px' }}></div>
        <div className="container mx-auto p-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {t('guide.facilitySelect.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('guide.facilitySelect.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {facilityTypes.map((facility, index) => (
              <div
                key={facility.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card 
                  className="cursor-pointer group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                  onClick={() => handleFacilitySelect(facility.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${facility.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}
                    >
                      <facility.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                      {facility.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {facility.description}
                    </p>
                    
                    <div className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t('guide.facilitySelect.explore')} →
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Explorer Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div style={{ height: '80px' }}></div>
      
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {facilityTypes.find(f => f.id === selectedFacility)?.name} - {t('guide.explorer.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('guide.explorer.subtitle')}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('facility-select')}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('guide.explorer.changeFacility')}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Facility Explorer */}
          <div className="lg:col-span-2">
            <FacilityExplorer
              facilityType={selectedFacility || ''}
              onHotspotSelect={handleHotspotSelect}
              selectedHotspot={selectedHotspot}
            />
          </div>

          {/* Product Panel */}
          <div className="h-[600px]">
            <ProductPanel
              hotspot={selectedHotspot}
              onClose={() => setSelectedHotspot(null)}
            />
          </div>
        </div>

        {/* Solution Builder */}
        {selectedProducts.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <SolutionBuilder
                  selectedProducts={selectedProducts}
                  facilityType={selectedFacility || ''}
                  onSolutionSelect={handleSolutionSelect}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-8 flex justify-center gap-4 animate-fade-in">
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
            <Download className="h-4 w-4 mr-2" />
            {t('guide.explorer.download')}
          </Button>
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
            <Share2 className="h-4 w-4 mr-2" />
            {t('guide.explorer.share')}
          </Button>
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('guide.explorer.consult')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGuide; 