import { Cart, CartItem } from '../types/cart';
import { toast } from 'sonner';

// Constants
export const CART_STORAGE_KEY = 'aftek_shopping_cart';
export const CART_EXPIRY_DAYS = 30;
export const DONT_SAVE_CART_KEY = 'aftek_dont_save_cart';
export const WELCOMED_BACK_KEY = 'aftek_welcomed_back';
export const CART_VERSION = 2; // Increment when cart structure changes

// Generate a simple device ID for cart tracking
function generateDeviceId(): string {
  let deviceId = localStorage.getItem('aftek_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    try {
      localStorage.setItem('aftek_device_id', deviceId);
    } catch (e) {
      // Fallback if localStorage is full
      deviceId = 'temp_' + Math.random().toString(36).substr(2, 9);
    }
  }
  return deviceId;
}

// Create empty cart with metadata
export function createEmptyCart(): Cart {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
  
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    createdAt: now.toISOString(),
    lastUpdated: now.toISOString(),
    expiresAt: expiryDate.toISOString(),
    deviceId: generateDeviceId(),
    version: CART_VERSION
  };
}

// Check if running in incognito/private mode
export function isIncognitoMode(): boolean {
  try {
    // Test if localStorage persists
    const test = 'incognito_test';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    
    // Additional checks for different browsers
    if ((window.navigator as any).webkitTemporaryStorage) {
      // Chrome/Safari private mode detection
      return new Promise<boolean>((resolve) => {
        (window.navigator as any).webkitTemporaryStorage.queryUsageAndQuota(
          () => resolve(false),
          () => resolve(true)
        );
      }) as any;
    }
    
    // Firefox private mode has reduced storage quota
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        return estimate.quota! < 120000000; // Less than ~120MB indicates private mode
      });
    }
    
    return false;
  } catch (e) {
    return true; // Assume private mode if localStorage access fails
  }
}

// Check storage availability and quota
export function checkStorageAvailability(): { available: boolean; quota?: number; usage?: number } {
  try {
    const test = 'storage_test';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    
    // Modern browsers support storage estimation
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        return {
          available: true,
          quota: estimate.quota,
          usage: estimate.usage
        };
      });
    }
    
    return { available: true };
  } catch (e) {
    return { available: false };
  }
}

// Safe cart saving with quota handling
export function saveCartSafely(cart: Cart): boolean {
  try {
    // Check if user opted out of cart saving
    if (localStorage.getItem(DONT_SAVE_CART_KEY) === 'true') {
      // Use sessionStorage instead
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return true;
    }
    
    const cartString = JSON.stringify(cart);
    
    // Check if cart size is too large (4MB warning threshold)
    if (cartString.length > 4 * 1024 * 1024) {
      console.warn('Cart size approaching localStorage limit');
      toast.warning('Cart is getting large - some features may be limited');
      
      // Try to compress by removing non-essential data
      const compressedCart = {
        ...cart,
        // Remove device history or other non-essential data if needed
      };
      
      const compressedString = JSON.stringify(compressedCart);
      localStorage.setItem(CART_STORAGE_KEY, compressedString);
      return true;
    }
    
    localStorage.setItem(CART_STORAGE_KEY, cartString);
    return true;
    
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      toast.error('Unable to save cart - storage full. Consider clearing browser data.');
      
      // Try to save in sessionStorage as fallback
      try {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        toast.info('Cart saved temporarily for this session only');
        return true;
      } catch (sessionError) {
        toast.error('Unable to save cart anywhere - storage completely full');
        return false;
      }
    }
    
    console.error('Error saving cart:', e);
    return false;
  }
}

// Load cart with expiry and migration handling
export function loadCart(): Cart | null {
  try {
    // Check localStorage first
    let savedCartString = localStorage.getItem(CART_STORAGE_KEY);
    let fromSession = false;
    
    // Fallback to sessionStorage if not found in localStorage
    if (!savedCartString) {
      savedCartString = sessionStorage.getItem(CART_STORAGE_KEY);
      fromSession = true;
    }
    
    if (!savedCartString) {
      return null;
    }
    
    const savedCart: Cart = JSON.parse(savedCartString);
    
    // Check if cart structure needs migration
    if (!savedCart.version || savedCart.version < CART_VERSION) {
      const migratedCart = migrateCart(savedCart);
      saveCartSafely(migratedCart);
      return migratedCart;
    }
    
    // Check if cart has expired
    if (new Date(savedCart.expiresAt) <= new Date()) {
      // Cart expired, remove it
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    
    // Cart is valid, update last access time
    const updatedCart = {
      ...savedCart,
      lastUpdated: new Date().toISOString()
    };
    
    // Only save back if it wasn't from session storage
    if (!fromSession) {
      saveCartSafely(updatedCart);
    }
    
    return updatedCart;
    
  } catch (e) {
    console.error('Error loading cart:', e);
    // If parsing fails, clear corrupted data
    localStorage.removeItem(CART_STORAGE_KEY);
    sessionStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
}

// Migrate old cart structure to new version
function migrateCart(oldCart: any): Cart {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
  
  return {
    items: oldCart.items || [],
    totalItems: oldCart.totalItems || 0,
    totalPrice: oldCart.totalPrice || 0,
    createdAt: oldCart.createdAt || now.toISOString(),
    lastUpdated: now.toISOString(),
    expiresAt: oldCart.expiresAt || expiryDate.toISOString(),
    deviceId: oldCart.deviceId || generateDeviceId(),
    version: CART_VERSION
  };
}

// Calculate cart age in days
export function getCartAge(cart: Cart): number {
  const created = new Date(cart.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Check if user should see welcome back message
export function shouldShowWelcomeBack(cart: Cart): boolean {
  // Don't show if already shown this session
  if (sessionStorage.getItem(WELCOMED_BACK_KEY) === 'true') {
    return false;
  }
  
  // Only show if cart has items
  if (cart.items.length === 0) {
    return false;
  }
  
  // Only show if cart is older than 1 hour
  const lastUpdated = new Date(cart.lastUpdated);
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceUpdate >= 1;
}

// Mark welcome back message as shown
export function markWelcomeBackShown(): void {
  sessionStorage.setItem(WELCOMED_BACK_KEY, 'true');
}

// Clear all cart data
export function clearAllCartData(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  sessionStorage.removeItem(CART_STORAGE_KEY);
  sessionStorage.removeItem(WELCOMED_BACK_KEY);
}

// Set privacy preference
export function setCartPrivacyPreference(dontSave: boolean): void {
  if (dontSave) {
    localStorage.setItem(DONT_SAVE_CART_KEY, 'true');
    // Move existing cart to session storage
    const existingCart = localStorage.getItem(CART_STORAGE_KEY);
    if (existingCart) {
      sessionStorage.setItem(CART_STORAGE_KEY, existingCart);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } else {
    localStorage.removeItem(DONT_SAVE_CART_KEY);
    // Move cart back to localStorage
    const sessionCart = sessionStorage.getItem(CART_STORAGE_KEY);
    if (sessionCart) {
      localStorage.setItem(CART_STORAGE_KEY, sessionCart);
      sessionStorage.removeItem(CART_STORAGE_KEY);
    }
  }
}

// Get privacy preference
export function getCartPrivacyPreference(): boolean {
  return localStorage.getItem(DONT_SAVE_CART_KEY) === 'true';
} 