export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  category?: string;
  maxQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  lastUpdated: string;
  expiresAt: string;
  deviceId?: string;
  version: number;
}

export interface CartContextType {
  cart: Cart;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
  cartAge: number; // days since creation
  isCartExpired: boolean;
  saveIndicator: boolean; // shows when cart is being saved
}

export interface AddToCartNotification {
  id: string;
  product: CartItem;
  timestamp: number;
} 