import { getAllProducts } from '@/lib/shopify';
import ProductsClient from './ProductsClient';

export const metadata = { title: 'Products | Shopify Store' };

export default async function ProductsPage() {
  let products: import('@/types/shopify').ShopifyProduct[] = [];
  try {
    products = await getAllProducts();
  } catch {
    // Show empty state when API is not configured
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">All Products</h1>
      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No products available. Configure your Shopify credentials in{' '}
          <code>.env.local</code> to load products.
        </p>
      ) : (
        <ProductsClient products={products} />
      )}
    </div>
  );
}
