'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { ShopifyCart } from '@/types/shopify';
import { cartCreate, cartLinesAdd, cartLinesUpdate, cartLinesRemove } from '@/lib/shopify';

interface CartContextType {
  cart: ShopifyCart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateCartLine: (lineId: string, quantity: number) => Promise<void>;
  removeCartLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE = 'shopify_cart_id';
const COOKIE_EXPIRES = 30;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    // We store only the cart ID in the cookie; on load we can't restore full cart
    // without a fetch, but cart actions will re-initialise as needed.
    const cartId = Cookies.get(CART_COOKIE);
    if (!cartId) return;
    // The cart will be fetched lazily on the first mutation if needed.
  }, []);

  const addToCart = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      const cartId = cart?.id ?? Cookies.get(CART_COOKIE);

      let updatedCart: ShopifyCart;
      if (cartId) {
        updatedCart = await cartLinesAdd(cartId, [{ merchandiseId, quantity }]);
      } else {
        updatedCart = await cartCreate([{ merchandiseId, quantity }]);
        Cookies.set(CART_COOKIE, updatedCart.id, { expires: COOKIE_EXPIRES });
      }

      setCart(updatedCart);
      openCart();
    },
    [cart, openCart]
  );

  const updateCartLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      const updatedCart = await cartLinesUpdate(cart.id, [{ id: lineId, quantity }]);
      setCart(updatedCart);
    },
    [cart]
  );

  const removeCartLine = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      const updatedCart = await cartLinesRemove(cart.id, [lineId]);
      setCart(updatedCart);
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, isOpen, openCart, closeCart, addToCart, updateCartLine, removeCartLine }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
