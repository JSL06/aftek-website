import React, { useState, useEffect } from 'react';
import { Check, Save, Clock, Shield, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { 
  getCartPrivacyPreference, 
  setCartPrivacyPreference, 
  CART_EXPIRY_DAYS 
} from '../utils/cartStorage';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface CartSaveIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function CartSaveIndicator({ className, showText = true }: CartSaveIndicatorProps) {
  const { cart, cartAge } = useCart();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [dontSaveCart, setDontSaveCart] = useState(false);

  // Load privacy preference on mount
  useEffect(() => {
    setDontSaveCart(getCartPrivacyPreference());
  }, []);

  // Show save animation when cart updates
  useEffect(() => {
    if (cart.items.length > 0) {
      setSaveStatus('saving');
      setShowSaveAnimation(true);
      
      const timer = setTimeout(() => {
        setSaveStatus('saved');
        setShowSaveAnimation(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cart.totalItems, cart.totalPrice]);

  const handlePrivacyToggle = (checked: boolean) => {
    setDontSaveCart(checked);
    setCartPrivacyPreference(checked);
  };

  const formatCartInfo = () => {
    if (cart.items.length === 0) {
      return 'No items in cart';
    }

    const expiry = new Date(cart.expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return `Cart saved${cartAge > 0 ? ` (${cartAge} day${cartAge > 1 ? 's' : ''} old)` : ''} • Expires in ${daysUntilExpiry} days`;
  };

  const getSaveIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Save className={cn("h-3 w-3 animate-pulse", showSaveAnimation && "animate-bounce")} />;
      case 'saved':
        return <Check className={cn("h-3 w-3 text-green-600", showSaveAnimation && "animate-bounce")} />;
      case 'error':
        return <Clock className="h-3 w-3 text-red-600" />;
    }
  };

  if (cart.items.length === 0 && !showText) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2 text-xs text-gray-500", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              {getSaveIcon()}
              {showText && (
                <span className={cn(
                  "transition-colors duration-200",
                  saveStatus === 'saved' && "text-green-600",
                  saveStatus === 'saving' && "text-blue-600",
                  saveStatus === 'error' && "text-red-600"
                )}>
                  {dontSaveCart ? 'Session only' : formatCartInfo()}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-center">
              <p className="font-medium mb-1">
                {dontSaveCart ? 'Cart stored in session only' : 'Cart saved on this device'}
              </p>
              <p className="text-xs text-gray-600">
                {dontSaveCart 
                  ? 'Cart will be lost when you close the browser'
                  : `Automatically saved for ${CART_EXPIRY_DAYS} days`
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Items won't appear on other devices
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-1 text-gray-400 hover:text-gray-600">
              <Shield className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cart Privacy Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="session-only">Session-only cart</Label>
                  <p className="text-xs text-gray-600">
                    Don't save cart between browser sessions
                  </p>
                </div>
                <Switch
                  id="session-only"
                  checked={dontSaveCart}
                  onCheckedChange={handlePrivacyToggle}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2">
                <p><strong>How your cart is stored:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• No account or login required</li>
                  <li>• Stored only on this device/browser</li>
                  <li>• {dontSaveCart ? 'Cleared when browser closes' : `Kept for ${CART_EXPIRY_DAYS} days`}</li>
                  <li>• Not synced across devices</li>
                  <li>• Can be cleared anytime</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setPrivacyDialogOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 