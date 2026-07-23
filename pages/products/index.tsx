import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { getAllProducts } from '@/lib/shopify';
import { ShopifyProduct } from '@/types/shopify';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

interface ProductsPageProps {
  products: ShopifyProduct[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Products — MyStore</title>
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900">All Products</h1>
            <p className="mt-2 text-gray-500">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search */}
          <div className="mb-8">
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl font-medium">No products found.</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-green-600 hover:underline text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const products = await getAllProducts();
    return {
      props: { products },
      revalidate: 60,
    };
  } catch {
    return {
      props: { products: [] },
      revalidate: 60,
    };
  }
};
