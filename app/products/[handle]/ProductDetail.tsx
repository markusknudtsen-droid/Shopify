'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopifyProduct } from '@/types/shopify';
import { useCart } from '@/context/CartContext';

export default function ProductDetail({ product }: { product: ShopifyProduct }) {
  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]]))
  );
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();

  const selectedVariant = variants.find((v) =>
    v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  ) ?? variants[0];

  const handleAddToCart = async () => {
    if (!selectedVariant?.availableForSale) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id);
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (amount: string, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText ?? product.title}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                    selectedImage === idx ? 'border-black' : 'border-transparent'
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

        {/* Product info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.title}</h1>

          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {selectedVariant
              ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
              : formatPrice(
                  product.priceRange.minVariantPrice.amount,
                  product.priceRange.minVariantPrice.currencyCode
                )}
          </p>

          {/* Variant pickers */}
          {product.options
            .filter((o) => !(o.values.length === 1 && o.values[0] === 'Default Title'))
            .map((option) => (
              <div key={option.id} className="mt-6">
                <h3 className="mb-2 text-sm font-medium text-gray-900">{option.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                      }
                      className={`rounded-md border px-4 py-2 text-sm font-medium ${
                        selectedOptions[option.name] === value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant?.availableForSale || adding}
            className="mt-8 rounded-md bg-black px-8 py-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding
              ? 'Adding…'
              : selectedVariant?.availableForSale
              ? 'Add to Cart'
              : 'Out of Stock'}
          </button>

          {/* Description */}
          {product.descriptionHtml ? (
            <div
              className="prose prose-sm mt-8 text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            <p className="mt-8 text-sm text-gray-600">{product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
