import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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

interface SolutionBuilderProps {
  selectedProducts: string[];
  facilityType: string;
  onSolutionSelect: (solution: Solution) => void;
}

const SolutionBuilder: React.FC<SolutionBuilderProps> = ({
  selectedProducts,
  facilityType,
  onSolutionSelect
}) => {
  const { t } = useTranslation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // Simulate AI analysis
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setIsAnalyzing(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            generateSolutions();
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [selectedProducts]);

  const generateSolutions = () => {
    // Mock AI-generated solutions
    const mockSolutions: Solution[] = [
      {
        id: 'solution-1',
        name: t('guide.solutions.comprehensive.name'),
        description: t('guide.solutions.comprehensive.description'),
        products: selectedProducts,
        compatibility: 95,
        cost: 'medium',
        complexity: 'moderate',
        estimatedTime: '2-3 weeks'
      },
      {
        id: 'solution-2',
        name: t('guide.solutions.budget.name'),
        description: t('guide.solutions.budget.description'),
        products: selectedProducts.slice(0, 2),
        compatibility: 85,
        cost: 'low',
        complexity: 'simple',
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'solution-3',
        name: t('guide.solutions.premium.name'),
        description: t('guide.solutions.premium.description'),
        products: [...selectedProducts, 'premium-coating', 'advanced-sealant'],
        compatibility: 98,
        cost: 'high',
        complexity: 'complex',
        estimatedTime: '3-4 weeks'
      }
    ];
    
    setSolutions(mockSolutions);
  };

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    onSolutionSelect(solution);
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'complex': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
              <Brain className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t('guide.ai.analyzing')}
            </h3>
            
            <div className="mb-6">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {progress}% {t('guide.ai.complete')}
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• {t('guide.ai.analyzingProducts')}</p>
              <p>• {t('guide.ai.checkingCompatibility')}</p>
              <p>• {t('guide.ai.generatingSolutions')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (solutions.length === 0) {
    return (
      <Card className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t('guide.ai.selectProducts')}
          </h3>
          <p className="text-gray-600 text-sm">
            {t('guide.ai.selectProductsDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t('guide.ai.recommendations')}
          </h2>
        </div>
        <p className="text-gray-600">
          {t('guide.ai.recommendationsDesc')}
        </p>
      </div>

      {/* Solutions Grid */}
      <div className="grid gap-6">
        {solutions.map((solution, index) => (
          <div
            key={solution.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedSolution?.id === solution.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSolutionSelect(solution)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {solution.name}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={getCostColor(solution.cost)}
                      >
                        {solution.cost}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {solution.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {solution.compatibility}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('guide.ai.compatibility')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800">
                      {t('guide.ai.cost')}
                    </div>
                    <Badge variant="outline" className={getCostColor(solution.cost)}>
                      {solution.cost}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800">
                      {t('guide.ai.complexity')}
                    </div>
                    <Badge variant="outline" className={getComplexityColor(solution.complexity)}>
                      {solution.complexity}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800">
                      {t('guide.ai.time')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {solution.estimatedTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {solution.products.length} {t('guide.ai.products')}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {t('guide.ai.select')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {selectedSolution && (
        <div className="flex gap-4 animate-fade-in">
          <Button className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('guide.ai.downloadPlan')}
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            {t('guide.ai.share')}
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('guide.ai.consult')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolutionBuilder; 