export interface DesignShape {
  id: string;
  name: string;
  emoji: string;
}

export const designShapes: DesignShape[] = [
  { id: "star", name: "Star", emoji: "★" },
  { id: "circle", name: "Circle", emoji: "●" },
  { id: "lightning", name: "Lightning", emoji: "⚡" },
  { id: "crown", name: "Crown", emoji: "♛" },
  { id: "heart", name: "Heart", emoji: "♥" },
  { id: "diamond", name: "Diamond", emoji: "◆" },
  { id: "flame", name: "Flame", emoji: "🔥" },
  { id: "cross", name: "Cross", emoji: "✚" },
  { id: "arrow", name: "Arrow", emoji: "➤" },
  { id: "bolt-ring", name: "Ring", emoji: "◎" },
];

export function drawShapePath(ctx: CanvasRenderingContext2D, shapeId: string, size: number) {
  const s = size / 2;
  ctx.beginPath();

  switch (shapeId) {
    case "circle":
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      break;
    case "star": {
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? s : s * 0.45;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case "heart":
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(0, -s * 0.2, -s, -s * 0.2, -s, s * 0.15);
      ctx.bezierCurveTo(-s, s * 0.55, 0, s * 0.85, 0, s);
      ctx.bezierCurveTo(0, s * 0.85, s, s * 0.55, s, s * 0.15);
      ctx.bezierCurveTo(s, -s * 0.2, 0, -s * 0.2, 0, s * 0.35);
      break;
    case "diamond":
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.75, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.75, 0);
      ctx.closePath();
      break;
    case "lightning":
      ctx.moveTo(s * 0.15, -s);
      ctx.lineTo(-s * 0.35, s * 0.05);
      ctx.lineTo(-s * 0.05, s * 0.05);
      ctx.lineTo(-s * 0.25, s);
      ctx.lineTo(s * 0.45, -s * 0.1);
      ctx.lineTo(s * 0.1, -s * 0.1);
      ctx.closePath();
      break;
    case "crown":
      ctx.moveTo(-s, s * 0.4);
      ctx.lineTo(-s * 0.65, -s * 0.1);
      ctx.lineTo(-s * 0.35, s * 0.15);
      ctx.lineTo(0, -s * 0.45);
      ctx.lineTo(s * 0.35, s * 0.15);
      ctx.lineTo(s * 0.65, -s * 0.1);
      ctx.lineTo(s, s * 0.4);
      ctx.closePath();
      break;
    case "flame":
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.55, -s * 0.2, s * 0.35, s * 0.35);
      ctx.quadraticCurveTo(s * 0.15, s * 0.75, 0, s);
      ctx.quadraticCurveTo(-s * 0.15, s * 0.75, -s * 0.35, s * 0.35);
      ctx.quadraticCurveTo(-s * 0.55, -s * 0.2, 0, -s);
      break;
    case "cross":
      ctx.rect(-s * 0.15, -s, s * 0.3, s * 2);
      ctx.rect(-s, -s * 0.15, s * 2, s * 0.3);
      break;
    case "arrow":
      ctx.moveTo(-s * 0.7, -s * 0.35);
      ctx.lineTo(s * 0.5, -s * 0.35);
      ctx.lineTo(s * 0.5, -s * 0.65);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.5, s * 0.65);
      ctx.lineTo(s * 0.5, s * 0.35);
      ctx.lineTo(-s * 0.7, s * 0.35);
      ctx.closePath();
      break;
    case "bolt-ring":
      ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
      ctx.moveTo(0, -s * 0.45);
      ctx.arc(0, 0, s * 0.45, -Math.PI / 2, Math.PI / 2);
      break;
    default:
      ctx.rect(-s * 0.5, -s * 0.5, s, s);
  }
}
