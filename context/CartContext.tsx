import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import {
  ShopifyCart,
  ShopifyCartLine,
} from '@/types/shopify';
import {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
} from '@/lib/shopify';

const CART_ID_COOKIE = 'shopify_cart_id';

interface CartContextType {
  cart: ShopifyCart | null;
  cartOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  lines: ShopifyCartLine[];
  totalQuantity: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize or retrieve cart on mount
  useEffect(() => {
    async function initCart() {
      const existingCartId = Cookies.get(CART_ID_COOKIE);
      if (existingCartId) {
        try {
          const existingCart = await getCart(existingCartId);
          if (existingCart) {
            setCart(existingCart);
            return;
          }
        } catch {
          // Cart may have expired; create a new one below
        }
      }
      const newCart = await createCart();
      Cookies.set(CART_ID_COOKIE, newCart.id, { expires: 30 });
      setCart(newCart);
    }
    initCart();
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updatedCart = await addToCart(cart.id, [{ merchandiseId, quantity }]);
        setCart(updatedCart);
        setCartOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updatedCart = await updateCartLine(cart.id, lineId, quantity);
        setCart(updatedCart);
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updatedCart = await removeFromCart(cart.id, [lineId]);
        setCart(updatedCart);
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const lines: ShopifyCartLine[] =
    cart?.lines.edges.map((edge) => edge.node) ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        loading,
        openCart,
        closeCart,
        addItem,
        updateItem,
        removeItem,
        lines,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
