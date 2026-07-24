import { notFound } from 'next/navigation';
import { getProductByHandle, getProductRecommendations } from '@/lib/shopify';
import ProductDetail from './ProductDetail';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const product = await getProductByHandle(params.handle);
    if (!product) return { title: 'Product Not Found' };
    return { title: `${product.title} | Shopify Store` };
  } catch {
    return { title: 'Product | Shopify Store' };
  }
}

export default async function ProductPage({ params }: Props) {
  let product;
  try {
    product = await getProductByHandle(params.handle);
  } catch {
    notFound();
  }

  if (!product) notFound();

  let recommendations: import('@/types/shopify').ShopifyProduct[] = [];
  try {
    recommendations = (await getProductRecommendations(product.id)).slice(0, 4);
  } catch {
    // Recommendations are optional
  }

  return (
    <>
      <ProductDetail product={product} />

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-gray-900">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
