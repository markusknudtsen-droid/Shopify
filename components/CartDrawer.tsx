'use client';

import Image from 'next/image';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateCartLine, removeCartLine } = useCart();

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-5">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Shopping Cart
                        {cart && cart.totalQuantity > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
                          </span>
                        )}
                      </Dialog.Title>
                      <button
                        onClick={closeCart}
                        className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Close cart"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Lines */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                      {lines.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">Your cart is empty.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {lines.map((line) => {
                            const productImage =
                              line.merchandise.product.images.edges[0]?.node;
                            return (
                              <li key={line.id} className="flex gap-4 py-4">
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                  {productImage && (
                                    <Image
                                      src={productImage.url}
                                      alt={productImage.altText ?? line.merchandise.product.title}
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {line.merchandise.product.title}
                                      </p>
                                      {line.merchandise.title !== 'Default Title' && (
                                        <p className="mt-0.5 text-xs text-gray-500">
                                          {line.merchandise.title}
                                        </p>
                                      )}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: line.merchandise.price.currencyCode,
                                      }).format(
                                        parseFloat(line.merchandise.price.amount) * line.quantity
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center rounded-md border border-gray-300">
                                      <button
                                        className="px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() =>
                                          line.quantity > 1
                                            ? updateCartLine(line.id, line.quantity - 1)
                                            : removeCartLine(line.id)
                                        }
                                        aria-label="Decrease quantity"
                                      >
                                        −
                                      </button>
                                      <span className="min-w-[2rem] px-2 text-center text-sm">
                                        {line.quantity}
                                      </span>
                                      <button
                                        className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                                        onClick={() =>
                                          updateCartLine(line.id, line.quantity + 1)
                                        }
                                        aria-label="Increase quantity"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      className="text-xs text-red-500 hover:text-red-700"
                                      onClick={() => removeCartLine(line.id)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {lines.length > 0 && subtotal && (
                      <div className="border-t px-4 py-6">
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <span>Subtotal</span>
                          <span>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: subtotal.currencyCode,
                            }).format(parseFloat(subtotal.amount))}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <a
                          href={cart!.checkoutUrl}
                          className="mt-4 block w-full rounded-md bg-black py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          Checkout
                        </a>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
