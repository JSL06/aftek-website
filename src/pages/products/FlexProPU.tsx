import React from 'react';
import { Link } from 'react-router-dom';

const FlexProPU = () => {
  // Placeholder product data
  const product = {
    name: 'FlexPro PU',
    description: 'High-performance polyurethane sealant for construction joints and bonding applications.',
    details: 'One-component, moisture-curing, flexible, and durable. Suitable for a wide range of substrates.',
    useCases: [
      'Expansion joints in concrete',
      'Window and door frame sealing',
      'General construction bonding',
    ],
    recommended: [
      { name: 'MP-Plus Neutral Silicone', link: '/products/mp-plus-neutral-silicone' },
      { name: 'AquaShield Membrane', link: '/products/aquashield-membrane' },
    ],
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <Link to="/products" className="text-primary hover:underline mb-6 inline-block">← Back to Products</Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
      <p className="text-lg text-muted-foreground mb-6">{product.description}</p>
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Product Details</h2>
        <p>{product.details}</p>
          </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Main Use Cases</h2>
        <ul className="list-disc list-inside text-muted-foreground">
          {product.useCases.map((use, i) => <li key={i}>{use}</li>)}
        </ul>
            </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Recommended Products</h2>
        <ul className="flex flex-wrap gap-4">
          {product.recommended.map((rec, i) => (
            <li key={i}>
              <Link to={rec.link} className="text-primary hover:underline">{rec.name}</Link>
            </li>
          ))}
        </ul>
        </div>
    </div>
  );
};

export default FlexProPU;