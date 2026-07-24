import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Shopify Store
          </Link>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/products" className="hover:text-gray-900">
              Products
            </Link>
          </nav>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Shopify Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
