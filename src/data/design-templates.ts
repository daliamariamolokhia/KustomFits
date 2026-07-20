import type { DesignLayer } from "../lib/design";

export type TemplateCategory = "Brand" | "Streetwear" | "Events" | "Minimal";

export interface DesignTemplate {
  id: string;
  name: string;
  emoji: string;
  category: TemplateCategory;
  layers: Omit<DesignLayer, "id">[];
}

export const templateCategories: TemplateCategory[] = ["Brand", "Streetwear", "Events", "Minimal"];

export const designTemplates: DesignTemplate[] = [
  // Brand
  {
    id: "bold-brand",
    name: "Bold Brand",
    emoji: "🔥",
    category: "Brand",
    layers: [
      { type: "text", x: 0.5, y: 0.35, scale: 1, rotation: 0, text: "YOUR BRAND", font: "Bebas Neue", color: "#00d4ff", fontSize: 42 },
      { type: "text", x: 0.5, y: 0.55, scale: 1, rotation: 0, text: "EST. 2026", font: "Inter", color: "#ffffff", fontSize: 14 },
    ],
  },
  {
    id: "logo-stack",
    name: "Logo Stack",
    emoji: "🏷️",
    category: "Brand",
    layers: [
      { type: "shape", x: 0.5, y: 0.32, scale: 1, rotation: 0, shapeId: "diamond", color: "#00d4ff" },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "BRAND NAME", font: "Anton", color: "#ffffff", fontSize: 28 },
      { type: "text", x: 0.5, y: 0.64, scale: 1, rotation: 0, text: "OFFICIAL MERCH", font: "Inter", color: "#a1a1aa", fontSize: 11 },
    ],
  },
  {
    id: "monogram",
    name: "Monogram",
    emoji: "KF",
    category: "Brand",
    layers: [
      { type: "shape", x: 0.5, y: 0.42, scale: 1.4, rotation: 0, shapeId: "circle", color: "#2563eb" },
      { type: "text", x: 0.5, y: 0.42, scale: 1, rotation: 0, text: "KF", font: "Archivo Black", color: "#ffffff", fontSize: 64 },
    ],
  },
  {
    id: "minimal-icon",
    name: "Minimal",
    emoji: "◆",
    category: "Brand",
    layers: [
      { type: "text", x: 0.5, y: 0.38, scale: 1, rotation: 0, text: "◆", font: "Inter", color: "#00d4ff", fontSize: 56 },
      { type: "text", x: 0.5, y: 0.58, scale: 1, rotation: 0, text: "KUSTOM FITS", font: "Bebas Neue", color: "#ffffff", fontSize: 22 },
    ],
  },
  // Streetwear
  {
    id: "street-script",
    name: "Street Script",
    emoji: "✨",
    category: "Streetwear",
    layers: [
      { type: "text", x: 0.5, y: 0.45, scale: 1, rotation: -4, text: "Stay Kustom", font: "Permanent Marker", color: "#ffffff", fontSize: 44 },
    ],
  },
  {
    id: "retro-block",
    name: "Retro Block",
    emoji: "📦",
    category: "Streetwear",
    layers: [
      { type: "text", x: 0.5, y: 0.42, scale: 1, rotation: 0, text: "LIMITED", font: "Bebas Neue", color: "#2563eb", fontSize: 36 },
      { type: "text", x: 0.5, y: 0.56, scale: 1, rotation: 0, text: "EDITION", font: "Bebas Neue", color: "#ffffff", fontSize: 36 },
    ],
  },
  {
    id: "number-back",
    name: "Number Back",
    emoji: "07",
    category: "Streetwear",
    layers: [
      { type: "text", x: 0.5, y: 0.48, scale: 1, rotation: 0, text: "07", font: "Bebas Neue", color: "#ffffff", fontSize: 72 },
    ],
  },
  {
    id: "hustle",
    name: "Hustle",
    emoji: "💪",
    category: "Streetwear",
    layers: [
      { type: "shape", x: 0.5, y: 0.3, scale: 0.8, rotation: 0, shapeId: "lightning", color: "#00d4ff" },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "HUSTLE", font: "Anton", color: "#ffffff", fontSize: 40 },
      { type: "text", x: 0.5, y: 0.64, scale: 1, rotation: 0, text: "HARD", font: "Bangers", color: "#2563eb", fontSize: 32 },
    ],
  },
  {
    id: "no-cap",
    name: "No Cap",
    emoji: "🧢",
    category: "Streetwear",
    layers: [
      { type: "text", x: 0.5, y: 0.4, scale: 1, rotation: -6, text: "NO CAP", font: "Bangers", color: "#00d4ff", fontSize: 48 },
      { type: "text", x: 0.5, y: 0.56, scale: 1, rotation: -6, text: "ALL FACTS", font: "Inter", color: "#ffffff", fontSize: 14 },
    ],
  },
  {
    id: "wave",
    name: "Wave",
    emoji: "🌊",
    category: "Streetwear",
    layers: [
      { type: "text", x: 0.5, y: 0.44, scale: 1, rotation: 0, text: "GO WITH", font: "Oswald", color: "#a1a1aa", fontSize: 18 },
      { type: "text", x: 0.5, y: 0.56, scale: 1, rotation: 0, text: "THE WAVE", font: "Bebas Neue", color: "#00d4ff", fontSize: 46 },
    ],
  },
  // Events
  {
    id: "birthday",
    name: "Birthday",
    emoji: "🎂",
    category: "Events",
    layers: [
      { type: "text", x: 0.5, y: 0.38, scale: 1, rotation: 0, text: "HAPPY", font: "Bangers", color: "#ffffff", fontSize: 36 },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "BIRTHDAY", font: "Bebas Neue", color: "#00d4ff", fontSize: 40 },
      { type: "text", x: 0.5, y: 0.64, scale: 1, rotation: 0, text: "NAME HERE", font: "Inter", color: "#d4a017", fontSize: 16 },
    ],
  },
  {
    id: "squad",
    name: "Squad",
    emoji: "👥",
    category: "Events",
    layers: [
      { type: "text", x: 0.5, y: 0.4, scale: 1, rotation: 0, text: "TEAM", font: "Bebas Neue", color: "#ffffff", fontSize: 44 },
      { type: "text", x: 0.5, y: 0.54, scale: 1, rotation: 0, text: "SQUAD 2026", font: "Oswald", color: "#00d4ff", fontSize: 22 },
    ],
  },
  {
    id: "celebration",
    name: "Celebration",
    emoji: "🎉",
    category: "Events",
    layers: [
      { type: "shape", x: 0.35, y: 0.35, scale: 0.6, rotation: -15, shapeId: "star", color: "#d4a017" },
      { type: "shape", x: 0.65, y: 0.35, scale: 0.6, rotation: 15, shapeId: "star", color: "#d4a017" },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "LET'S GO!", font: "Bangers", color: "#ffffff", fontSize: 42 },
    ],
  },
  {
    id: "hen-stag",
    name: "Hen / Stag",
    emoji: "💍",
    category: "Events",
    layers: [
      { type: "text", x: 0.5, y: 0.4, scale: 1, rotation: 0, text: "BRIDE TRIBE", font: "Bebas Neue", color: "#ef4444", fontSize: 34 },
      { type: "text", x: 0.5, y: 0.54, scale: 1, rotation: 0, text: "2026", font: "Inter", color: "#ffffff", fontSize: 18 },
    ],
  },
  // Minimal
  {
    id: "quote",
    name: "Quote",
    emoji: "💬",
    category: "Minimal",
    layers: [
      { type: "text", x: 0.5, y: 0.4, scale: 1, rotation: 0, text: "Print Your", font: "Inter", color: "#a1a1aa", fontSize: 16 },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "VIBE", font: "Bebas Neue", color: "#00d4ff", fontSize: 52 },
    ],
  },
  {
    id: "single-word",
    name: "Single Word",
    emoji: "Aa",
    category: "Minimal",
    layers: [
      { type: "text", x: 0.5, y: 0.48, scale: 1, rotation: 0, text: "KUSTOM", font: "Rubik Mono One", color: "#ffffff", fontSize: 32 },
    ],
  },
  {
    id: "line-divider",
    name: "Clean Line",
    emoji: "—",
    category: "Minimal",
    layers: [
      { type: "text", x: 0.5, y: 0.42, scale: 1, rotation: 0, text: "YOUR TEXT", font: "Inter", color: "#ffffff", fontSize: 20 },
      { type: "shape", x: 0.5, y: 0.52, scale: 0.5, rotation: 0, shapeId: "cross", color: "#00d4ff" },
      { type: "text", x: 0.5, y: 0.6, scale: 1, rotation: 0, text: "SUBTITLE", font: "Inter", color: "#a1a1aa", fontSize: 12 },
    ],
  },
  {
    id: "dot-accent",
    name: "Dot Accent",
    emoji: "•",
    category: "Minimal",
    layers: [
      { type: "shape", x: 0.5, y: 0.36, scale: 0.35, rotation: 0, shapeId: "circle", color: "#00d4ff" },
      { type: "text", x: 0.5, y: 0.52, scale: 1, rotation: 0, text: "MINIMAL", font: "Oswald", color: "#ffffff", fontSize: 38 },
    ],
  },
];
