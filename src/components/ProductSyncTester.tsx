import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProductSyncTester = () => {
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const handleProductUpdate = (event: CustomEvent) => {
      setLastUpdate(`Product "${event.detail.name}" was updated`);
      setEventCount(prev => prev + 1);
    };

    const handleProductAdded = (event: CustomEvent) => {
      setLastUpdate(`Product "${event.detail.name}" was added`);
      setEventCount(prev => prev + 1);
    };

    const handleProductDeleted = (event: CustomEvent) => {
      setLastUpdate(`Product "${event.detail.name}" was deleted`);
      setEventCount(prev => prev + 1);
    };

    // Listen for product events
    window.addEventListener('productUpdated', handleProductUpdate as EventListener);
    window.addEventListener('productAdded', handleProductAdded as EventListener);
    window.addEventListener('productDeleted', handleProductDeleted as EventListener);

    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
      window.removeEventListener('productAdded', handleProductAdded as EventListener);
      window.removeEventListener('productDeleted', handleProductDeleted as EventListener);
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">🔄 Product Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Events:</span>
            <Badge variant="secondary">{eventCount}</Badge>
          </div>
          {lastUpdate && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              {lastUpdate}
            </div>
          )}
          {!lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Waiting for product changes...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSyncTester; 