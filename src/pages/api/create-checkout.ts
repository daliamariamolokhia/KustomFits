import type { APIRoute } from "astro";
import Stripe from "stripe";
import { SHIPPING_FLAT, cartShipping, cartSubtotal, type CartItem } from "../../lib/cart";

export const prerender = false;

interface CheckoutBody {
  items: CartItem[];
}

export const POST: APIRoute = async ({ request, url }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.items?.length) {
    return new Response(JSON.stringify({ error: "Cart is empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(secretKey);
  const subtotal = cartSubtotal(body.items);
  const shipping = cartShipping(subtotal);
  const siteUrl = (import.meta.env.SITE ?? url.origin).replace(/\/$/, "");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((item) => ({
    price_data: {
      currency: "gbp",
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
        description: item.variant,
      },
    },
    quantity: item.quantity,
  }));

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(SHIPPING_FLAT * 100),
        product_data: {
          name: "UK shipping",
        },
      },
      quantity: 1,
    });
  }

  const orderSummary = body.items
    .map((item) => {
      const design = item.designLabel ? ` [${item.designLabel}]` : "";
      return `${item.name} (${item.variant})${design} × ${item.quantity}`;
    })
    .join("; ");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_payment_methods: { enabled: true },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      shipping_address_collection: { allowed_countries: ["GB"] },
      metadata: {
        order_summary: orderSummary.slice(0, 500),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
