import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItemQuantity: (productId: number) => number;
  resetCart: () => void;
  // Payment deadline utilities (persisted across navigation)
  paymentDeadline: number | null;
  ensurePaymentDeadline: (secondsFromNow?: number) => void;
  clearPaymentDeadline: () => void;
  getTimeLeftSeconds: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persisted payment deadline (epoch ms)
  const [paymentDeadline, setPaymentDeadline] = useState<number | null>(() => {
    const raw = localStorage.getItem('paymentDeadline');
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Keep deadline persisted
  useEffect(() => {
    if (paymentDeadline) localStorage.setItem('paymentDeadline', String(paymentDeadline));
    else localStorage.removeItem('paymentDeadline');
  }, [paymentDeadline]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartItemQuantity = (productId: number) => {
    const item = cart.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const resetCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Deadline helpers
  const ensurePaymentDeadline = (secondsFromNow: number = 15 * 60) => {
    if (!paymentDeadline) {
      const deadline = Date.now() + secondsFromNow * 1000;
      setPaymentDeadline(deadline);
    }
  };

  const clearPaymentDeadline = () => {
    setPaymentDeadline(null);
  };

  const getTimeLeftSeconds = () => {
    if (!paymentDeadline) return 0;
    return Math.max(0, Math.floor((paymentDeadline - Date.now()) / 1000));
  };

  // Auto clear deadline when cart empties
  useEffect(() => {
    if (cart.length === 0 && paymentDeadline) {
      setPaymentDeadline(null);
    }
  }, [cart.length, paymentDeadline]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItemQuantity,
    resetCart,
    paymentDeadline,
    ensurePaymentDeadline,
    clearPaymentDeadline,
    getTimeLeftSeconds,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
