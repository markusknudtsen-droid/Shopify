import Image from 'next/image';
import Link from 'next/link';
import { ShopifyProduct } from '@/types/shopify';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasVariantPricing = price.amount !== maxPrice.amount;

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square relative">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 line-clamp-2">
          {product.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {hasVariantPricing && 'From '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: price.currencyCode,
          }).format(parseFloat(price.amount))}
        </p>
      </div>
    </Link>
  );
}
