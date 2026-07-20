import type { DesignLayer } from "../lib/design";

export interface DesignTemplate {
  id: string;
  name: string;
  emoji: string;
  layers: Omit<DesignLayer, "id">[];
}

export const designTemplates: DesignTemplate[] = [
  {
    id: "bold-brand",
    name: "Bold Brand",
    emoji: "🔥",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.35,
        scale: 1,
        rotation: 0,
        text: "YOUR BRAND",
        font: "Bebas Neue",
        color: "#00d4ff",
        fontSize: 42,
      },
      {
        type: "text",
        x: 0.5,
        y: 0.55,
        scale: 1,
        rotation: 0,
        text: "EST. 2026",
        font: "Inter",
        color: "#ffffff",
        fontSize: 14,
      },
    ],
  },
  {
    id: "street-script",
    name: "Street Script",
    emoji: "✨",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.45,
        scale: 1,
        rotation: -4,
        text: "Stay Kustom",
        font: "Bebas Neue",
        color: "#ffffff",
        fontSize: 48,
      },
    ],
  },
  {
    id: "minimal-icon",
    name: "Minimal",
    emoji: "◆",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.38,
        scale: 1,
        rotation: 0,
        text: "◆",
        font: "Inter",
        color: "#00d4ff",
        fontSize: 56,
      },
      {
        type: "text",
        x: 0.5,
        y: 0.58,
        scale: 1,
        rotation: 0,
        text: "KUSTOM FITS",
        font: "Bebas Neue",
        color: "#ffffff",
        fontSize: 22,
      },
    ],
  },
  {
    id: "retro-block",
    name: "Retro Block",
    emoji: "📦",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.42,
        scale: 1,
        rotation: 0,
        text: "LIMITED",
        font: "Bebas Neue",
        color: "#2563eb",
        fontSize: 36,
      },
      {
        type: "text",
        x: 0.5,
        y: 0.56,
        scale: 1,
        rotation: 0,
        text: "EDITION",
        font: "Bebas Neue",
        color: "#ffffff",
        fontSize: 36,
      },
    ],
  },
  {
    id: "quote",
    name: "Quote",
    emoji: "💬",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.4,
        scale: 1,
        rotation: 0,
        text: "Print Your",
        font: "Inter",
        color: "#a1a1aa",
        fontSize: 16,
      },
      {
        type: "text",
        x: 0.5,
        y: 0.52,
        scale: 1,
        rotation: 0,
        text: "VIBE",
        font: "Bebas Neue",
        color: "#00d4ff",
        fontSize: 52,
      },
    ],
  },
  {
    id: "number-back",
    name: "Number Back",
    emoji: "07",
    layers: [
      {
        type: "text",
        x: 0.5,
        y: 0.48,
        scale: 1,
        rotation: 0,
        text: "07",
        font: "Bebas Neue",
        color: "#ffffff",
        fontSize: 72,
      },
    ],
  },
];
