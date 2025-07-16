import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { CartSaveIndicator } from './CartSaveIndicator';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction
} from './ui/alert-dialog';
import { cn } from '../lib/utils';

interface CartDropdownProps {
  onClose: () => void;
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleQuantityChange = (productId: string, change: number) => {
    const currentItem = cart.items.find(item => item.id === productId);
    if (currentItem) {
      const newQuantity = currentItem.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (cart.items.length === 0) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 animate-in slide-in-from-top-2 duration-200">
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-4">Add some products to get started</p>
          <Button 
            onClick={onClose}
            asChild
            className="w-full"
          >
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white rounded-lg shadow-xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Shopping Cart ({cart.totalItems})
          </h3>
          {cart.items.length > 0 && (
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Clear entire cart?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} from your cart. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      clearCart();
                      setClearDialogOpen(false);
                      onClose();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="max-h-80">
        <div className="p-4 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 group">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border border-gray-200"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                
                {/* Price and Quantity */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal and Remove */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Cart Summary */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
            <span className="font-medium">{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full"
            onClick={onClose}
            asChild
          >
            <Link to="/cart">
              View Cart & Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
            asChild
          >
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Cart Save Indicator */}
        <div className="px-4 pb-2">
          <CartSaveIndicator className="justify-center" />
        </div>
      </div>
    </div>
  );
} 