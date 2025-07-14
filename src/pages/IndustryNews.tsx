import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, TrendingUp, Calendar, Clock, ArrowRight } from 'lucide-react';
import { FilterSection, FilterCategory, FilterButton } from '@/components/ui/filter-section';

const IndustryNews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Technology', 'Sustainability', 'Market Trends', 'Innovation', 'Industry Updates'];

  const featuredNews = {
    title: '[FEATURED_NEWS_TITLE_PLACEHOLDER] Revolutionary Waterproofing Technology Reduces Construction Time by 40%',
    excerpt: '[FEATURED_NEWS_EXCERPT_PLACEHOLDER] A breakthrough in polymer-based waterproofing materials has been developed, offering superior durability while significantly reducing application time and labor costs. This innovation represents a major step forward in sustainable construction practices.',
    category: 'Innovation',
    date: '2024-01-15',
    readTime: '5 min read'
  };

  const newsArticles = [
    {
      title: '[NEWS_1_TITLE_PLACEHOLDER] Smart Materials Revolutionize Building Efficiency',
      excerpt: '[NEWS_1_EXCERPT_PLACEHOLDER] Advanced composite materials are transforming how we approach energy efficiency in modern construction.',
      category: 'Technology',
      date: '2024-01-10',
      readTime: '3 min read',
      icon: TrendingUp
    },
    {
      title: '[NEWS_2_TITLE_PLACEHOLDER] Green Building Standards Update 2024',
      excerpt: '[NEWS_2_EXCERPT_PLACEHOLDER] New international standards for sustainable construction materials have been announced.',
      category: 'Sustainability',
      date: '2024-01-08',
      readTime: '4 min read',
      icon: TrendingUp
    },
    {
      title: '[NEWS_3_TITLE_PLACEHOLDER] Market Analysis: Construction Materials Q4 2023',
      excerpt: '[NEWS_3_EXCERPT_PLACEHOLDER] Comprehensive analysis of market trends and price movements in the construction materials sector.',
      category: 'Market Trends',
      date: '2024-01-05',
      readTime: '6 min read',
      icon: TrendingUp
    },
    {
      title: '[NEWS_4_TITLE_PLACEHOLDER] AI-Powered Quality Control in Manufacturing',
      excerpt: '[NEWS_4_EXCERPT_PLACEHOLDER] How artificial intelligence is improving quality assurance in construction material production.',
      category: 'Technology',
      date: '2024-01-03',
      readTime: '4 min read',
      icon: TrendingUp
    },
    {
      title: '[NEWS_5_TITLE_PLACEHOLDER] Circular Economy in Construction',
      excerpt: '[NEWS_5_EXCERPT_PLACEHOLDER] Innovative approaches to recycling and reusing construction materials.',
      category: 'Sustainability',
      date: '2024-01-01',
      readTime: '5 min read',
      icon: TrendingUp
    },
    {
      title: '[NEWS_6_TITLE_PLACEHOLDER] Regional Construction Boom Analysis',
      excerpt: '[NEWS_6_EXCERPT_PLACEHOLDER] Detailed examination of construction growth patterns across different regions.',
      category: 'Industry Updates',
      date: '2023-12-28',
      readTime: '7 min read',
      icon: TrendingUp
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const clearFilters = () => {
    setActiveCategory('All');
  };

  const hasActiveFilters = activeCategory !== 'All';

  const filteredArticles = activeCategory === 'All' 
    ? newsArticles 
    : newsArticles.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Industry News & Insights
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Stay informed with the latest developments in construction materials and building technology
            </p>
          </div>
        </div>
      </section>

      {/* Search and Newsletter */}
      <section className="py-12 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Search */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Search Articles</h3>
                <div className="relative">
                  <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search industry news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Weekly Newsletter</h3>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary-hover flex-shrink-0">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Article</h2>
          </div>
          
          <Card className="bg-card border-border shadow-elegant max-w-6xl mx-auto overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="h-80 lg:h-auto bg-gradient-accent flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-primary" />
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary">{featuredNews.category}</Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(featuredNews.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {featuredNews.readTime}
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {featuredNews.title}
                </h2>
                
                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                  {featuredNews.excerpt}
                </p>
                
                <Button size="lg" className="bg-primary hover:bg-primary-hover">
                  Read Full Article
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <FilterSection
            title="Filter News"
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          >
            <FilterCategory title="News Categories">
              {categories.map((category) => (
                <FilterButton
                  key={category}
                  label={category}
                  isSelected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </FilterCategory>
          </FilterSection>
        </div>
      </section>

      {/* News Articles Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <Card key={index} className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <article.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(article.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Stay Ahead of Industry Trends
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Get weekly insights, market analysis, and technical updates delivered directly to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-foreground"
                required
              />
              <Button type="submit" size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 flex-shrink-0">
                <Mail className="mr-2 h-5 w-5" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndustryNews;