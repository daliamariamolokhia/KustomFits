# AGENTS.md

## Cursor Cloud specific instructions

### Product
Kustom Fits is a static Astro + Tailwind storefront (custom prints on apparel/merch) with client-side cart (`localStorage`), FormSubmit contact form, and Stripe Checkout via `/api/create-checkout`.

### Commands
See `README.md` and `package.json`. Standard flow:

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:4321
- Build: `npm run build`
- Preview: `npm run preview`

There is no dedicated lint or unit-test script in this repo. Use `npm run build` as the main correctness check.

### Env / Stripe
- Copy `.env.example` → `.env` and set `STRIPE_SECRET_KEY` (`sk_test_...` for local checkout).
- Browsing, product pages, design studio, and cart work without Stripe.
- Checkout/pay requires a valid Stripe secret key; without it `/api/create-checkout` will fail.

### Gotchas
- Node `>=22.12.0` (see `.node-version` / `package.json` engines).
- Package manager is **npm** (`package-lock.json`).
- No local DB, Docker, or Redis — only the Astro dev server is required for most UI work.
- FormSubmit contact emails need a one-time inbox confirmation on first use (optional for cart/shop testing).
