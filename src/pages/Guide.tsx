import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Home, Factory, MapPin, ArrowRight } from 'lucide-react';
import ProductPanel from '@/components/product-guide/ProductPanel';
import SolutionBuilder from '@/components/product-guide/SolutionBuilder';
import { supabase } from '@/integrations/supabase/client';

interface Hotspot {
  id: string;
  label: string;
  category: string;
  description: string;
  x: number;
  y: number;
  facility_type: string;
  product_ids: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  specifications: string[];
  applications: string[];
}

interface Facility {
  id: string;
  name: string;
  value: string;
  icon: string;
  is_active: boolean;
}

const Guide = () => {
  const { t, currentLanguage } = useTranslation();
  const [selectedFacility, setSelectedFacility] = useState('residential');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showSolutionBuilder, setShowSolutionBuilder] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuideData();
    console.log('Guide page loaded with language:', currentLanguage);
  }, []);

  // Listen for language changes and reload the page
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Language changed to:', event.detail);
      // Reload the entire page to ensure all text updates
      window.location.reload();
    };

    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const loadGuideData = async () => {
    try {
      setLoading(true);
      
      // Load facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('guide_building_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (facilitiesError) {
        console.warn('Could not load building types:', facilitiesError);
        // Use default facilities if table doesn't exist
        setFacilities([
          { id: '1', name: 'Residential Building', value: 'residential', icon: 'Home', is_active: true },
          { id: '2', name: 'Commercial Building', value: 'commercial', icon: 'Building2', is_active: true },
          { id: '3', name: 'Industrial Facility', value: 'industrial', icon: 'Factory', is_active: true },
          { id: '4', name: 'Infrastructure Project', value: 'infrastructure', icon: 'Building2', is_active: true }
        ]);
      } else {
        // Transform building types data to match the facilities interface
        const transformedFacilities = facilitiesData?.map(bt => ({
          id: bt.id,
          name: bt.name?.en || bt.name?.[Object.keys(bt.name || {})[0]] || 'Unknown',
          value: bt.name?.en?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
          icon: bt.icon || 'Building2',
          is_active: bt.is_active
        })) || [];
        setFacilities(transformedFacilities);
      }

      // Load hotspots from the new guide_hotspots table
      const { data: hotspotsData, error: hotspotsError } = await supabase
        .from('guide_hotspots')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (hotspotsError) {
        console.warn('Could not load hotspots:', hotspotsError);
        setHotspots([]);
      } else {
        // Transform hotspots data to match the Hotspot interface
        const transformedHotspots = hotspotsData?.map(h => {
          // Find the corresponding building type to get the facility value
          const buildingType = facilitiesData?.find(bt => bt.id === h.building_type_id);
          const facilityValue = buildingType ? 
            (buildingType.name?.en?.toLowerCase().replace(/\s+/g, '-') || 'residential') : 
            'residential';
          
          return {
            id: h.id,
            label: h.label?.en || h.label?.[Object.keys(h.label || {})[0]] || 'Unknown',
            category: h.category || '',
            description: h.description?.en || h.description?.[Object.keys(h.description || {})[0]] || '',
            x: h.x_position || 50,
            y: h.y_position || 50,
            facility_type: facilityValue,
            product_ids: [] // Will be populated separately
          };
        }) || [];
        console.log('Hotspots loaded:', transformedHotspots);
        setHotspots(transformedHotspots);
      }

      // Load products for hotspots
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, category')
        .order('name');

      if (productsError) {
        console.warn('Could not load products:', productsError);
        setProducts([]);
      } else {
        // Transform products to ensure all required fields exist with defaults
        const transformedProducts = productsData?.map(p => ({
          id: p.id,
          name: p.name || '',
          description: p.description || '',
          category: p.category || '',
          image: '/placeholder.svg', // Default placeholder image
          specifications: [], // Empty array as default
          applications: [] // Empty array as default
        })) || [];
        setProducts(transformedProducts);
      }

    } catch (error) {
      console.error('Error loading guide data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setShowSolutionBuilder(false);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSolutionSelect = (solution: any) => {
    // Handle solution selection
    console.log('Selected solution:', solution);
  };

  const getHotspotsForFacility = (facilityType: string) => {
    // Filter hotspots by facility_type (now properly mapped)
    return hotspots.filter(hotspot => hotspot.facility_type === facilityType);
  };

  const getProductsForHotspot = (hotspot: Hotspot) => {
    if (!hotspot.product_ids || hotspot.product_ids.length === 0) return [];
    return products.filter(product => hotspot.product_ids.includes(product.id));
  };

  const currentHotspots = getHotspotsForFacility(selectedFacility);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading interactive guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      
      <div className="container mx-auto p-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('exploded.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('exploded.description')}
          </p>
        </div>

        {/* Facility Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('exploded.selectFacility')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {facilities.map((facility) => (
                <Button
                  key={facility.value}
                  variant={selectedFacility === facility.value ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setSelectedFacility(facility.value)}
                >
                  {facility.icon === 'Home' && <Home className="h-4 w-4" />}
                  {facility.icon === 'Building2' && <Building2 className="h-4 w-4" />}
                  {facility.icon === 'Factory' && <Factory className="h-4 w-4" />}
                  <span className="text-sm">
                    {facility.value === 'residential' && t('guide.building.residential')}
                    {facility.value === 'commercial' && t('guide.building.commercial')}
                    {facility.value === 'industrial' && t('guide.building.industrial')}
                    {facility.value === 'infrastructure' && t('guide.building.infrastructure')}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Building Diagram */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center">
                  {currentLanguage === 'zh-Hans' ? '建筑结构图' :
                   currentLanguage === 'zh-Hant' ? '建築結構圖' :
                   currentLanguage === 'ja' ? '建築構造図' :
                   currentLanguage === 'ko' ? '건축 구조도' :
                   currentLanguage === 'th' ? 'แผนภาพโครงสร้างอาคาร' :
                   currentLanguage === 'vi' ? 'Sơ đồ cấu trúc tòa nhà' :
                   'Building Structure Diagram'}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative h-full p-0">
                {/* Placeholder for building diagram */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Building2 className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {currentLanguage === 'zh-Hans' ? '建筑结构图' :
                       currentLanguage === 'zh-Hant' ? '建築結構圖' :
                       currentLanguage === 'ja' ? '建築構造図' :
                       currentLanguage === 'ko' ? '건축 구조도' :
                       currentLanguage === 'th' ? 'แผนภาพโครงสร้างอาคาร' :
                       currentLanguage === 'vi' ? 'Sơ đồ cấu trúc tòa nhà' :
                       'Building Structure Diagram'}
                    </p>
                    <p className="text-sm">
                      {currentLanguage === 'zh-Hans' ? '点击红色热点探索产品' :
                       currentLanguage === 'zh-Hant' ? '點擊紅色熱點探索產品' :
                       currentLanguage === 'ja' ? '赤いホットスポットをクリックして製品を探索' :
                       currentLanguage === 'ko' ? '빨간색 핫스팟을 클릭하여 제품 탐색' :
                       currentLanguage === 'th' ? 'คลิกที่จุดร้อนสีแดงเพื่อสำรวจผลิตภัณฑ์' :
                       currentLanguage === 'vi' ? 'Nhấp vào các điểm nóng màu đỏ để khám phá sản phẩm' :
                       'Click on red hotspots to explore products'}
                    </p>
                  </div>
                </div>

                {/* Hotspots */}
                {currentHotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    className="absolute w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-125 cursor-pointer group"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    onClick={() => handleHotspotClick(hotspot)}
                    title={hotspot.label}
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                      {hotspot.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Product Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedHotspot ? (
                <ProductPanel 
                  hotspot={{
                    ...selectedHotspot,
                    products: getProductsForHotspot(selectedHotspot)
                  }}
                  onClose={() => setSelectedHotspot(null)}
                />
              ) : (
                <Card className="h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-xl">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <div className="text-center animate-fade-in">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {t('guide.panel.selectHotspot')}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {t('guide.panel.selectHotspotDesc')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Solution Builder */}
        {selectedProducts.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    {currentLanguage === 'zh-Hans' ? 'AI 解决方案生成器' :
                     currentLanguage === 'zh-Hant' ? 'AI 解決方案生成器' :
                     currentLanguage === 'ja' ? 'AI ソリューションジェネレーター' :
                     currentLanguage === 'ko' ? 'AI 솔루션 생성기' :
                     currentLanguage === 'th' ? 'เครื่องสร้างโซลูชัน AI' :
                     currentLanguage === 'vi' ? 'Trình tạo giải pháp AI' :
                     'AI Solution Generator'}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSolutionBuilder(!showSolutionBuilder)}
                  >
                    {showSolutionBuilder ? 'Hide' : 'Show'} Solution Builder
                  </Button>
                </div>
              </CardHeader>
              {showSolutionBuilder && (
                <CardContent>
                  <SolutionBuilder
                    selectedProducts={selectedProducts}
                    facilityType={selectedFacility}
                    onSolutionSelect={handleSolutionSelect}
                  />
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guide;
