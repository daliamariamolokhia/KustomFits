export interface ProductVariant {
  label: string;
  group?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  variants: ProductVariant[];
  category: string;
  image: string;
  imageAlt: string;
}

const sizes = ["S", "M", "L", "XL", "XXL"];
const shirtColors = ["Black", "White", "Navy"];

function sizeColorVariants(colors: string[]): ProductVariant[] {
  return colors.flatMap((color) =>
    sizes.map((size) => ({ label: `${color} · ${size}`, group: color })),
  );
}

export const products: Product[] = [
  {
    id: "t-shirt",
    name: "Custom Print T-Shirt",
    slug: "t-shirt",
    price: 18,
    description: "Premium cotton tee with your custom design. Durable print that holds up wash after wash.",
    category: "Apparel",
    image: "/products/t-shirt.jpg",
    imageAlt: "Kustom Fits custom print t-shirt",
    variants: sizeColorVariants(shirtColors),
  },
  {
    id: "hoodie",
    name: "Custom Print Hoodie",
    slug: "hoodie",
    price: 35,
    description: "Cosy pullover hoodie with bold custom graphics. Soft fleece lining, street-ready fit.",
    category: "Apparel",
    image: "/products/hoodie.jpg",
    imageAlt: "Kustom Fits custom print hoodie",
    variants: sizeColorVariants(["Black", "Charcoal", "Navy"]),
  },
  {
    id: "tote-bag",
    name: "Custom Print Tote Bag",
    slug: "tote-bag",
    price: 12,
    description: "Heavy-duty canvas tote with your artwork. Perfect for everyday carry or merch drops.",
    category: "Accessories",
    image: "/products/tote-bag.jpg",
    imageAlt: "Kustom Fits custom print tote bag",
    variants: [
      { label: "Natural Canvas" },
      { label: "Black Canvas" },
      { label: "Navy Canvas" },
    ],
  },
  {
    id: "cap",
    name: "Custom Print Cap",
    slug: "cap",
    price: 15,
    description: "Structured cap with embroidered or printed custom design. One size fits most.",
    category: "Accessories",
    image: "/products/cap.jpg",
    imageAlt: "Kustom Fits custom print cap",
    variants: [
      { label: "Black" },
      { label: "Navy" },
      { label: "White" },
      { label: "Cyan" },
    ],
  },
  {
    id: "mug",
    name: "Custom Print Mug",
    slug: "mug",
    price: 10,
    description: "11oz ceramic mug with vibrant full-wrap or front print. Dishwasher safe.",
    category: "Homeware",
    image: "/products/mug.jpg",
    imageAlt: "Kustom Fits custom print mug",
    variants: [
      { label: "White · 11oz" },
      { label: "Black · 11oz" },
      { label: "White · 15oz" },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function productPlaceholder(slug: string): string {
  return `/products/${slug}.svg`;
}
