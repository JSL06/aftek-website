import React from 'react';
import { BackgroundImage } from '@/components/ui/BackgroundImage';
import { useBackgroundImages } from '@/hooks/useBackgroundImages';

// Example 1: Using the BackgroundImage component
export const BackgroundImageExample: React.FC = () => {
  return (
    <BackgroundImage 
      pageIdentifier="home"
      className="min-h-screen"
      fallbackBackground="#f0f0f0"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to AFTEK
        </h1>
        <p className="text-xl text-white/90">
          Your content goes here with automatic background image support
        </p>
      </div>
    </BackgroundImage>
  );
};

// Example 2: Using the hook for custom styling
export const CustomBackgroundExample: React.FC = () => {
  const { getBackgroundStyle, getBackgroundImage, isLoading } = useBackgroundImages();
  
  if (isLoading) {
    return <div>Loading background...</div>;
  }

  const backgroundStyle = getBackgroundStyle('about');
  const imageUrl = getBackgroundImage('about');

  return (
    <div 
      className="min-h-screen relative"
      style={backgroundStyle}
    >
      {/* Custom overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          About AFTEK
        </h1>
        <p className="text-xl text-white/90">
          Custom background with manual overlay control
        </p>
        
        {/* Show background info */}
        {imageUrl && (
          <div className="mt-4 p-4 bg-white/10 rounded backdrop-blur-sm">
            <p className="text-white/80 text-sm">
              Background image: {imageUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 3: Dynamic background switching
export const DynamicBackgroundExample: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const { getBackgroundStyle } = useBackgroundImages();

  const pages = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'products', name: 'Products' },
    { id: 'projects', name: 'Projects' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-sm p-4">
        <div className="container mx-auto flex gap-4">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === page.id 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic background */}
      <div 
        className="min-h-screen flex items-center justify-center"
        style={getBackgroundStyle(currentPage)}
      >
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">
            {pages.find(p => p.id === currentPage)?.name}
          </h1>
          <p className="text-xl opacity-80">
            Background changes dynamically based on selected page
          </p>
        </div>
      </div>
    </div>
  );
};

// Example 4: Background with content sections
export const ContentSectionExample: React.FC = () => {
  return (
    <BackgroundImage 
      pageIdentifier="products"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Our Products
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover AFTEK's innovative solutions for your business needs
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-white/95 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Product Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Adhesives', 'Coatings', 'Sealants'].map((category, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                <p className="text-gray-600">
                  High-quality {category.toLowerCase()} for industrial applications
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 AFTEK. All rights reserved.</p>
        </div>
      </section>
    </BackgroundImage>
  );
};

export default BackgroundImageExample;
