import {
  addToCart,
  cartItemCount,
  cartShipping,
  cartSubtotal,
  cartTotal,
  formatGBP,
  getCart,
  removeFromCart,
  updateQuantity,
  type CartItem,
} from "../lib/cart";

function renderCartDrawer(items: CartItem[]) {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  const itemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");
  const emptyEl = document.getElementById("cart-empty");
  const footerEl = document.getElementById("cart-footer");

  if (!drawer || !itemsEl) return;

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const total = cartTotal(items);

  if (items.length === 0) {
    itemsEl.innerHTML = "";
    emptyEl?.classList.remove("hidden");
    footerEl?.classList.add("hidden");
  } else {
    emptyEl?.classList.add("hidden");
    footerEl?.classList.remove("hidden");
    itemsEl.innerHTML = items
      .map(
        (item) => `
        <li class="flex gap-3 border-b border-white/10 pb-4">
          <div class="flex-1">
            <p class="font-display tracking-wide text-white">${item.name}</p>
            <p class="text-sm text-brand-gray">${item.variant}</p>
            <p class="mt-1 text-sm text-brand-cyan">${formatGBP(item.price)}</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center gap-2 rounded-full border border-white/15 bg-brand-card px-2 py-1">
              <button type="button" class="cart-qty-minus h-6 w-6 rounded-full text-brand-gray hover:bg-brand-cyan/20 hover:text-brand-cyan" data-id="${item.productId}" data-variant="${item.variant}" aria-label="Decrease quantity">−</button>
              <span class="min-w-[1.25rem] text-center text-sm">${item.quantity}</span>
              <button type="button" class="cart-qty-plus h-6 w-6 rounded-full text-brand-gray hover:bg-brand-cyan/20 hover:text-brand-cyan" data-id="${item.productId}" data-variant="${item.variant}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="cart-remove text-xs text-brand-muted underline hover:text-brand-cyan" data-id="${item.productId}" data-variant="${item.variant}">Remove</button>
          </div>
        </li>
      `,
      )
      .join("");
  }

  if (subtotalEl) subtotalEl.textContent = formatGBP(subtotal);
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 && subtotal > 0 ? "Free" : formatGBP(shipping);
  }
  if (totalEl) totalEl.textContent = formatGBP(total);

  drawer.querySelectorAll(".cart-qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id")!;
      const variant = btn.getAttribute("data-variant")!;
      const item = getCart().find((i) => i.productId === id && i.variant === variant);
      if (item) updateQuantity(id, variant, item.quantity - 1);
    });
  });

  drawer.querySelectorAll(".cart-qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id")!;
      const variant = btn.getAttribute("data-variant")!;
      const item = getCart().find((i) => i.productId === id && i.variant === variant);
      if (item) updateQuantity(id, variant, item.quantity + 1);
    });
  });

  drawer.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.getAttribute("data-id")!, btn.getAttribute("data-variant")!);
    });
  });

  overlay?.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  drawer?.classList.add("translate-x-full");
  drawer?.setAttribute("aria-hidden", "true");
  overlay?.classList.add("hidden");
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  const count = cartItemCount(getCart());
  if (!badge) return;
  badge.textContent = String(count);
  badge.classList.toggle("hidden", count === 0);
}

function bindCartUI() {
  document.getElementById("cart-open")?.addEventListener("click", () => renderCartDrawer(getCart()));
  document.getElementById("cart-close")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cart-overlay")?.addEventListener("click", closeCartDrawer);

  document.querySelectorAll<HTMLFormElement>("[data-add-to-cart]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      addToCart({
        productId: String(data.get("productId")),
        name: String(data.get("name")),
        slug: String(data.get("slug")),
        variant: String(data.get("variant")),
        price: Number(data.get("price")),
      });
      renderCartDrawer(getCart());
    });
  });

  window.addEventListener("cart-updated", () => updateCartBadge());
  updateCartBadge();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindCartUI);
} else {
  bindCartUI();
}
