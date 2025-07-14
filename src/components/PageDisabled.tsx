import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface PageDisabledProps {
  pageName: string;
}

const PageDisabled = ({ pageName }: PageDisabledProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fcf7ed] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Page Temporarily Unavailable
          </h1>
          <p className="text-muted-foreground mb-6">
            The {pageName} page is currently disabled. Please check back later or contact the administrator.
          </p>
          <Link to="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageDisabled; 