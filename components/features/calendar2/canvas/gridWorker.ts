/// <reference lib="webworker" />

// Worker for drawing day-grid backgrounds on OffscreenCanvas
// Messages:
// { type: 'register', id, canvas, devicePixelRatio }
// { type: 'draw', id, width, height, gridStart, gridEnd, slotMinutes, isToday, isWeekend, workStart, workEnd, nowMinutes }
// { type: 'unregister', id }

export type RegisterMsg = {
  type: 'register';
  id: string;
  canvas: OffscreenCanvas;
  devicePixelRatio: number;
};

export type DrawMsg = {
  type: 'draw';
  id: string;
  width: number;
  height: number;
  gridStart: number; // minutes from 00:00
  gridEnd: number;   // minutes from 00:00
  slotMinutes: number;
  isToday: boolean;
  isWeekend: boolean;
  workStart: number; // minutes from 00:00
  workEnd: number;   // minutes from 00:00
  nowMinutes: number | null; // minutes from 00:00
  heat?: number[]; // 0..1 per slot
  heatColor?: string; // css color base
};

export type UnregisterMsg = {
  type: 'unregister';
  id: string;
};

const contexts = new Map<string, { ctx: OffscreenCanvasRenderingContext2D; dpr: number }>();

function drawGrid(ctx: OffscreenCanvasRenderingContext2D, opts: Omit<DrawMsg, 'type' | 'id'>, dpr: number) {
  const {
    width, height, gridStart, gridEnd, slotMinutes,
    isToday, isWeekend, workStart, workEnd, nowMinutes,
    heat, heatColor
  } = opts;

  const W = Math.max(1, Math.floor(width * dpr));
  const H = Math.max(1, Math.floor(height * dpr));

  ctx.canvas.width = W;
  ctx.canvas.height = H;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Base bg
  if (isWeekend) {
    ctx.fillStyle = 'rgba(30,41,59,0.20)'; // slate-800/20
    ctx.fillRect(0, 0, width, height);
  }

  // Work hours highlight
  const minM = gridStart;
  const maxM = gridEnd;
  const topM = Math.max(workStart, minM);
  const botM = Math.min(workEnd, maxM);
  if (botM > topM) {
    const total = maxM - minM;
    const yTop = ((topM - minM) / total) * height;
    const h = ((botM - topM) / total) * height;
    ctx.fillStyle = 'rgba(100,116,139,0.10)'; // slate-500/10
    ctx.fillRect(0, yTop, width, h);
  }

  // Horizontal grid lines per slot
  const totalMinutes = gridEnd - gridStart;
  const slots = Math.floor(totalMinutes / slotMinutes);

  // Heat overlay per slot (beneath lines)
  if (heat && heat.length === slots) {
    for (let i=0;i<slots;i++) {
      const y1 = (i / slots) * height;
      const y2 = ((i+1) / slots) * height;
      const intensity = Math.max(0, Math.min(1, heat[i] || 0));
      if (intensity <= 0) continue;
      const alpha = 0.22 * intensity; // subtle
      ctx.fillStyle = heatColor || `rgba(56,189,248,${alpha})`; // cyan-400
      ctx.fillRect(0, y1, width, y2 - y1);
    }
  }

  ctx.strokeStyle = 'rgba(71,85,105,0.30)'; // slate-600/30
  ctx.lineWidth = 1;
  for (let i = 0; i <= slots; i++) {
    const y = (i / slots) * height;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(width, Math.round(y) + 0.5);
    ctx.stroke();
  }

  // Today ring subtle
  if (isToday) {
    ctx.strokeStyle = 'rgba(99,102,241,0.30)'; // indigo-500/30
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  // Now line, only if today and in range
  if (isToday && nowMinutes != null && nowMinutes >= gridStart && nowMinutes <= gridEnd) {
    const y = ((nowMinutes - gridStart) / (gridEnd - gridStart)) * height;
    ctx.strokeStyle = 'rgba(239,68,68,0.8)'; // red-500/80
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(width, Math.round(y) + 0.5);
    ctx.stroke();

    // Dot on the left
    ctx.fillStyle = 'rgba(239,68,68,1)';
    ctx.beginPath();
    ctx.arc(4, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

self.onmessage = (e: MessageEvent<RegisterMsg | DrawMsg | UnregisterMsg>) => {
  const data = e.data as any;
  if (!data || typeof data.type !== 'string') return;

  if (data.type === 'register') {
    const { id, canvas, devicePixelRatio } = data as RegisterMsg;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    contexts.set(id, { ctx, dpr: devicePixelRatio || 1 });
    return;
  }

  if (data.type === 'unregister') {
    const { id } = data as UnregisterMsg;
    contexts.delete(id);
    return;
  }

  if (data.type === 'draw') {
    const { id, ...rest } = data as DrawMsg;
    const entry = contexts.get(id);
    if (!entry) return;
    try {
      drawGrid(entry.ctx, rest as any, entry.dpr);
    } catch (err) {
      // swallow
    }
    return;
  }
};
