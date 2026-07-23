import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  getAllProducts,
  getProductByHandle,
  getProductRecommendations,
  formatPrice,
} from '@/lib/shopify';
import { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

interface ProductPageProps {
  product: ShopifyProduct;
  recommendations: ShopifyProduct[];
}

export default function ProductPage({ product, recommendations }: ProductPageProps) {
  const { addItem, loading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    product.variants.edges[0].node
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const hasMultipleVariants = variants.length > 1 || variants[0]?.title !== 'Default Title';

  const handleAddToCart = async () => {
    await addItem(selectedVariant.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const activeImage = images[activeImageIndex];

  return (
    <>
      <Head>
        <title>{product.title} — MyStore</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-green-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-green-600 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </nav>

        {/* Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText ?? product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImageIndex === idx
                        ? 'border-green-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            <p className="mt-3 text-2xl font-semibold text-green-600">
              {formatPrice(
                selectedVariant.price.amount,
                selectedVariant.price.currencyCode
              )}
            </p>

            {/* Variants */}
            {hasMultipleVariants && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.availableForSale}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedVariant.id === variant.id
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-700 hover:border-green-400 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                disabled={loading || !selectedVariant.availableForSale || addedToCart}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all text-lg ${
                  addedToCart
                    ? 'bg-green-500'
                    : selectedVariant.availableForSale
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                } disabled:opacity-70`}
              >
                {addedToCart
                  ? '✓ Added to Cart'
                  : selectedVariant.availableForSale
                  ? loading
                    ? 'Adding…'
                    : 'Add to Cart'
                  : 'Out of Stock'}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const products = await getAllProducts();
    const paths = products.map((p) => ({ params: { handle: p.handle } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const handle = params?.handle as string;
  try {
    const product = await getProductByHandle(handle);
    if (!product) {
      return { notFound: true };
    }
    const recommendations = await getProductRecommendations(product.id);
    return {
      props: { product, recommendations },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
};
