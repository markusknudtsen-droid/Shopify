import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/shopify';
import { ShopifyCartLine } from '@/types/shopify';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function CartLineItem({ line }: { line: ShopifyCartLine }) {
  const { updateItem, removeItem, loading } = useCart();
  const image = line.merchandise.product.images.edges[0]?.node;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? line.merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {line.merchandise.product.title}
        </p>
        {line.merchandise.title !== 'Default Title' && (
          <p className="text-gray-500 text-xs mt-0.5">{line.merchandise.title}</p>
        )}
        <p className="text-green-600 text-sm font-medium mt-1">
          {formatPrice(
            line.cost.totalAmount.amount,
            line.cost.totalAmount.currencyCode
          )}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateItem(line.id, line.quantity - 1)}
            disabled={loading || line.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600 disabled:opacity-40 transition-colors"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="text-sm font-medium w-6 text-center">{line.quantity}</span>
          <button
            onClick={() => updateItem(line.id, line.quantity + 1)}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600 disabled:opacity-40 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
          <button
            onClick={() => removeItem(line.id)}
            disabled={loading}
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, lines, loading } = useCart();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Cart
            {cart && cart.totalQuantity > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <p className="text-base font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">
                {formatPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode
                )}
              </span>
            </div>
            <a
              href={cart.checkoutUrl}
              className={`block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors ${
                loading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              Checkout
            </a>
            <p className="text-xs text-gray-400 text-center mt-3">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
