# Shopify Storefront

A Next.js 14 storefront backed by the Shopify Storefront GraphQL API.

## Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Shopify Storefront API** (2024-01)

## Getting started

1. Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Structure

| Path | Description |
|---|---|
| `lib/shopify.ts` | Storefront API client — product queries & cart mutations |
| `types/shopify.ts` | TypeScript interfaces |
| `context/CartContext.tsx` | Global cart state with 30-day cookie persistence |
| `app/page.tsx` | Home page with hero, features & featured products (ISR 60s) |
| `app/products/page.tsx` | Full catalogue with client-side search |
| `app/products/[handle]/page.tsx` | Product detail with image gallery, variant picker & recommendations |
| `components/Navbar.tsx` | Sticky navbar with cart badge and mobile hamburger |
| `components/CartDrawer.tsx` | Slide-out cart panel with quantity controls & checkout redirect |
| `components/ProductCard.tsx` | Reusable product card |
| `components/Layout.tsx` | Page shell wrapping Navbar, CartDrawer & Footer |
