import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ExplodedView = () => {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const facilityTypes = [
    {
      id: 'FACILITY_TYPE_1_ID',
      name: 'FACILITY_TYPE_1_NAME',
      description: 'FACILITY_TYPE_1_DESCRIPTION',
      icon: '🏠'
    },
    {
      id: 'FACILITY_TYPE_2_ID',
      name: 'FACILITY_TYPE_2_NAME',
      description: 'FACILITY_TYPE_2_DESCRIPTION',
      icon: '🏢'
    },
    {
      id: 'FACILITY_TYPE_3_ID',
      name: 'FACILITY_TYPE_3_NAME',
      description: 'FACILITY_TYPE_3_DESCRIPTION',
      icon: '🏫'
    },
    {
      id: 'FACILITY_TYPE_4_ID',
      name: 'FACILITY_TYPE_4_NAME',
      description: 'FACILITY_TYPE_4_DESCRIPTION',
      icon: '🏟️'
    },
    {
      id: 'FACILITY_TYPE_5_ID',
      name: 'FACILITY_TYPE_5_NAME',
      description: 'FACILITY_TYPE_5_DESCRIPTION',
      icon: '🏡'
    },
    {
      id: 'FACILITY_TYPE_6_ID',
      name: 'FACILITY_TYPE_6_NAME',
      description: 'FACILITY_TYPE_6_DESCRIPTION',
      icon: '🏥'
    },
    {
      id: 'FACILITY_TYPE_7_ID',
      name: 'FACILITY_TYPE_7_NAME',
      description: 'FACILITY_TYPE_7_DESCRIPTION',
      icon: '🏭'
    }
  ];

  const hotspots = [
    {
      id: 'HOTSPOT_1_ID',
      x: 25,
      y: 30,
      label: 'HOTSPOT_1_LABEL',
      products: [
        {
          name: 'HOTSPOT_1_PRODUCT_1_NAME',
          image: 'HOTSPOT_1_PRODUCT_1_IMAGE',
          description: 'HOTSPOT_1_PRODUCT_1_DESCRIPTION'
        },
        {
          name: 'HOTSPOT_1_PRODUCT_2_NAME',
          image: 'HOTSPOT_1_PRODUCT_2_IMAGE',
          description: 'HOTSPOT_1_PRODUCT_2_DESCRIPTION'
        }
      ]
    },
    {
      id: 'HOTSPOT_2_ID',
      x: 60,
      y: 45,
      label: 'HOTSPOT_2_LABEL',
      products: [
        {
          name: 'HOTSPOT_2_PRODUCT_1_NAME',
          image: 'HOTSPOT_2_PRODUCT_1_IMAGE',
          description: 'HOTSPOT_2_PRODUCT_1_DESCRIPTION'
        }
      ]
    },
    {
      id: 'HOTSPOT_3_ID',
      x: 80,
      y: 65,
      label: 'HOTSPOT_3_LABEL',
      products: [
        {
          name: 'HOTSPOT_3_PRODUCT_1_NAME',
          image: 'HOTSPOT_3_PRODUCT_1_IMAGE',
          description: 'HOTSPOT_3_PRODUCT_1_DESCRIPTION'
        },
        {
          name: 'HOTSPOT_3_PRODUCT_2_NAME',
          image: 'HOTSPOT_3_PRODUCT_2_IMAGE',
          description: 'HOTSPOT_3_PRODUCT_2_DESCRIPTION'
        },
        {
          name: 'HOTSPOT_3_PRODUCT_3_NAME',
          image: 'HOTSPOT_3_PRODUCT_3_IMAGE',
          description: 'HOTSPOT_3_PRODUCT_3_DESCRIPTION'
        }
      ]
    }
  ];

  const selectedFacilityData = facilityTypes.find(f => f.id === selectedFacility);
  const selectedHotspotData = hotspots.find(h => h.id === selectedHotspot);

  if (!selectedFacility) {
    // Facility selector
    return (
      <div className="min-h-screen bg-background">
        {/* Spacer to prevent header overlap */}
        <div style={{ height: '80px' }}></div>
        <div className="container mx-auto p-8">
          <div className="flex flex-col items-center mb-12">
            <h1 className="uniform-page-title">Guide</h1>
          </div>

          {/* Facility Type Selector */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Select Facility Type
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the type of facility to explore Aftek solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {facilityTypes.map((facility) => (
              <Button
                key={facility.id}
                variant="ghost"
                onClick={() => setSelectedFacility(facility.id)}
                className="h-auto p-0 bg-transparent hover:bg-transparent"
              >
                <Card className="w-full bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{facility.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {facility.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {facility.description}
                    </p>
                    <ArrowRight className="h-5 w-5 text-primary mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </CardContent>
                </Card>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Exploded view diagram
  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {selectedFacilityData?.name} - Exploded View
            </h1>
            <p className="text-lg text-muted-foreground">
              Click on hotspots to discover recommended Aftek products
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedFacility(null)}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Change Facility
          </Button>
        </div>

        {/* Interactive Diagram */}
        <div className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Diagram */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border shadow-card">
                <CardContent className="p-8">
                  <div className="relative h-96 bg-gradient-accent rounded-lg overflow-hidden">
                    {/* Facility diagram placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{selectedFacilityData?.icon}</div>
                        <p className="text-muted-foreground">
                          FACILITY_DIAGRAM_PLACEHOLDER_{selectedFacility}
                        </p>
                      </div>
                    </div>

                    {/* Interactive hotspots */}
                    {hotspots.map((hotspot) => (
                      <button
                        key={hotspot.id}
                        onClick={() => setSelectedHotspot(hotspot.id)}
                        className="absolute w-6 h-6 bg-primary rounded-full border-4 border-primary-foreground shadow-lg hover:scale-125 transition-transform duration-200 z-10"
                        style={{ 
                          left: `${hotspot.x}%`, 
                          top: `${hotspot.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <span className="sr-only">{hotspot.label}</span>
                      </button>
                    ))}

                    {/* Hotspot labels */}
                    {hotspots.map((hotspot) => (
                      <div
                        key={`${hotspot.id}-label`}
                        className="absolute text-sm font-medium text-foreground bg-background/90 px-2 py-1 rounded shadow-md pointer-events-none"
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
                </CardContent>
              </Card>
            </div>

            {/* Product Details Panel */}
            <div>
              <Card className="bg-card border-border shadow-card sticky top-24">
                <CardContent className="p-6">
                  {selectedHotspotData ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-foreground">
                          {selectedHotspotData.label}
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedHotspot(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                          Recommended Aftek Products:
                        </p>
                        
                        {selectedHotspotData.products.map((product, index) => (
                          <Card key={index} className="bg-muted/30 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <div className="w-16 h-16 bg-gradient-accent rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-muted-foreground text-center">
                                    {product.image}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground mb-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {product.description}
                                  </p>
                                  <Link to="/products">
                                    <Button size="sm" variant="outline" className="text-xs">
                                      View Product
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRight className="h-8 w-8 text-primary transform rotate-45" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Select a Hotspot
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Click on the red dots in the diagram to see recommended products for that area.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplodedView;