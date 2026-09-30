# Shopify Store Builder

A private, AI-powered workspace that takes a solo store owner from niche idea to ad creative.
It runs fully in the browser: no server, no build step.

## Modules

1. **Niche Discovery Engine** – finds evergreen niches with steady, repeat demand (no short-lived trends). Scores demand (0–100) and stability (1–5).
2. **Store Layout Architect** – mobile-first Shopify theme plan: colours, fonts, navigation, breakpoints, homepage sections and page hierarchy.
3. **Product Bulk Importer** – paste `name | price | notes` lines; get titles, descriptions, sales copy and SEO. Export a Shopify-ready CSV (Shopify admin → Products → Import).
4. **Virtual Customer Auditor** – simulated shoppers (Impulse Buyer, Skeptical Researcher, and more) review your layout and copy, and list fixes.
5. **Ad Creative Generator** – short-form video scripts and visual hooks for TikTok, Reels and Shorts.

A progress bar shows store readiness across the five steps.

## Getting started

1. Open `index.html` in a browser (or serve the folder, e.g. `npx serve .`).
2. Create a passcode. It encrypts all data on this device (AES-GCM, key derived with PBKDF2).
3. Open ⚙️ Settings and paste your Claude API key.
4. Work through the tabs 1 → 5.

## Privacy

- Single user, local only. Data lives encrypted in the browser's `localStorage`.
- The API key is sent only to `api.anthropic.com`.
- Forgetting the passcode means the data cannot be recovered; export a backup from Settings.

## Files

- `index.html` – page shell
- `css/styles.css` – Clay theme (accents `#FF6B42` / `#FF7850`), mobile-first
- `js/vault.js` – passcode lock and encrypted storage
- `js/ai.js` – Claude API client
- `js/modules.js` – the five modules and settings
- `js/app.js` – tabs, routing and readiness progress
