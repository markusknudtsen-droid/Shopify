import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              My<span className="text-green-500">Store</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Your one-stop shop for quality products. Fast shipping,
              easy returns, and excellent customer service.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@mystore.com" className="hover:text-white transition-colors">
                  support@mystore.com
                </a>
              </li>
              <li>
                <span>Mon–Fri, 9am–5pm</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} MyStore. Powered by Shopify.
          </p>
        </div>
      </div>
    </footer>
  );
}
