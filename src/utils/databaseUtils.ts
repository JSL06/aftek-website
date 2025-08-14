import { supabase } from '@/integrations/supabase/client';

// Placeholder products for each category
const placeholderProducts = [
  {
    name: 'Waterproof Membrane Pro',
    category: 'Waterproofing',
    description: 'High-performance waterproofing membrane for roofs and foundations. Provides excellent water resistance and durability.',
    features: ['Waterproof', 'Weather Resistant', 'UV Stable', 'Membrane Systems'],
    specifications: {
      'Thickness': '2mm',
      'Elongation': '800%',
      'Temperature Range': '-40°C to +90°C',
      'Coverage': '1.5 sqm per liter'
    },
    image: '[PRODUCT_IMAGE_WATERPROOF_MEMBRANE]',
    isActive: true,
    order: 1,
    price: '$45.00',
    rating: 4.5
  },
  {
    name: 'Structural Repair Compound',
    category: 'Redi-Mix G&M',
    description: 'Advanced repair compound for structural concrete repairs. High strength and fast curing.',
    features: ['High Strength', 'Quick Set', 'Non-Shrink', 'Structural Bonding'],
    specifications: {
      'Compressive Strength': '50 MPa',
      'Cure Time': '24 hours',
      'Bond Strength': '2.5 MPa',
      'Shrinkage': '<0.02%'
    },
    image: '[PRODUCT_IMAGE_REPAIR_COMPOUND]',
    isActive: true,
    order: 2,
    price: '$28.50',
    rating: 4.8
  },
  {
    name: 'Flexible Construction Adhesive',
    category: 'Sealants & Adhesives',
    description: 'Multi-purpose construction adhesive for bonding various building materials. Excellent flexibility and weather resistance.',
    features: ['Weather Resistant', 'Movement Accommodation', 'Structural Bonding', 'Fast Cure'],
    specifications: {
      'Shear Strength': '1.8 MPa',
      'Elongation': '300%',
      'Cure Time': '2-4 hours',
      'Temperature Range': '-20°C to +80°C'
    },
    image: '[PRODUCT_IMAGE_CONSTRUCTION_ADHESIVE]',
    isActive: true,
    order: 3,
    price: '$32.00',
    rating: 4.6
  },
  {
    name: 'Silicone Sealant Plus',
    category: 'Sealants & Adhesives',
    description: 'Premium silicone sealant for joints and gaps. Excellent weather resistance and movement capability.',
    features: ['Weather Seal', 'Movement Accommodation', 'UV Stable', 'Weather Resistant'],
    specifications: {
      'Movement Capability': '±25%',
      'Temperature Range': '-40°C to +150°C',
      'Cure Time': '24 hours',
      'Elongation': '400%'
    },
    image: '[PRODUCT_IMAGE_SILICONE_SEALANT]',
    isActive: true,
    order: 4,
    price: '$18.75',
    rating: 4.7
  },
  {
    name: 'Epoxy Protective Coating',
    category: 'Others (Insulation, Coatings)',
    description: 'Durable epoxy coating for industrial floors and surfaces. Chemical resistant and easy to clean.',
    features: ['Chemical Resistant', 'Epoxy Coatings', 'Anti-Slip', 'Load Bearing'],
    specifications: {
      'Thickness': '2-3mm',
      'Chemical Resistance': 'Excellent',
      'Abrasion Resistance': 'High',
      'Cure Time': '8-12 hours'
    },
    image: '[PRODUCT_IMAGE_EPOXY_COATING]',
    isActive: true,
    order: 5,
    price: '$65.00',
    rating: 4.9
  },
  {
    name: 'High-Strength Grout Mix',
    category: 'Redi-Mix G&M',
    description: 'Pre-mixed high-strength grout for tile installation and structural applications.',
    features: ['High Strength', 'Non-Shrink', 'Quick Set', 'Load Bearing'],
    specifications: {
      'Compressive Strength': '35 MPa',
      'Shrinkage': '<0.01%',
      'Cure Time': '4-6 hours',
      'Coverage': '1.2 sqm per 25kg'
    },
    image: '[PRODUCT_IMAGE_GROUT_MIX]',
    isActive: true,
    order: 6,
    price: '$22.50',
    rating: 4.4
  },
  {
    name: 'Concrete Additive Plus',
    category: 'Redi-Mix G&M',
    description: 'Advanced concrete additive for improved workability and strength. Reduces water content and enhances durability.',
    features: ['High Strength', 'Non-Shrink', 'Fast Cure', 'Strengthening'],
    specifications: {
      'Water Reduction': '15-20%',
      'Strength Increase': '25%',
      'Dosage': '0.5-1.5% by weight',
      'Compatibility': 'All cement types'
    },
    image: '[PRODUCT_IMAGE_CONCRETE_ADDITIVE]',
    isActive: true,
    order: 7,
    price: '$15.25',
    rating: 4.3
  },
  {
    name: 'Industrial Flooring System',
    category: 'Flooring Systems',
    description: 'Complete industrial flooring system with epoxy base and polyurethane topcoat. Ideal for heavy-duty applications.',
    features: ['Epoxy Coatings', 'Anti-Slip', 'Load Bearing', 'Chemical Resistant'],
    specifications: {
      'Thickness': '3-5mm',
      'Abrasion Resistance': 'Excellent',
      'Chemical Resistance': 'High',
      'Cure Time': '16-24 hours'
    },
    image: '[PRODUCT_IMAGE_FLOORING_SYSTEM]',
    isActive: true,
    order: 8,
    price: '$85.00',
    rating: 4.8
  }
];

export const populateProducts = async () => {
  try {
    console.log('Starting product population...');
    
    // First, delete all existing products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products
    
    if (deleteError) {
      console.error('Error deleting existing products:', deleteError);
      return { success: false, error: deleteError };
    }

    console.log('Existing products deleted successfully');

    // Insert new placeholder products
    const { data, error } = await supabase
      .from('products')
      .insert(placeholderProducts);

    if (error) {
      console.error('Error inserting products:', error);
      return { success: false, error };
    }

    console.log('Successfully populated products:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in populateProducts:', error);
    return { success: false, error };
  }
};

// Function to clear all products
export const clearAllProducts = async () => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
      console.error('Error clearing products:', error);
      return { success: false, error };
    }
    
    console.log('All products cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in clearAllProducts:', error);
    return { success: false, error };
  }
};

// Function to get current products
export const getCurrentProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Error fetching products:', error);
      return { success: false, error };
    }
    
    console.log('Current products:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in getCurrentProducts:', error);
    return { success: false, error };
  }
};

// Make functions available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).populateProducts = populateProducts;
  (window as any).clearAllProducts = clearAllProducts;
  (window as any).getCurrentProducts = getCurrentProducts;
} 