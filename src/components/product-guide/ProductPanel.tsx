import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Download, 
  ExternalLink, 
  Info,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  specifications: string[];
  applications: string[];
}

interface ProductPanelProps {
  hotspot: {
    id: string;
    label: string;
    category: string;
    description: string;
    products: Product[];
  } | null;
  onClose: () => void;
}

const ProductPanel: React.FC<ProductPanelProps> = ({ hotspot, onClose }) => {
  const { t } = useTranslation();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCardFlip = (productId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(productId)) {
      newFlipped.delete(productId);
    } else {
      newFlipped.add(productId);
    }
    setFlippedCards(newFlipped);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  if (!hotspot) {
    return (
      <Card className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-xl">
        <CardContent className="p-8 flex flex-col items-center justify-center h-full">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
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
    );
  }

  return (
    <div className="w-full h-full animate-slide-in">
      <Card className="w-full h-full bg-gradient-to-br from-white to-blue-50 border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {hotspot.label}
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                {hotspot.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white mt-2">
            {hotspot.category}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto h-full">
          <div className="space-y-6">
            <div className="text-center mb-6 animate-fade-in">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {t('guide.panel.recommendedProducts')}
              </h4>
              <p className="text-gray-600 text-sm">
                {t('guide.panel.clickToExplore')}
              </p>
            </div>

            <div className="grid gap-4">
              {hotspot.products.map((product, index) => (
                <div
                  key={product.id}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`relative w-full h-48 cursor-pointer transition-all duration-500 transform-style-preserve-3d ${
                      flippedCards.has(product.id) ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => handleCardFlip(product.id)}
                  >
                    {/* Front of card */}
                    <Card className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                      flippedCards.has(product.id) ? 'opacity-0' : 'opacity-100'
                    } bg-gradient-to-br from-white to-gray-50 hover:shadow-lg`}>
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 mb-2">
                              {product.name}
                            </h5>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {product.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">4.8</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductSelect(product);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Info className="h-4 w-4 mr-1" />
                              {t('guide.panel.details')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Back of card */}
                    <Card className={`absolute inset-0 w-full h-full transition-all duration-500 rotate-y-180 ${
                      flippedCards.has(product.id) ? 'opacity-100' : 'opacity-0'
                    } bg-gradient-to-br from-blue-50 to-indigo-100`}>
                      <CardContent className="p-6 h-full">
                        <div className="mb-4">
                          <h6 className="font-semibold text-gray-800 mb-2">
                            {t('guide.panel.specifications')}
                          </h6>
                          <ul className="space-y-1">
                            {product.specifications.map((spec, i) => (
                              <li key={i} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {spec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-4">
                          <h6 className="font-semibold text-gray-800 mb-2">
                            {t('guide.panel.applications')}
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {product.applications.map((app, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            {t('guide.panel.download')}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t('guide.panel.learnMore')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendation */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold text-gray-800 mb-1">
                    {t('guide.panel.aiRecommendation')}
                  </h6>
                  <p className="text-sm text-gray-600">
                    {t('guide.panel.aiRecommendationText')}
                  </p>
                  <Button size="sm" variant="ghost" className="mt-2 text-purple-600 hover:text-purple-700">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {t('guide.panel.viewSolution')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPanel; 