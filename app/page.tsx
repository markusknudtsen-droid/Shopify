import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/shopify';

export const revalidate = 60;

export default async function HomePage() {
  let featuredProducts: import('@/types/shopify').ShopifyProduct[] = [];
  try {
    const products = await getAllProducts();
    featuredProducts = products.slice(0, 4);
  } catch {
    // API not configured yet; show empty state
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Discover our collection
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Explore a curated selection of quality products, delivered fast to your door.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/products"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { title: 'Free Shipping', description: 'On all orders over $50' },
              { title: 'Easy Returns', description: '30-day hassle-free returns' },
              { title: 'Secure Checkout', description: 'Your data is always protected' },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">No products found</h2>
          <p className="mt-2 text-gray-500">
            Configure your Shopify credentials in <code>.env.local</code> to load products.
          </p>
        </section>
      )}
    </>
  );
}
