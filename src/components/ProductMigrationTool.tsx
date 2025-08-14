import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Database, ArrowRight, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { productService } from '@/services/productService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MigrationStatus {
  phase: 'idle' | 'analyzing' | 'migrating' | 'completed' | 'error';
  jsonProducts: number;
  databaseProducts: number;
  conflicts: string[];
  migrated: number;
  errors: string[];
}

export function ProductMigrationTool() {
  const [status, setStatus] = useState<MigrationStatus>({
    phase: 'idle',
    jsonProducts: 0,
    databaseProducts: 0,
    conflicts: [],
    migrated: 0,
    errors: []
  });

  const analyzeDataSources = async () => {
    setStatus(prev => ({ ...prev, phase: 'analyzing' }));
    
    try {
      // Get JSON products count
      const jsonProducts = await productService.getAllProducts();
      
      // Get database products count
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, name');
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Check for conflicts (same IDs in both sources)
      const jsonIds = new Set(jsonProducts.map(p => p.id));
      const dbIds = new Set((dbProducts || []).map(p => p.id));
      const conflicts = [...jsonIds].filter(id => dbIds.has(id));

      setStatus(prev => ({
        ...prev,
        phase: 'idle',
        jsonProducts: jsonProducts.length,
        databaseProducts: (dbProducts || []).length,
        conflicts
      }));

      toast.success('Analysis completed');
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        phase: 'error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }));
      toast.error('Analysis failed');
    }
  };

  const migrateToUnified = async () => {
    setStatus(prev => ({ ...prev, phase: 'migrating', migrated: 0, errors: [] }));
    
    try {
      // Switch to database mode temporarily
      productService.setStorageMode('database');
      
      // Migrate JSON products to database
      await productService.migrateToDatabase();
      
      // Switch to hybrid mode for production use
      productService.setStorageMode('hybrid');
      
      setStatus(prev => ({
        ...prev,
        phase: 'completed',
        migrated: prev.jsonProducts
      }));

      toast.success('Migration completed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({ 
        ...prev, 
        phase: 'error',
        errors: [errorMessage]
      }));
      toast.error('Migration failed');
    }
  };

  const resetMigration = () => {
    setStatus({
      phase: 'idle',
      jsonProducts: 0,
      databaseProducts: 0,
      conflicts: [],
      migrated: 0,
      errors: []
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Product Data Migration Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Status */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Source Issue Detected:</strong> Your admin panel and website are using different product data sources. 
            This tool will help you unify them into a single source of truth.
          </AlertDescription>
        </Alert>

        {/* Analysis Results */}
        {(status.jsonProducts > 0 || status.databaseProducts > 0) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Data Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{status.jsonProducts}</div>
                  <div className="text-sm text-muted-foreground">Website Products (JSON)</div>
                  <Badge variant="secondary" className="mt-2">Current Source</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{status.databaseProducts}</div>
                  <div className="text-sm text-muted-foreground">Admin Products (Database)</div>
                  <Badge variant="outline" className="mt-2">Separate Source</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{status.conflicts.length}</div>
                  <div className="text-sm text-muted-foreground">ID Conflicts</div>
                  {status.conflicts.length > 0 && (
                    <Badge variant="destructive" className="mt-2">Needs Resolution</Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {status.conflicts.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conflicts found:</strong> These product IDs exist in both sources: {status.conflicts.join(', ')}
                  <br />Migration will use the JSON version as the source of truth.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Migration Progress */}
        {status.phase === 'migrating' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Migration in Progress</h3>
            <div className="flex items-center gap-4">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Migrating products to unified system...</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {status.phase === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migration Completed!</strong> Successfully migrated {status.migrated} products to the unified system.
              Both admin panel and website now use the same data source.
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {status.phase === 'error' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migration Failed:</strong> {status.errors.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={analyzeDataSources}
            disabled={status.phase === 'analyzing' || status.phase === 'migrating'}
            variant="outline"
          >
            {status.phase === 'analyzing' ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Analyze Data Sources
              </>
            )}
          </Button>

          {status.jsonProducts > 0 && (
            <Button 
              onClick={migrateToUnified}
              disabled={status.phase === 'migrating' || status.phase === 'completed'}
            >
              {status.phase === 'migrating' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Migrate to Unified System
                </>
              )}
            </Button>
          )}

          {(status.phase === 'completed' || status.phase === 'error') && (
            <Button onClick={resetMigration} variant="outline">
              Reset
            </Button>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">What this migration does:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Uses the 8 website products as the source of truth</li>
            <li>• Migrates them to the database for admin management</li>
            <li>• Enables real-time sync between admin and website</li>
            <li>• Preserves all existing product data and images</li>
            <li>• Sets up proper categories and featured status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 