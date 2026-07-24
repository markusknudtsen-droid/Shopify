'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ShopifyProduct } from '@/types/shopify';

export default function ProductsClient({ products }: { products: ShopifyProduct[] }) {
  const [query, setQuery] = useState('');

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="relative mb-8">
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
