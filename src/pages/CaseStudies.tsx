import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Calendar, Users, ArrowRight, FileText } from 'lucide-react';

const CaseStudies = () => {
  const caseStudies = [
    {
      title: 'Marina Bay Financial Centre',
      location: 'Singapore',
      year: '2019-2021',
      category: 'Commercial High-Rise',
      image: '/placeholder-project-1.jpg',
      description: 'Comprehensive sealant and waterproofing solution for 50-story mixed-use development.',
      products: ['Flex-Pro PU', 'AquaShield Membrane', 'ThermaBlock Insulation'],
      challenges: [
        'Extreme weather exposure',
        'Complex curtain wall geometry',
        'Accelerated construction schedule'
      ],
      solutions: [
        'Flex-Pro PU for all expansion joints with ±25% movement capability',
        'Custom AquaShield application for rooftop areas',
        'Integrated waterproofing system reducing installation time by 30%'
      ],
      results: [
        'Zero leakage after 3 years of operation',
        '15% reduction in HVAC costs due to superior insulation',
        'LEED Gold certification achieved'
      ]
    },
    {
      title: 'Kuala Lumpur Convention Centre Expansion',
      location: 'Malaysia',
      year: '2020-2022',
      category: 'Public Infrastructure',
      image: '/placeholder-project-2.jpg',
      description: 'Large-scale renovation and expansion requiring specialized acoustic and thermal solutions.',
      products: ['SoundBlock Pro', 'Flex-Pro PU', 'EpoxyFloor Industrial'],
      challenges: [
        'Noise control requirements',
        'Existing structure integration',
        'High-traffic flooring needs'
      ],
      solutions: [
        'SoundBlock Pro acoustic insulation system',
        'Phased installation to maintain operations',
        'EpoxyFloor Industrial for exhibition areas'
      ],
      results: [
        '40dB noise reduction achieved',
        'Seamless integration with existing structures',
        'Enhanced facility capacity by 60%'
      ]
    },
    {
      title: 'Bangkok Residential Complex',
      location: 'Thailand',
      year: '2018-2020',
      category: 'Residential',
      image: '/placeholder-project-3.jpg',
      description: '1,200-unit residential development with focus on durability and cost-effectiveness.',
      products: ['MP-Plus Neutral Silicone', 'WaterGuard Membrane'],
      challenges: [
        'Monsoon weather protection',
        'Budget constraints',
        'Large-scale application consistency'
      ],
      solutions: [
        'MP-Plus Neutral Silicone for all window and door sealing',
        'WaterGuard Membrane for balcony and bathroom areas',
        'Standardized application procedures and quality control'
      ],
      results: [
        '98% resident satisfaction with weather protection',
        '20% cost savings vs. premium alternatives',
        'Zero warranty claims after 4 years'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Case Studies
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Real-world applications showcasing Aftek's solutions across diverse construction projects
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="space-y-16">
            {caseStudies.map((study, index) => (
              <Card key={index} className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="h-80 lg:h-auto bg-gradient-accent flex items-center justify-center">
                    <Building className="h-16 w-16 text-primary" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8 lg:p-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="secondary">{study.category}</Badge>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {study.location}
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {study.year}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {study.title}
                    </h2>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {study.description}
                    </p>
                    
                    {/* Products Used */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Products Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {study.products.map((product, productIndex) => (
                          <Badge key={productIndex} variant="outline" className="text-primary border-primary">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Key Results */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Key Results</h3>
                      <div className="space-y-2">
                        {study.results.map((result, resultIndex) => (
                          <div key={resultIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-muted-foreground text-sm">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full sm:w-auto">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Full Case Study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let our technical experts help you select the right solutions for your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary-hover">
                <Users className="mr-2 h-5 w-5" />
                Consult Our Experts
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="mr-2 h-5 w-5" />
                Request Project Quote
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;