import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Users, Package } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';

const CompanySelector: React.FC = () => {
  const { currentCompany, setCurrentCompany, allCompanies } = useCompany();
  const navigate = useNavigate();

  const handleCompanySelect = (companyId: string) => {
    setCurrentCompany(companyId);
    // Navigate to the company's route
    const company = allCompanies.find(c => c.id === companyId);
    if (company) {
      navigate(company.route);
    }
  };

  const getCompanyIcon = (companyId: string) => {
    switch (companyId) {
      case 'aftek':
        return <Building2 className="h-8 w-8 text-red-600" />;
      case 'rla':
        return <Package className="h-8 w-8 text-blue-600" />;
      case 'itls':
        return <Globe className="h-8 w-8 text-green-600" />;
      default:
        return <Building2 className="h-8 w-8 text-gray-600" />;
    }
  };

  const getCompanyColor = (companyId: string) => {
    switch (companyId) {
      case 'aftek':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'rla':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'itls':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">選擇公司</h2>
        <p className="text-muted-foreground text-lg">
          選擇您要管理的公司。所有公司共享相同的產品目錄和管理功能。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {allCompanies.map((company) => (
          <Card
            key={company.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              currentCompany.id === company.id 
                ? 'ring-2 ring-primary ring-offset-2' 
                : getCompanyColor(company.id)
            }`}
            onClick={() => handleCompanySelect(company.id)}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                {getCompanyIcon(company.id)}
              </div>
              <CardTitle className="text-xl font-bold">{company.displayName}</CardTitle>
              <Badge 
                variant={currentCompany.id === company.id ? 'default' : 'secondary'}
                className="mt-2"
              >
                {currentCompany.id === company.id ? '當前選擇' : '點擊選擇'}
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{company.contactInfo.phone}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{company.domain}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant={currentCompany.id === company.id ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleCompanySelect(company.id)}
                >
                  {currentCompany.id === company.id ? '管理此公司' : '選擇此公司'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">關於多公司管理</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li>• 所有公司共享相同的產品目錄和數據庫</li>
            <li>• 每個公司都有獨特的品牌標識和顏色主題</li>
            <li>• 管理功能在所有公司間保持一致</li>
            <li>• 可以輕鬆在公司和功能間切換</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
