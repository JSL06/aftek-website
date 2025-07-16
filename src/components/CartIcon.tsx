import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CartDropdown } from './CartDropdown';
import { cn } from '../lib/utils';

export function CartIcon() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        {cart.totalItems > 0 && (
          <span 
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium",
              "animate-in zoom-in-50 duration-200",
              cart.totalItems > 99 ? "text-[10px]" : "text-xs"
            )}
          >
            {cart.totalItems > 99 ? '99+' : cart.totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <CartDropdown onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
} 