'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Navbar() {
  const { cart, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Shopify Store
          </Link>

          <div className="hidden items-center gap-8 sm:flex">
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Products
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative rounded-md p-2 text-gray-700 hover:bg-gray-100"
              aria-label="Open cart"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </button>

            <button
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 sm:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 py-3 sm:hidden">
            <Link
              href="/products"
              className="block px-2 py-2 text-sm font-medium text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
