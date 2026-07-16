# Kustom Fits

Custom made prints on t-shirts, tote bags, hoodies, caps, mugs and more.

**Domain:** [kustomfits.com](https://kustomfits.com)

## Stack

- [Astro](https://astro.build) + Tailwind CSS v4
- Client-side cart (localStorage)
- FormSubmit for contact emails
- Stripe Checkout (server-side session via `/api/create-checkout`)

## Development

```bash
cd kustom-fits
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Products

Product data lives in `src/data/products.ts`. Edit names, prices, sizes, and colours there.

Replace placeholder images in `public/products/` with real product photos (`.jpg` files matching each slug).

## Custom print workflow

1. Customer picks product, size/colour, and adds to cart
2. Customer completes checkout (Stripe coming soon — contact form for now)
3. Customer emails design to **hello@kustomfits.com**
4. You send a digital proof for approval
5. Print and ship

## Shipping rules

- UK only
- £3.95 flat rate
- Free delivery on orders over £40

## Contact form

Messages go to `hello@kustomfits.com` via [FormSubmit](https://formsubmit.co). On first use, FormSubmit sends a confirmation email — click the link to activate.

## Deploying to kustomfits.com

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, etc.) and point your domain DNS to it.

## Stripe setup

1. Copy `.env.example` to `.env`
2. Add your [Stripe secret key](https://dashboard.stripe.com/apikeys) (`sk_test_...` for testing)
3. Restart the dev server — the checkout page will redirect to Stripe

For production, set `STRIPE_SECRET_KEY` as an environment variable on your host (Vercel, Netlify, etc.). This project uses Astro hybrid mode so the API route runs server-side on deploy.
