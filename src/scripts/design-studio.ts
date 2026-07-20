import { designTemplates } from "../data/design-templates";
import { drawShapePath } from "../data/design-shapes";
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

type DragMode = "none" | "move" | "rotate" | "resize";
type HandleName = "nw" | "ne" | "sw" | "se" | "rotate";

const CANVAS_SIZE = 520;
const MAX_HISTORY = 20;
const HANDLE_RADIUS = 10;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let product: StudioProduct;
let mockup: MockupConfig;
let productColor: string;
let layers: DesignLayer[] = [];
let selectedId: string | null = null;
let dragMode: DragMode = "none";
let activeHandle: HandleName | null = null;
let dragOffset = { x: 0, y: 0 };
let pointerStart = { x: 0, y: 0 };
let resizeStartScale = 1;
let rotateStartAngle = 0;
let layerStartRotation = 0;
let historyCommitted = false;

let history: DesignLayer[][] = [[]];
let historyIndex = 0;

function cloneLayers(source: DesignLayer[]): DesignLayer[] {
  return JSON.parse(JSON.stringify(source)) as DesignLayer[];
}

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

function visibleLayers() {
  return layers.filter((l) => !l.hidden);
}

function pushHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(cloneLayers(layers));
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }
  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex--;
  layers = cloneLayers(history[historyIndex]);
  selectedId = null;
  syncUI();
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  layers = cloneLayers(history[historyIndex]);
  selectedId = null;
  syncUI();
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement | null;
  const redoBtn = document.getElementById("redo-btn") as HTMLButtonElement | null;
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

function syncUI() {
  updateLayerControls();
  renderLayersPanel();
  void render();
}

function layerLabel(layer: DesignLayer) {
  if (layer.type === "text") return layer.text?.slice(0, 24) || "Text";
  if (layer.type === "shape") return layer.shapeId ? layer.shapeId.charAt(0).toUpperCase() + layer.shapeId.slice(1) : "Shape";
  return "Image";
}

function layerIcon(layer: DesignLayer) {
  if (layer.type === "text") return "T";
  if (layer.type === "shape") return "◆";
  return "🖼";
}

function renderLayersPanel() {
  const list = document.getElementById("layers-list");
  const empty = document.getElementById("layers-empty");
  if (!list || !empty) return;

  if (layers.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  list.innerHTML = [...layers]
    .reverse()
    .map((layer) => {
      const idx = layers.indexOf(layer);
      const isSelected = layer.id === selectedId;
      const hiddenMark = layer.hidden ? "opacity-40" : "";
      const selectedMark = isSelected ? "border-brand-cyan bg-brand-cyan/10" : "border-white/10";
      return `
        <li class="flex items-center gap-1 rounded-lg border ${selectedMark} ${hiddenMark} p-1.5">
          <button type="button" data-layer-select="${layer.id}" class="min-w-0 flex-1 truncate px-2 py-1 text-left text-xs text-white">
            ${layerIcon(layer)} ${layerLabel(layer)}
          </button>
          <button type="button" data-layer-toggle="${layer.id}" class="rounded px-1.5 py-1 text-xs text-brand-gray hover:text-brand-cyan" title="${layer.hidden ? "Show" : "Hide"}">${layer.hidden ? "👁‍🗨" : "👁"}</button>
          <button type="button" data-layer-up="${idx}" class="rounded px-1.5 py-1 text-xs text-brand-gray hover:text-brand-cyan" title="Bring forward">↑</button>
          <button type="button" data-layer-down="${idx}" class="rounded px-1.5 py-1 text-xs text-brand-gray hover:text-brand-cyan" title="Send back">↓</button>
        </li>
      `;
    })
    .join("");

  list.querySelectorAll("[data-layer-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedId = btn.getAttribute("data-layer-select");
      syncUI();
    });
  });

  list.querySelectorAll("[data-layer-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-layer-toggle")!;
      const layer = layers.find((l) => l.id === id);
      if (layer) {
        layer.hidden = !layer.hidden;
        pushHistory();
        syncUI();
      }
    });
  });

  list.querySelectorAll("[data-layer-up]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-layer-up"));
      if (idx < layers.length - 1) {
        [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
        pushHistory();
        syncUI();
      }
    });
  });

  list.querySelectorAll("[data-layer-down]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-layer-down"));
      if (idx > 0) {
        [layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]];
        pushHistory();
        syncUI();
      }
    });
  });
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getLayerDimensions(layer: DesignLayer) {
  const area = printRect();
  if (layer.type === "text" && layer.text) {
    const size = (layer.fontSize ?? 32) * layer.scale;
    ctx.font = `bold ${size}px ${layer.font ?? "Bebas Neue"}, sans-serif`;
    const w = ctx.measureText(layer.text).width;
    const h = size;
    return { w: Math.max(w, 20), h: Math.max(h, 20) };
  }
  if (layer.type === "shape") {
    const size = 60 * layer.scale;
    return { w: size, h: size };
  }
  return { w: 80 * layer.scale, h: 80 * layer.scale };
}

function getLayerCenter(layer: DesignLayer) {
  const area = printRect();
  return {
    x: area.x + layer.x * area.w,
    y: area.y + layer.y * area.h,
  };
}

function layerBounds(layer: DesignLayer) {
  const center = getLayerCenter(layer);
  const { w, h } = getLayerDimensions(layer);
  return {
    x: center.x - w / 2 - 4,
    y: center.y - h / 2 - 4,
    w: w + 8,
    h: h + 8,
    cx: center.x,
    cy: center.y,
  };
}

function getHandles(layer: DesignLayer) {
  const b = layerBounds(layer);
  const cx = b.cx;
  return {
    nw: { x: b.x, y: b.y },
    ne: { x: b.x + b.w, y: b.y },
    sw: { x: b.x, y: b.y + b.h },
    se: { x: b.x + b.w, y: b.y + b.h },
    rotate: { x: cx, y: b.y - 28 },
  };
}

function hitTestHandle(mx: number, my: number): HandleName | null {
  const layer = getSelectedLayer();
  if (!layer) return null;
  const handles = getHandles(layer);
  for (const name of ["rotate", "nw", "ne", "sw", "se"] as HandleName[]) {
    const pos = handles[name];
    if (Math.hypot(mx - pos.x, my - pos.y) <= HANDLE_RADIUS + 2) return name;
  }
  return null;
}

function hitTestLayer(mx: number, my: number): DesignLayer | undefined {
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (layer.hidden) continue;
    const b = layerBounds(layer);
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return layer;
  }
  return undefined;
}

function drawSelectionHandles(layer: DesignLayer) {
  const b = layerBounds(layer);
  const handles = getHandles(layer);

  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.setLineDash([]);

  ctx.fillStyle = "#00d4ff";
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 1.5;
  for (const name of ["nw", "ne", "sw", "se"] as HandleName[]) {
    const pos = handles[name];
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, HANDLE_RADIUS / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const rot = handles.rotate;
  ctx.beginPath();
  ctx.moveTo(b.cx, b.y);
  ctx.lineTo(rot.x, rot.y);
  ctx.strokeStyle = "#00d4ff";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rot.x, rot.y, HANDLE_RADIUS / 2 + 1, 0, Math.PI * 2);
  ctx.fillStyle = "#2563eb";
  ctx.fill();
  ctx.strokeStyle = "#00d4ff";
  ctx.stroke();
}

async function drawLayer(layer: DesignLayer) {
  if (layer.hidden) return;

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

  if (layer.type === "shape" && layer.shapeId) {
    ctx.fillStyle = layer.color ?? "#00d4ff";
    drawShapePath(ctx, layer.shapeId, 60);
    ctx.fill();
  }

  ctx.restore();
}

async function render() {
  drawMockup();
  for (const layer of layers) await drawLayer(layer);
  const selected = getSelectedLayer();
  if (selected && !selected.hidden) drawSelectionHandles(selected);
}

function canvasCoords(clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function onPointerDown(clientX: number, clientY: number) {
  const { x, y } = canvasCoords(clientX, clientY);
  pointerStart = { x, y };
  historyCommitted = false;

  const handle = hitTestHandle(x, y);
  if (handle && getSelectedLayer()) {
    activeHandle = handle;
    const layer = getSelectedLayer()!;
    if (handle === "rotate") {
      dragMode = "rotate";
      const center = getLayerCenter(layer);
      rotateStartAngle = Math.atan2(y - center.y, x - center.x);
      layerStartRotation = layer.rotation;
    } else {
      dragMode = "resize";
      resizeStartScale = layer.scale;
    }
    return;
  }

  const hit = hitTestLayer(x, y);
  if (hit) {
    selectedId = hit.id;
    dragMode = "move";
    const center = getLayerCenter(hit);
    dragOffset = { x: x - center.x, y: y - center.y };
    syncUI();
    return;
  }

  selectedId = null;
  dragMode = "none";
  syncUI();
}

function onPointerMove(clientX: number, clientY: number) {
  const { x, y } = canvasCoords(clientX, clientY);
  const layer = getSelectedLayer();
  if (!layer || dragMode === "none") return;

  if (dragMode === "move") {
    const area = printRect();
    const cx = x - dragOffset.x;
    const cy = y - dragOffset.y;
    layer.x = Math.max(0.05, Math.min(0.95, (cx - area.x) / area.w));
    layer.y = Math.max(0.05, Math.min(0.95, (cy - area.y) / area.h));
    void render();
    return;
  }

  if (dragMode === "rotate") {
    const center = getLayerCenter(layer);
    const angle = Math.atan2(y - center.y, x - center.x);
    const delta = ((angle - rotateStartAngle) * 180) / Math.PI;
    layer.rotation = Math.round(layerStartRotation + delta);
    updateRotationInput(layer.rotation);
    void render();
    return;
  }

  if (dragMode === "resize") {
    const center = getLayerCenter(layer);
    const startDist = Math.hypot(pointerStart.x - center.x, pointerStart.y - center.y);
    const dist = Math.hypot(x - center.x, y - center.y);
    if (startDist > 0) {
      layer.scale = Math.max(0.25, Math.min(3, resizeStartScale * (dist / startDist)));
      updateScaleInput(layer.scale);
      void render();
    }
  }
}

function onPointerUp() {
  if (dragMode !== "none" && !historyCommitted) {
    pushHistory();
    historyCommitted = true;
  }
  dragMode = "none";
  activeHandle = null;
}

function updateScaleInput(scale: number) {
  const input = document.getElementById("layer-scale") as HTMLInputElement | null;
  if (input) input.value = String(Math.round(scale * 100));
}

function updateRotationInput(rotation: number) {
  const input = document.getElementById("layer-rotation") as HTMLInputElement | null;
  if (input) input.value = String(Math.round(rotation));
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
  updateScaleInput(layer.scale);
  updateRotationInput(layer.rotation);

  const colorPanel = document.getElementById("color-presets-selected");
  const isText = layer.type === "text";
  const isShape = layer.type === "shape";

  if (isText) {
    (document.getElementById("text-edit-group") as HTMLElement)?.classList.remove("hidden");
    colorPanel?.classList.remove("hidden");
    (document.getElementById("edit-text") as HTMLInputElement).value = layer.text ?? "";
    (document.getElementById("edit-color") as HTMLInputElement).value = layer.color ?? "#ffffff";
    (document.getElementById("edit-shape-color") as HTMLInputElement).value = layer.color ?? "#ffffff";
    (document.getElementById("edit-font") as HTMLSelectElement).value = layer.font ?? "Bebas Neue";
    (document.getElementById("edit-font-size") as HTMLInputElement).value = String(layer.fontSize ?? 32);
  } else if (isShape) {
    (document.getElementById("text-edit-group") as HTMLElement)?.classList.add("hidden");
    colorPanel?.classList.remove("hidden");
    (document.getElementById("edit-shape-color") as HTMLInputElement).value = layer.color ?? "#00d4ff";
  } else {
    (document.getElementById("text-edit-group") as HTMLElement)?.classList.add("hidden");
    colorPanel?.classList.add("hidden");
  }
}

function addShapeLayer(shapeId: string, color: string) {
  layers.push({
    id: layerId(),
    type: "shape",
    x: 0.5,
    y: 0.5,
    scale: 1,
    rotation: 0,
    shapeId,
    color,
  });
  selectedId = layers[layers.length - 1].id;
  pushHistory();
  syncUI();
}

function applyColorToSelected(color: string) {
  const layer = getSelectedLayer();
  if (!layer || (layer.type !== "text" && layer.type !== "shape")) return;
  layer.color = color;
  if (layer.type === "text") {
    (document.getElementById("edit-color") as HTMLInputElement).value = color;
    (document.getElementById("edit-shape-color") as HTMLInputElement).value = color;
  } else {
    (document.getElementById("edit-shape-color") as HTMLInputElement).value = color;
  }
  void render();
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
  pushHistory();
  syncUI();
}

function applyTemplate(templateId: string) {
  const template = designTemplates.find((t) => t.id === templateId);
  if (!template) return;
  layers = template.layers.map((l) => ({ ...l, id: layerId() }));
  selectedId = layers[0]?.id ?? null;
  pushHistory();
  syncUI();
}

function deleteSelectedLayer() {
  if (!selectedId) return;
  layers = layers.filter((l) => l.id !== selectedId);
  selectedId = null;
  pushHistory();
  syncUI();
}

async function exportDesign(): Promise<{ preview: string; printExport: string; label: string }> {
  const prevSelected = selectedId;
  selectedId = null;
  await render();

  const preview = canvas.toDataURL("image/jpeg", 0.85);
  selectedId = prevSelected;
  await render();

  const area = printRect();
  const printCanvas = document.createElement("canvas");
  printCanvas.width = area.w * 2;
  printCanvas.height = area.h * 2;
  const pctx = printCanvas.getContext("2d")!;

  for (const layer of visibleLayers()) {
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
    if (layer.type === "shape" && layer.shapeId) {
      pctx.fillStyle = layer.color ?? "#00d4ff";
      drawShapePath(pctx, layer.shapeId, 60 * 2);
      pctx.fill();
    }
    pctx.restore();
  }

  const textParts = visibleLayers().filter((l) => l.type === "text").map((l) => l.text);
  const label =
    textParts.length > 0
      ? `Custom: ${textParts.join(" / ").slice(0, 40)}`
      : visibleLayers().some((l) => l.type === "image")
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
  document.getElementById("undo-btn")?.addEventListener("click", undo);
  document.getElementById("redo-btn")?.addEventListener("click", redo);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (selectedId) {
        e.preventDefault();
        deleteSelectedLayer();
      }
    }
  });

  document.getElementById("add-text-btn")?.addEventListener("click", () => {
    const text = (document.getElementById("new-text") as HTMLInputElement).value.trim();
    if (!text) return;
    const font = (document.getElementById("new-font") as HTMLSelectElement).value;
    const color = (document.getElementById("new-color") as HTMLInputElement).value;
    const fontSize = Number((document.getElementById("new-font-size") as HTMLInputElement).value);
    addTextLayer(text, font, color, fontSize);
    (document.getElementById("new-text") as HTMLInputElement).value = "";
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
      pushHistory();
      syncUI();
    };
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = "";
  });

  document.querySelectorAll<HTMLButtonElement>("[data-template]").forEach((btn) => {
    btn.addEventListener("click", () => applyTemplate(btn.dataset.template!));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-pick-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-pick-color")!;
      (document.getElementById("new-color") as HTMLInputElement).value = color;
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-shape-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-shape-color")!;
      (document.getElementById("shape-color") as HTMLInputElement).value = color;
      document.querySelectorAll("[data-shape-color]").forEach((b) => {
        b.setAttribute("data-active", String(b === btn));
      });
    });
  });
  document.querySelector<HTMLButtonElement>("[data-shape-color='#00d4ff']")?.setAttribute("data-active", "true");

  document.querySelectorAll<HTMLButtonElement>("[data-add-shape]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const shapeId = btn.getAttribute("data-add-shape")!;
      const color = (document.getElementById("shape-color") as HTMLInputElement).value;
      addShapeLayer(shapeId, color);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-apply-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyColorToSelected(btn.getAttribute("data-apply-color")!);
      pushHistory();
    });
  });

  document.getElementById("edit-shape-color")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "shape") {
      layer.color = (e.target as HTMLInputElement).value;
      void render();
    }
  });
  document.getElementById("edit-shape-color")?.addEventListener("change", () => pushHistory());

  document.getElementById("edit-font")?.addEventListener("change", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.font = (e.target as HTMLSelectElement).value;
      pushHistory();
      void render();
    }
  });

  document.getElementById("layer-scale")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (!layer) return;
    layer.scale = Number((e.target as HTMLInputElement).value) / 100;
    void render();
  });
  document.getElementById("layer-scale")?.addEventListener("change", () => pushHistory());

  document.getElementById("layer-rotation")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (!layer) return;
    layer.rotation = Number((e.target as HTMLInputElement).value);
    void render();
  });
  document.getElementById("layer-rotation")?.addEventListener("change", () => pushHistory());

  document.getElementById("edit-text")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.text = (e.target as HTMLInputElement).value;
      renderLayersPanel();
      void render();
    }
  });
  document.getElementById("edit-text")?.addEventListener("change", () => pushHistory());

  document.getElementById("edit-color")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.color = (e.target as HTMLInputElement).value;
      void render();
    }
  });
  document.getElementById("edit-color")?.addEventListener("change", () => pushHistory());

  document.getElementById("edit-font-size")?.addEventListener("input", (e) => {
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.fontSize = Number((e.target as HTMLInputElement).value);
      void render();
    }
  });
  document.getElementById("edit-font-size")?.addEventListener("change", () => pushHistory());

  document.getElementById("layer-delete")?.addEventListener("click", deleteSelectedLayer);

  document.getElementById("add-to-cart-design")?.addEventListener("click", async () => {
    if (visibleLayers().length === 0) {
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

function bindPointerEvents() {
  canvas.addEventListener("mousedown", (e) => onPointerDown(e.clientX, e.clientY));
  canvas.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onPointerUp);

  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      onPointerDown(touch.clientX, touch.clientY);
    },
    { passive: false },
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      onPointerMove(touch.clientX, touch.clientY);
    },
    { passive: false },
  );

  window.addEventListener("touchend", onPointerUp);
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

  history = [cloneLayers(layers)];
  historyIndex = 0;
  updateUndoRedoButtons();

  bindPointerEvents();
  bindTabs();
  bindControls();
  renderLayersPanel();
  void render();
}

if (document.getElementById("design-studio")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDesignStudio);
  } else {
    initDesignStudio();
  }
}
