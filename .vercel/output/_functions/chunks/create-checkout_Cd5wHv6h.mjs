import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import "stripe";
//#region src/pages/api/create-checkout.ts
var create_checkout_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request, url }) => {
	return new Response(JSON.stringify({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file." }), {
		status: 503,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/create-checkout@_@ts
var page = () => create_checkout_exports;
//#endregion
export { page };
