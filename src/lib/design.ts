export interface DesignLayer {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  scale: number;
  rotation: number;
  hidden?: boolean;
  text?: string;
  font?: string;
  color?: string;
  fontSize?: number;
  imageData?: string;
  shapeId?: string;
}

export interface SavedDesign {
  id: string;
  productSlug: string;
  productName: string;
  variant: string;
  label: string;
  preview: string;
  printExport: string;
  layers: DesignLayer[];
  templateId?: string;
  createdAt: number;
}

export interface MockupConfig {
  label: string;
  productColor: string;
  printArea: { x: number; y: number; w: number; h: number };
  shape: "tee" | "hoodie" | "cap" | "tote" | "mug";
}

const DESIGNS_KEY = "kustom-fits-designs";

export function createDesignId(): string {
  return `design_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function saveDesign(design: SavedDesign) {
  const all = getDesigns();
  all[design.id] = design;
  localStorage.setItem(DESIGNS_KEY, JSON.stringify(all));
}

export function getDesign(id: string): SavedDesign | undefined {
  return getDesigns()[id];
}

export function getDesigns(): Record<string, SavedDesign> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DESIGNS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SavedDesign>) : {};
  } catch {
    return {};
  }
}

export const mockupConfigs: Record<string, MockupConfig> = {
  "t-shirt": {
    label: "T-Shirt",
    productColor: "#1a1a1a",
    printArea: { x: 0.28, y: 0.22, w: 0.44, h: 0.38 },
    shape: "tee",
  },
  hoodie: {
    label: "Hoodie",
    productColor: "#1a1a1a",
    printArea: { x: 0.26, y: 0.28, w: 0.48, h: 0.34 },
    shape: "hoodie",
  },
  cap: {
    label: "Cap",
    productColor: "#1a1a1a",
    printArea: { x: 0.32, y: 0.38, w: 0.36, h: 0.22 },
    shape: "cap",
  },
  "tote-bag": {
    label: "Tote Bag",
    productColor: "#e8e4dc",
    printArea: { x: 0.22, y: 0.25, w: 0.56, h: 0.48 },
    shape: "tote",
  },
  mug: {
    label: "Mug",
    productColor: "#f5f5f5",
    printArea: { x: 0.28, y: 0.3, w: 0.44, h: 0.4 },
    shape: "mug",
  },
};

export function variantToColor(variant: string): string {
  const lower = variant.toLowerCase();
  if (lower.includes("black") || lower.includes("charcoal")) return "#1a1a1a";
  if (lower.includes("white") || lower.includes("natural")) return "#f5f5f5";
  if (lower.includes("navy")) return "#1e3a5f";
  if (lower.includes("cyan")) return "#00d4ff";
  return "#2a2a2a";
}
