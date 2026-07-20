# Apple Pay domain verification

Stripe requires this file to enable Apple Pay on your domain.

## Setup

1. Go to [Stripe Dashboard → Settings → Payment methods → Apple Pay](https://dashboard.stripe.com/settings/payment_methods)
2. Click **Add domain** and enter `kustomfits.com`
3. Download the verification file Stripe provides
4. Save it here as:

   `apple-developer-merchantid-domain-association`

   (no file extension)

5. Commit, push, and redeploy on Vercel
6. Return to Stripe and click **Verify**

Google Pay works through Stripe Checkout automatically once Stripe is configured — no extra file needed.
