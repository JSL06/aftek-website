import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Cart, CartItem, CartContextType, AddToCartNotification } from '../types/cart';
import { toast } from 'sonner';
import { 
  createEmptyCart, 
  loadCart, 
  saveCartSafely, 
  getCartAge, 
  shouldShowWelcomeBack, 
  markWelcomeBackShown,
  clearAllCartData,
  isIncognitoMode,
  CART_EXPIRY_DAYS 
} from '../utils/cartStorage';

interface CartState extends Cart {
  notifications: AddToCartNotification[];
}

type CartAction = 
  | { type: 'ADD_TO_CART'; payload: any }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'ADD_NOTIFICATION'; payload: AddToCartNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: CartState = {
  ...createEmptyCart(),
  notifications: []
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        const maxQty = product.maxQuantity || 99;
        const newQuantity = Math.min(existingItem.quantity + 1, maxQty);
        
        if (newQuantity === existingItem.quantity) {
          toast.warning(`Maximum quantity (${maxQty}) reached for ${product.name}`);
          return state;
        }
        
        newItems = state.items.map(item =>
          item.id === product.id 
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          sku: product.model || product.sku,
          category: product.category,
          maxQuantity: product.maxQuantity || 99
        };
        newItems = [...state.items, newItem];
      }

      const newState = calculateTotals({ ...state, items: newItems });
      
      // Add notification
      const notification: AddToCartNotification = {
        id: `${Date.now()}-${product.id}`,
        product: newItems.find(item => item.id === product.id)!,
        timestamp: Date.now()
      };
      
      toast.success(`${product.name} added to cart`);
      
      return {
        ...newState,
        notifications: [...state.notifications, notification]
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return calculateTotals({ ...state, items: newItems });
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== id);
        return calculateTotals({ ...state, items: newItems });
      }

      const newItems = state.items.map(item => {
        if (item.id === id) {
          const maxQty = item.maxQuantity || 99;
          const newQuantity = Math.min(quantity, maxQty);
          
          if (newQuantity < quantity) {
            toast.warning(`Maximum quantity (${maxQty}) reached for ${item.name}`);
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return calculateTotals({ ...state, items: newItems });
    }

    case 'CLEAR_CART':
      return { ...initialState, notifications: state.notifications };

    case 'LOAD_CART':
      return { ...state, ...action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    default:
      return state;
  }
}

function calculateTotals(state: CartState): CartState {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    ...state,
    totalItems,
    totalPrice
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [hasShownWelcomeBack, setHasShownWelcomeBack] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCart();
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: savedCart });
      
      // Show welcome back message if appropriate
      if (shouldShowWelcomeBack(savedCart) && !hasShownWelcomeBack) {
        const cartAge = getCartAge(savedCart);
        const lastUpdated = new Date(savedCart.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));
        
        let welcomeMessage = `Welcome back! You have ${savedCart.totalItems} items in your cart`;
        
        if (cartAge > 0) {
          welcomeMessage += ` from ${cartAge} day${cartAge > 1 ? 's' : ''} ago`;
        } else if (hoursSinceUpdate > 1) {
          welcomeMessage += ` from ${hoursSinceUpdate} hour${hoursSinceUpdate > 1 ? 's' : ''} ago`;
        }
        
        toast.info(welcomeMessage + '.', {
          duration: 5000,
          action: {
            label: 'View Cart',
            onClick: () => window.location.href = '/cart'
          }
        });
        
        markWelcomeBackShown();
        setHasShownWelcomeBack(true);
      }
    }
  }, [hasShownWelcomeBack]);

  // Save cart whenever it changes
  useEffect(() => {
    if (state.items.length > 0 || state.totalItems > 0) {
      const cartToSave = {
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        createdAt: state.createdAt,
        lastUpdated: new Date().toISOString(),
        expiresAt: state.expiresAt,
        deviceId: state.deviceId,
        version: state.version
      };
      
      saveCartSafely(cartToSave);
    }
  }, [state.items, state.totalItems, state.totalPrice]);

  // Periodic auto-save (every 30 seconds if cart has items)
  useEffect(() => {
    if (state.items.length === 0) return;

    const autoSaveInterval = setInterval(() => {
      const cartToSave = {
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        createdAt: state.createdAt,
        lastUpdated: new Date().toISOString(),
        expiresAt: state.expiresAt,
        deviceId: state.deviceId,
        version: state.version
      };
      
      saveCartSafely(cartToSave);
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [state.items.length, state]);

  // Save cart on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.items.length > 0) {
        const cartToSave = {
          items: state.items,
          totalItems: state.totalItems,
          totalPrice: state.totalPrice,
          createdAt: state.createdAt,
          lastUpdated: new Date().toISOString(),
          expiresAt: state.expiresAt,
          deviceId: state.deviceId,
          version: state.version
        };
        
        // Use synchronous localStorage for beforeunload
        try {
          const cartString = JSON.stringify(cartToSave);
          localStorage.setItem('aftek_shopping_cart', cartString);
        } catch (e) {
          console.error('Failed to save cart on unload:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    state.notifications.forEach(notification => {
      const timeoutId = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, 5000);

      return () => clearTimeout(timeoutId);
    });
  }, [state.notifications]);

  const addToCart = (product: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity: newQuantity } });
  };

  const clearCart = () => {
    if (state.items.length === 0) {
      toast.info('Cart is already empty');
      return;
    }
    
    // Clear cart data and reset to empty state
    clearAllCartData();
    const emptyCart = createEmptyCart();
    dispatch({ type: 'LOAD_CART', payload: emptyCart });
    toast.success('Cart cleared successfully');
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const contextValue: CartContextType = {
    cart: {
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
      createdAt: state.createdAt,
      lastUpdated: state.lastUpdated,
      expiresAt: state.expiresAt,
      deviceId: state.deviceId,
      version: state.version
    },
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
    cartAge: getCartAge(state),
    isCartExpired: new Date(state.expiresAt) <= new Date(),
    saveIndicator: false // We'll implement this properly
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 