export const SHIPPING_FLAT = 3.95;
export const FREE_SHIPPING_THRESHOLD = 40;

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  variant: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = "kustom-fits-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: items }));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const cart = getCart();
  const key = `${item.productId}::${item.variant}`;
  const existing = cart.find((i) => `${i.productId}::${i.variant}` === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
}

export function updateQuantity(productId: string, variant: string, quantity: number) {
  const cart = getCart();
  const key = `${productId}::${variant}`;
  const idx = cart.findIndex((i) => `${i.productId}::${i.variant}` === key);

  if (idx === -1) return;

  if (quantity <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = quantity;
  }

  saveCart(cart);
}

export function removeFromCart(productId: string, variant: string) {
  updateQuantity(productId, variant, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
}

export function cartTotal(items: CartItem[]): number {
  const subtotal = cartSubtotal(items);
  return subtotal + cartShipping(subtotal);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}
