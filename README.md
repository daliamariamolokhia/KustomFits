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

## Stripe setup (cards, Apple Pay, Google Pay)

### 1. Create a Stripe account
Sign up at [stripe.com](https://stripe.com) if you haven't already.

### 2. Get your API keys
[Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)

- **Test mode** (for trying checkout): use `sk_test_...`
- **Live mode** (real payments): toggle off test mode, use `sk_live_...`

### 3. Add the key to Vercel
1. Vercel → **kustom-fits** → **Settings → Environment Variables**
2. Add `STRIPE_SECRET_KEY` = your secret key
3. Enable for **Production** (and Preview if you want to test deploy previews)
4. **Deployments → Redeploy** (required after adding env vars)

For local dev, copy `.env.example` to `.env` and add the same key.

### 4. Test a payment
1. Add items to cart → **Checkout** → **Pay with card, Apple Pay, or Google Pay**
2. Test card: `4242 4242 4242 4242`, any future expiry, any CVC
3. Check payment in [Stripe Dashboard → Payments](https://dashboard.stripe.com/payments)

### 5. Enable Apple Pay (one-time domain setup)
1. [Stripe → Settings → Payment methods → Apple Pay](https://dashboard.stripe.com/settings/payment_methods)
2. **Add domain** → enter `kustomfits.com`
3. Download Stripe's verification file
4. Save it to `public/.well-known/apple-developer-merchantid-domain-association` (see that folder's README)
5. Commit, push, redeploy
6. Click **Verify** in Stripe

Google Pay works automatically through Stripe Checkout — no extra setup.

### 6. Go live
1. Complete [Stripe account activation](https://dashboard.stripe.com/account/onboarding) (business details, bank account)
2. Switch Vercel env var to your **live** key (`sk_live_...`)
3. Redeploy

## Deploying to kustomfits.com

This project uses the **Vercel adapter**. Push to `main` on GitHub and Vercel deploys automatically.
