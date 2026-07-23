# Shopify Storefront

A modern, full-featured Shopify storefront built with **Next.js**, **TypeScript**, **Tailwind CSS**, and the **Shopify Storefront API**.

## Features

- 🛍️ Product listing page with live search
- 📦 Product detail pages with variant selection and image gallery
- 🛒 Persistent cart with a slide-out drawer (powered by Shopify's Cart API)
- 🔄 Incremental Static Regeneration for fast page loads
- 📱 Fully responsive design
- 🔒 Secure Shopify Checkout redirect

## Getting Started

### Prerequisites

- Node.js 18+
- A Shopify store with the **Storefront API** enabled

### 1. Clone & install

```bash
git clone https://github.com/markusknudtsen-droid/Shopify.git
cd Shopify
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your Shopify credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

#### How to get a Storefront Access Token

1. In your Shopify admin go to **Apps** → **Develop apps**
2. Create a new app (or open an existing one)
3. Under **API credentials** → **Storefront API access tokens**, generate a token
4. Grant the scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
├── components/
│   ├── CartDrawer.tsx   # Slide-out cart
│   ├── Footer.tsx
│   ├── Layout.tsx       # Wraps every page
│   ├── Navbar.tsx
│   └── ProductCard.tsx
├── context/
│   └── CartContext.tsx  # Global cart state
├── lib/
│   └── shopify.ts       # Shopify Storefront API client
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── 404.tsx
│   ├── index.tsx        # Home page
│   └── products/
│       ├── index.tsx    # All products
│       └── [handle].tsx # Product detail
├── styles/
│   └── globals.css
├── types/
│   └── shopify.ts       # TypeScript types
├── .env.example
└── next.config.js
```

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework with SSG / ISR
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [js-cookie](https://github.com/js-cookie/js-cookie) — Cart ID persistence
