import { designTemplates } from "../data/design-templates";
import {
  createDesignId,
  mockupConfigs,
  saveDesign,
  variantToColor,
  type DesignLayer,
  type MockupConfig,
  type SavedDesign,
} from "../lib/design";
import { addToCart } from "../lib/cart";

interface StudioProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  variant: string;
}

const CANVAS_SIZE = 520;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let product: StudioProduct;
let mockup: MockupConfig;
let productColor: string;
let layers: DesignLayer[] = [];
let selectedId: string | null = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;

function printRect() {
  return {
    x: mockup.printArea.x * CANVAS_SIZE,
    y: mockup.printArea.y * CANVAS_SIZE,
    w: mockup.printArea.w * CANVAS_SIZE,
    h: mockup.printArea.h * CANVAS_SIZE,
  };
}

function layerId() {
  return `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function getSelectedLayer() {
  return layers.find((l) => l.id === selectedId);
}

function drawMockup() {
  const c = productColor;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.fillStyle = c;
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  switch (mockup.shape) {
    case "tee":
      ctx.beginPath();
      ctx.roundRect(160, 100, 200, 260, 12);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(160, 130);
      ctx.lineTo(110, 170);
      ctx.lineTo(130, 200);
      ctx.lineTo(160, 180);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(360, 130);
      ctx.lineTo(410, 170);
      ctx.lineTo(390, 200);
      ctx.lineTo(360, 180);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.roundRect(210, 100, 100, 30, 8);
      ctx.fill();
      break;
    case "hoodie":
      ctx.beginPath();
      ctx.roundRect(150, 120, 220, 250, 14);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(195, 120, 130, 40, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.roundRect(200, 130, 120, 20, 6);
      ctx.fill();
      break;
    case "cap":
      ctx.beginPath();
      ctx.ellipse(260, 220, 120, 70, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(260, 280, 130, 20, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      break;
    case "tote":
      ctx.beginPath();
      ctx.roundRect(130, 130, 260, 280, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(200, 130, 30, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(320, 130, 30, Math.PI, 0);
      ctx.stroke();
      break;
    case "mug":
      ctx.beginPath();
      ctx.roundRect(170, 120, 180, 220, 10);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(360, 200, 35, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
  }

  const area = printRect();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "rgba(0, 212, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(area.x, area.y, area.w, area.h);
  ctx.setLineDash([]);
}

async function drawLayer(layer: DesignLayer) {
  const area = printRect();
  const cx = area.x + layer.x * area.w;
  const cy = area.y + layer.y * area.h;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);

  if (layer.type === "text" && layer.text) {
    const size = layer.fontSize ?? 32;
    ctx.font = `bold ${size}px ${layer.font ?? "Bebas Neue"}, sans-serif`;
    ctx.fillStyle = layer.color ?? "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.text, 0, 0);
  }

  if (layer.type === "image" && layer.imageData) {
    const img = await loadImage(layer.imageData);
    const maxW = area.w * 0.8;
    const maxH = area.h * 0.8;
    const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }

  ctx.restore();

  if (layer.id === selectedId) {
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    const box = layerBounds(layer);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.setLineDash([]);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function layerBounds(layer: DesignLayer) {
  const area = printRect();
  const cx = area.x + layer.x * area.w;
  const cy = area.y + layer.y * area.h;
  const size = layer.type === "text" ? (layer.fontSize ?? 32) * layer.scale : 80 * layer.scale;
  return { x: cx - size / 2 - 4, y: cy - size / 2 - 4, w: size + 8, h: size + 8 };
}

function hitTest(mx: number, my: number): DesignLayer | undefined {
  for (let i = layers.length - 1; i >= 0; i--) {
    const b = layerBounds(layers[i]);
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return layers[i];
  }
  return undefined;
}

async function render() {
  drawMockup();
  for (const layer of layers) await drawLayer(layer);
}

function canvasCoords(e: MouseEvent | Touch) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function onPointerDown(e: MouseEvent) {
  const { x, y } = canvasCoords(e);
  const hit = hitTest(x, y);
  if (hit) {
    selectedId = hit.id;
    isDragging = true;
    const area = printRect();
    const cx = area.x + hit.x * area.w;
    const cy = area.y + hit.y * area.h;
    dragOffset = { x: x - cx, y: y - cy };
    updateLayerControls();
    void render();
  } else {
    selectedId = null;
    updateLayerControls();
    void render();
  }
}

function onPointerMove(e: MouseEvent) {
  if (!isDragging || !selectedId) return;
  const { x, y } = canvasCoords(e);
  const area = printRect();
  const layer = getSelectedLayer();
  if (!layer) return;

  const cx = x - dragOffset.x;
  const cy = y - dragOffset.y;
  layer.x = Math.max(0.05, Math.min(0.95, (cx - area.x) / area.w));
  layer.y = Math.max(0.05, Math.min(0.95, (cy - area.y) / area.h));
  void render();
}

function onPointerUp() {
  isDragging = false;
}

function updateLayerControls() {
  const panel = document.getElementById("layer-controls");
  const layer = getSelectedLayer();
  if (!panel) return;

  if (!layer) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  const scaleInput = document.getElementById("layer-scale") as HTMLInputElement;
  if (scaleInput) scaleInput.value = String(Math.round(layer.scale * 100));

  if (layer.type === "text") {
    (document.getElementById("text-edit-group") as HTMLElement)?.classList.remove("hidden");
    (document.getElementById("edit-text") as HTMLInputElement).value = layer.text ?? "";
    (document.getElementById("edit-color") as HTMLInputElement).value = layer.color ?? "#ffffff";
    (document.getElementById("edit-font-size") as HTMLInputElement).value = String(layer.fontSize ?? 32);
  } else {
    (document.getElementById("text-edit-group") as HTMLElement)?.classList.add("hidden");
  }
}

function addTextLayer(text: string, font: string, color: string, fontSize: number) {
  layers.push({
    id: layerId(),
    type: "text",
    x: 0.5,
    y: 0.5,
    scale: 1,
    rotation: 0,
    text,
    font,
    color,
    fontSize,
  });
  selectedId = layers[layers.length - 1].id;
  void render();
  updateLayerControls();
}

function applyTemplate(templateId: string) {
  const template = designTemplates.find((t) => t.id === templateId);
  if (!template) return;
  layers = template.layers.map((l) => ({ ...l, id: layerId() }));
  selectedId = layers[0]?.id ?? null;
  void render();
  updateLayerControls();
}

async function exportDesign(): Promise<{ preview: string; printExport: string; label: string }> {
  await render();

  const preview = canvas.toDataURL("image/jpeg", 0.85);

  const area = printRect();
  const printCanvas = document.createElement("canvas");
  printCanvas.width = area.w * 2;
  printCanvas.height = area.h * 2;
  const pctx = printCanvas.getContext("2d")!;
  pctx.fillStyle = "transparent";
  pctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

  for (const layer of layers) {
    pctx.save();
    pctx.translate(layer.x * printCanvas.width, layer.y * printCanvas.height);
    pctx.rotate((layer.rotation * Math.PI) / 180);
    pctx.scale(layer.scale, layer.scale);

    if (layer.type === "text" && layer.text) {
      const size = (layer.fontSize ?? 32) * 2;
      pctx.font = `bold ${size}px ${layer.font ?? "Bebas Neue"}, sans-serif`;
      pctx.fillStyle = layer.color ?? "#ffffff";
      pctx.textAlign = "center";
      pctx.textBaseline = "middle";
      pctx.fillText(layer.text, 0, 0);
    }
    if (layer.type === "image" && layer.imageData) {
      const img = await loadImage(layer.imageData);
      const maxW = printCanvas.width * 0.8;
      const maxH = printCanvas.height * 0.8;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      pctx.drawImage(img, (-img.width * ratio) / 2, (-img.height * ratio) / 2, img.width * ratio, img.height * ratio);
    }
    pctx.restore();
  }

  const textParts = layers.filter((l) => l.type === "text").map((l) => l.text);
  const label =
    textParts.length > 0
      ? `Custom: ${textParts.join(" / ").slice(0, 40)}`
      : layers.some((l) => l.type === "image")
        ? "Custom: uploaded artwork"
        : "Custom design";

  return { preview, printExport: printCanvas.toDataURL("image/png"), label };
}

function bindTabs() {
  document.querySelectorAll<HTMLButtonElement>("[data-design-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.designTab!;
      document.querySelectorAll("[data-design-tab]").forEach((b) => {
        b.classList.toggle("border-brand-cyan", b.getAttribute("data-design-tab") === tab);
        b.classList.toggle("text-brand-cyan", b.getAttribute("data-design-tab") === tab);
        b.classList.toggle("border-transparent", b.getAttribute("data-design-tab") !== tab);
        b.classList.toggle("text-brand-gray", b.getAttribute("data-design-tab") !== tab);
      });
      document.querySelectorAll<HTMLElement>("[data-design-panel]").forEach((p) => {
        p.classList.toggle("hidden", p.dataset.designPanel !== tab);
      });
    });
  });
}

function bindControls() {
  document.getElementById("add-text-btn")?.addEventListener("click", () => {
    const text = (document.getElementById("new-text") as HTMLInputElement).value.trim();
    if (!text) return;
    const font = (document.getElementById("new-font") as HTMLSelectElement).value;
    const color = (document.getElementById("new-color") as HTMLInputElement).value;
    const fontSize = Number((document.getElementById("new-font-size") as HTMLInputElement).value);
    addTextLayer(text, font, color, fontSize);
  });

  document.getElementById("upload-image")?.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      layers.push({
        id: layerId(),
        type: "image",
        x: 0.5,
        y: 0.5,
        scale: 1,
        rotation: 0,
        imageData: reader.result as string,
      });
      selectedId = layers[layers.length - 1].id;
      void render();
      updateLayerControls();
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-template]").forEach((btn) => {
    btn.addEventListener("click", () => applyTemplate(btn.dataset.template!));
  });

  document.getElementById("layer-scale")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (!layer) return;
    layer.scale = Number((e.target as HTMLInputElement).value) / 100;
    void render();
  });

  document.getElementById("edit-text")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.text = (e.target as HTMLInputElement).value;
      void render();
    }
  });

  document.getElementById("edit-color")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.color = (e.target as HTMLInputElement).value;
      void render();
    }
  });

  document.getElementById("edit-font-size")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.fontSize = Number((e.target as HTMLInputElement).value);
      void render();
    }
  });

  document.getElementById("layer-delete")?.addEventListener("click", () => {
    if (!selectedId) return;
    layers = layers.filter((l) => l.id !== selectedId);
    selectedId = null;
    updateLayerControls();
    void render();
  });

  document.getElementById("add-to-cart-design")?.addEventListener("click", async () => {
    if (layers.length === 0) {
      alert("Add a design first — upload an image, add text, or pick a template.");
      return;
    }

    const btn = document.getElementById("add-to-cart-design") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Saving…";

    const { preview, printExport, label } = await exportDesign();
    const designId = createDesignId();

    const design: SavedDesign = {
      id: designId,
      productSlug: product.slug,
      productName: product.name,
      variant: product.variant,
      label,
      preview,
      printExport,
      layers,
      createdAt: Date.now(),
    };

    saveDesign(design);

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      variant: product.variant,
      price: product.price,
      designId,
      designLabel: label,
      designPreview: preview,
    });

    window.location.href = "/shop/" + product.slug + "?added=1";
  });
}

export function initDesignStudio() {
  const root = document.getElementById("design-studio");
  if (!root) return;

  const raw = root.dataset.product;
  if (!raw) return;

  product = JSON.parse(raw) as StudioProduct;
  mockup = mockupConfigs[product.slug] ?? mockupConfigs["t-shirt"];
  productColor = variantToColor(product.variant);

  canvas = document.getElementById("design-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  bindTabs();
  bindControls();
  void render();
}

if (document.getElementById("design-studio")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDesignStudio);
  } else {
    initDesignStudio();
  }
}
