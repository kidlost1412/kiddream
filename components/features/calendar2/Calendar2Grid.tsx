import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Todo } from '../../../types';
import { useTodoStore } from '../../../stores/useTodoStore';
import { useTranslation } from '../../../hooks/useTranslation';
import Calendar2Event from './Calendar2Event';
import TodoDetailModal from '../todos/TodoDetailModal';
import ImprovedAddTodoModal from '../todos/ImprovedAddTodoModal';
import { timeToMinutes, formatLocalDate, parseLocalDate } from '../../../utils/dateHelpers';

interface Calendar2GridProps {
  startDate: Date;
  daysToShow: number;
  searchTerm?: string;
  priorityFilter?: number | 'all';
  tagFilter?: string;
}

const gridStartHour = 5;
const gridEndHour = 22;

const toHM = (m: number) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

export default function Calendar2Grid({ startDate, daysToShow, searchTerm='', priorityFilter='all', tagFilter='' }: Calendar2GridProps) {
  const { todos } = useTodoStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Todo | null>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const now = new Date();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [initialDueDate, setInitialDueDate] = useState<string | undefined>(undefined);
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>(undefined);
  const [initialEndTime, setInitialEndTime] = useState<string | undefined>(undefined);
  const [slotMinutes, setSlotMinutes] = useState<15 | 30 | 60 | 120>(30);
  const [density, setDensity] = useState<'compact'|'cozy'|'comfortable'>('cozy');
  const densityHeights = { compact: 2.0, cozy: 2.5, comfortable: 3.2 } as const;
  const slotHeightRem = densityHeights[density];
  const remPerMinute = slotHeightRem / slotMinutes;
  const [colMinWidth, setColMinWidth] = useState<number>(180);
  const [leftOpen, setLeftOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const observersRef = useRef<Record<string, ResizeObserver | null>>({});
  const [visibleRange, setVisibleRange] = useState<{top: number; bottom: number}>({ top: 0, bottom: 0 });
  const rafRef = useRef<number | null>(null);
  const [heatEnabled, setHeatEnabled] = useState(false);
  const [hudEnabled, setHudEnabled] = useState(false);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ last: performance.now(), frames: 0 });

  const dates = useMemo(() => Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(startDate); d.setDate(startDate.getDate()+i); return d;
  }), [startDate, daysToShow]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const start = gridStartHour * 60;
    const end = gridEndHour * 60;
    for (let m = start; m < end; m += slotMinutes) {
      const h = Math.floor(m / 60); const mi = m % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`);
    }
    return slots;
  }, [slotMinutes]);

  const toggleSelect = (todo: Todo) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = String(todo.id);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const onGroupDrop = async (leader: Todo, deltaMinutes: number, deltaDays: number) => {
    const tasks = Array.from(selectedIds).filter(id => id !== String(leader.id));
    if (tasks.length === 0) return;
    const pad = (n:number) => String(n).padStart(2,'0');
    const toHM = (m:number) => `${pad(Math.floor(m/60))}:${pad(m%60)}`;
    const minStart = gridStartHour*60; const maxEnd = gridEndHour*60;
    const updates: Promise<any>[] = [];
    for (const idStr of tasks) {
      const todoX = todos.find(t => String(t.id) === idStr);
      if (!todoX || !todoX.startTime || !todoX.endTime) continue;
      const d = parseLocalDate(todoX.dueDate);
      if (deltaDays) d.setDate(d.getDate() + deltaDays);
      const due = formatLocalDate(d);
      const s0 = timeToMinutes(todoX.startTime) + deltaMinutes;
      const e0 = timeToMinutes(todoX.endTime) + deltaMinutes;
      let ns = Math.max(minStart, Math.min(s0, maxEnd));
      let ne = Math.max(minStart, Math.min(e0, maxEnd));
      if (ne <= ns) ne = Math.min(maxEnd, ns + (timeToMinutes(todoX.endTime) - timeToMinutes(todoX.startTime)));
      updates.push(useTodoStore.getState().updateTodo(todoX.id, { dueDate: due, startTime: toHM(ns), endTime: toHM(ne) }));
    }
    await Promise.allSettled(updates);
  };

  const getOffsetToScroll = (el: HTMLElement | null): number => {
    if (!el) return 0;
    let o = 0;
    let node: HTMLElement | null = el;
    const root = scrollRef.current as HTMLElement | null;
    while (node && node !== root) {
      o += node.offsetTop || 0;
      node = node.offsetParent as HTMLElement | null;
    }
    return o;
  };

  // Compute px per rem once
  const pxPerRem = useMemo(() => {
    if (typeof window === 'undefined') return 16;
    const fs = getComputedStyle(document.documentElement).fontSize;
    const v = parseFloat(fs || '16');
    return isNaN(v) ? 16 : v;
  }, []);

  // HUD FPS loop
  useEffect(() => {
    if (!hudEnabled) return;
    let raf: number;
    const loop = () => {
      const now = performance.now();
      fpsRef.current.frames += 1;
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hudEnabled]);

  // Track scroll visible range with rAF
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setVisibleRange({ top: el.scrollTop, bottom: el.scrollTop + el.clientHeight });
      });
    };
    handler();
    el.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      el.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Zoom anchor: when changing slotMinutes, keep center minute anchored
  const applySlotMinutes = (m: 15|30|60|120) => {
    const el = scrollRef.current;
    if (!el) { setSlotMinutes(m); return; }
    const centerPx = el.scrollTop + el.clientHeight / 2;
    const pxPerMinuteBefore = remPerMinute * pxPerRem;
    const minutesAtCenter = Math.max(0, Math.min((gridEndHour*60 - gridStartHour*60), (centerPx / pxPerMinuteBefore)) + gridStartHour*60);
    setSlotMinutes(m);
    // next frame adjust scroll
    requestAnimationFrame(() => {
      const pxPerMinuteAfter = (densityHeights[density] / m) * pxPerRem;
      const newCenterPx = (minutesAtCenter - gridStartHour*60) * pxPerMinuteAfter;
      el.scrollTop = Math.max(0, newCenterPx - el.clientHeight / 2);
      // update visible range
      setVisibleRange({ top: el.scrollTop, bottom: el.scrollTop + el.clientHeight });
    });
  };

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('./canvas/gridWorker.ts', import.meta.url), { type: 'module' });
    } catch {
      workerRef.current = null;
    }
    return () => {
      // Unregister all on unmount
      const w = workerRef.current;
      if (w) {
        Object.keys(canvasRefs.current).forEach((id) => {
          w.postMessage({ type: 'unregister', id });
        });
        w.terminate();
      }
    };
  }, []);

  // Helper: draw one day column
  const drawDay = (id: string, date: Date, heat?: number[]) => {
    const dayEl = dayRefs.current[id];
    const canvas = canvasRefs.current[id];
    if (!dayEl || !canvas) return;
    const rect = dayEl.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const gridStart = gridStartHour * 60;
    const gridEnd = gridEndHour * 60;
    const isTodayDate = isToday(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const workStart = 8 * 60; const workEnd = 18 * 60;
    const nowDate = new Date();
    const nowMinutes = isTodayDate ? (nowDate.getHours()*60 + nowDate.getMinutes()) : null;

    const dpr = (window.devicePixelRatio || 1);
    const w = workerRef.current;
    if (w && 'transferControlToOffscreen' in HTMLCanvasElement.prototype) {
      // Ensure registered
      const off = (canvas as any)._offscreen as OffscreenCanvas | undefined;
      if (!off) {
        const offscreen = (canvas as any).transferControlToOffscreen();
        (canvas as any)._offscreen = offscreen;
        w.postMessage({ type: 'register', id, canvas: offscreen, devicePixelRatio: dpr }, [offscreen]);
      }
      w.postMessage({
        type: 'draw', id, width, height, gridStart, gridEnd, slotMinutes,
        isToday: isTodayDate, isWeekend, workStart, workEnd, nowMinutes,
        heat: heatEnabled ? heat : undefined, heatColor: 'rgba(56,189,248,1)'
      });
    } else {
      // Fallback 2D draw on main thread
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = Math.max(1, Math.floor(width * dpr));
      const H = Math.max(1, Math.floor(height * dpr));
      canvas.width = W; canvas.height = H;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (isWeekend) { ctx.fillStyle = 'rgba(30,41,59,0.20)'; ctx.fillRect(0,0,width,height); }
      // Work hours
      const minM = gridStart; const maxM = gridEnd;
      const topM = Math.max(workStart, minM); const botM = Math.min(workEnd, maxM);
      if (botM > topM) {
        const total = maxM - minM;
        const yTop = ((topM - minM) / total) * height;
        const h = ((botM - topM) / total) * height;
        ctx.fillStyle = 'rgba(100,116,139,0.10)'; ctx.fillRect(0, yTop, width, h);
      }
      // Heat overlay per slot
      if (heatEnabled && heat) {
        const totalMinutes = gridEnd - gridStart;
        const slots = Math.floor(totalMinutes / slotMinutes);
        for (let i=0;i<slots;i++) {
          const y1 = (i / slots) * height;
          const y2 = ((i+1) / slots) * height;
          const intensity = Math.max(0, Math.min(1, heat[i] || 0));
          if (intensity <= 0) continue;
          const alpha = 0.22 * intensity;
          ctx.fillStyle = `rgba(56,189,248,${alpha})`;
          ctx.fillRect(0, y1, width, y2 - y1);
        }
      }
      // Grid lines
      const totalMinutes = gridEnd - gridStart;
      const slots = Math.floor(totalMinutes / slotMinutes);
      ctx.strokeStyle = 'rgba(71,85,105,0.30)'; ctx.lineWidth = 1;
      for (let i=0;i<=slots;i++) {
        const y = (i / slots) * height; ctx.beginPath(); ctx.moveTo(0, Math.round(y)+0.5); ctx.lineTo(width, Math.round(y)+0.5); ctx.stroke();
      }
      // Today ring
      if (isTodayDate) { ctx.strokeStyle = 'rgba(99,102,241,0.30)'; ctx.lineWidth = 1; ctx.strokeRect(0.5,0.5,width-1,height-1); }
      // Now line
      if (isTodayDate && nowMinutes != null && nowMinutes >= gridStart && nowMinutes <= gridEnd) {
        const y = ((nowMinutes - gridStart) / (gridEnd - gridStart)) * height;
        ctx.strokeStyle = 'rgba(239,68,68,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, Math.round(y)+0.5); ctx.lineTo(width, Math.round(y)+0.5); ctx.stroke();
        ctx.fillStyle = 'rgba(239,68,68,1)'; ctx.beginPath(); ctx.arc(4, y, 2, 0, Math.PI*2); ctx.fill();
      }
    }
  };

  // Observe size and redraw on deps change
  useEffect(() => {
    dates.forEach((date) => {
      const id = date.toISOString();
      const container = dayRefs.current[id];
      if (!container) return;
      // create observer if missing
      if (!observersRef.current[id]) {
        const ob = new ResizeObserver(() => drawDay(id, date, heatEnabled ? getHeatForDate(date) : undefined));
        ob.observe(container);
        observersRef.current[id] = ob;
      }
      // initial draw
      drawDay(id, date, heatEnabled ? getHeatForDate(date) : undefined);
    });
    // redraw on slotMinutes change or density change
    dates.forEach((date) => drawDay(date.toISOString(), date, heatEnabled ? getHeatForDate(date) : undefined));
    const t = setInterval(() => { dates.forEach((d) => drawDay(d.toISOString(), d, heatEnabled ? getHeatForDate(d) : undefined)); }, 30000);
    return () => { clearInterval(t); };
  }, [dates, slotMinutes, density, heatEnabled]);

  // Build weekday-slot heat arrays from todos
  const heatByWeekday = useMemo(() => {
    const gridStart = gridStartHour * 60; const gridEnd = gridEndHour * 60;
    const slots = Math.floor((gridEnd - gridStart) / slotMinutes);
    const map: number[][] = Array.from({ length: 7 }, () => new Array(slots).fill(0));
    // accumulate counts per weekday, per slot, for todos with times
    for (const t of todos) {
      if (!t.startTime || !t.endTime) continue;
      const [yy,mm,dd] = t.dueDate.split('-').map(Number);
      const d = new Date(yy, (mm||1)-1, dd||1);
      const wd = d.getDay();
      const s = timeToMinutes(t.startTime);
      const e = timeToMinutes(t.endTime);
      const startSlot = Math.max(0, Math.floor((s - gridStart) / slotMinutes));
      const endSlot = Math.min(slots-1, Math.floor((e - gridStart - 1) / slotMinutes));
      for (let i=startSlot; i<=endSlot; i++) map[wd][i] += 1;
    }
    // normalize 0..1 by global max
    let mx = 0; for (let w=0; w<7; w++) for (let i=0;i<slots;i++) mx = Math.max(mx, map[w][i]);
    if (mx <= 0) return map;
    for (let w=0; w<7; w++) for (let i=0;i<slots;i++) map[w][i] = map[w][i] / mx;
    return map;
  }, [todos, slotMinutes]);

  const getHeatForDate = (date: Date): number[] | undefined => {
    return heatEnabled ? heatByWeekday[date.getDay()] : undefined;
  };

  const getTodosForDay = (d: Date) => {
    const key = formatLocalDate(d);
    let list = todos.filter(t => t.dueDate === key);
    if (typeof priorityFilter === 'number') list = list.filter(t => t.priority === priorityFilter);
    const tag = tagFilter.trim().replace(/^#/, '').toLowerCase();
    if (tag) list = list.filter(t => (t.tags||[]).some(x => x.toLowerCase().includes(tag)));
    const q = searchTerm.trim().toLowerCase();
    if (q) list = list.filter(t => t.task.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || (t.tags||[]).some(x => x.toLowerCase().includes(q)));
    return list;
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  type Interval = { todo: Todo; start: number; end: number };
  type Placed = Interval & { left: number; width: number };

  const layoutDay = (items: Todo[]): Placed[] => {
    // map and sort by start
    const intervals: Interval[] = items.map(t => ({ todo: t, start: timeToMinutes(t.startTime!), end: timeToMinutes(t.endTime!) }))
      .sort((a,b) => a.start - b.start || a.end - b.end);

    // cluster connected overlaps
    const placed: Placed[] = [];
    let i = 0;
    while (i < intervals.length) {
      let clusterStart = i;
      let clusterEndMax = intervals[i].end;
      let j = i + 1;
      while (j < intervals.length && intervals[j].start < clusterEndMax) {
        clusterEndMax = Math.max(clusterEndMax, intervals[j].end);
        j++;
      }
      // cluster = [i, j)
      const cluster = intervals.slice(clusterStart, j);
      // assign lanes via interval partitioning
      const laneEnds: number[] = [];
      const laneIndex: number[] = new Array(cluster.length).fill(0);
      for (let k=0; k<cluster.length; k++) {
        const ev = cluster[k];
        let placedLane = -1;
        for (let ln=0; ln<laneEnds.length; ln++) {
          if (laneEnds[ln] <= ev.start) { placedLane = ln; break; }
        }
        if (placedLane === -1) { placedLane = laneEnds.length; laneEnds.push(ev.end); }
        else { laneEnds[placedLane] = ev.end; }
        laneIndex[k] = placedLane;
      }
      const lanes = laneEnds.length;
      for (let k=0; k<cluster.length; k++) {
        const ev = cluster[k];
        placed.push({ ...ev, left: (laneIndex[k] * 100) / lanes, width: 100 / lanes });
      }
      i = j;
    }
    return placed;
  };

  const getDayIndexFromPoint = (x: number, y: number): number | null => {
    for (let i = 0; i < dates.length; i++) {
      const key = dates[i].toISOString();
      const el = dayRefs.current[key];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return i;
    }
    return null;
  };

  return (
    <div className="relative h-full">
    <div ref={scrollRef} className="absolute inset-0 h-full grid grid-cols-[auto_1fr] overflow-y-auto bg-slate-900/50 rounded-xl">
      {/* Gutter */}
      <div className="pr-4 text-right text-sm text-slate-500 sticky left-0 bg-slate-900/50 z-10">
        {timeSlots.map((time, idx) => (
          <div key={time} className="h-10 flex items-start justify-end" style={{ transform: 'translateY(-0.5em)' }}>
            {idx % 2 === 0 && <span>{time}</span>}
          </div>
        ))}
      </div>
      {/* Days */}
      <div className="grid gap-px bg-slate-700/30" style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(${colMinWidth}px, 1fr))` }}>
        {dates.map((date, dayIdx) => {
          const dayTodos = getTodosForDay(date);
          const timed = dayTodos.filter(t => t.startTime && t.endTime);
          const allDay = dayTodos.filter(t => !t.startTime || !t.endTime);
          const placed = layoutDay(timed);
          const dateIso = date.toISOString();
          const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
          const dayNumber = date.getDate();
          const isTodayDate = isToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div key={dateIso} className="relative">
              {/* Header */}
              <div className={`sticky top-0 z-20 text-center py-2 border-b ${isTodayDate ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/80 border-slate-700/50'}`}>
                <div className={`text-xs uppercase ${isTodayDate ? 'text-indigo-300' : 'text-slate-400'}`}>{dayName}</div>
                <div className={`text-lg font-bold ${isTodayDate ? 'text-indigo-400' : 'text-slate-200'}`}>{dayNumber}</div>
              </div>
              {/* All-day row */}
              {allDay.length > 0 && (
                <div className="px-2 py-1 flex flex-wrap gap-1 border-b border-slate-700/40 bg-slate-800/40">
                  {allDay.map(a => (
                    <button key={a.id} onClick={() => setSelected(a)} className="max-w-full truncate px-2 py-0.5 rounded bg-slate-700/50 hover:bg-slate-700/70 text-slate-200 text-xs">
                      <span className={`inline-block h-2 w-2 rounded-full mr-1 align-middle ${a.priority === 2 ? 'bg-red-400' : a.priority === 1 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <span className="align-middle">{a.task}</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Grid */}
              <div
                className="relative select-none"
                style={{ height: `${timeSlots.length * slotHeightRem}rem` }}
                ref={(el) => { dayRefs.current[dateIso] = el; }}
                onDoubleClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const slotHeightPx = rect.height / timeSlots.length;
                  let slotsFromTop = Math.floor(offsetY / slotHeightPx);
                  if (slotsFromTop < 0) slotsFromTop = 0;
                  if (slotsFromTop > timeSlots.length - 1) slotsFromTop = timeSlots.length - 1;
                  const minutesFromStart = slotsFromTop * slotMinutes;
                  const absoluteMinutes = gridStartHour * 60 + minutesFromStart;
                  const sh = Math.floor(absoluteMinutes / 60);
                  const sm = absoluteMinutes % 60;
                  const duration = Math.max(slotMinutes, 60);
                  const endAbs = Math.min(gridEndHour*60, absoluteMinutes + duration);
                  const eh = Math.floor(endAbs / 60);
                  const em = endAbs % 60;
                  const pad = (n:number) => String(n).padStart(2,'0');
                  setInitialDueDate(formatLocalDate(date));
                  setInitialStartTime(`${pad(sh)}:${pad(sm)}`);
                  setInitialEndTime(`${pad(eh)}:${pad(em)}`);
                  setQuickAddOpen(true);
                }}
              >
                {/* Background canvas (Worker or fallback) */}
                <canvas ref={(el) => { canvasRefs.current[dateIso] = el; }} className="absolute inset-0 pointer-events-none z-0" />
                {/* Now line (today only) */}
                {(() => {
                  if (!isTodayDate) return null;
                  const minutes = now.getHours()*60 + now.getMinutes();
                  const start = gridStartHour * 60; const end = gridEndHour * 60;
                  if (minutes < start || minutes > end) return null;
                  const topNow = (minutes - start) * remPerMinute;
                  return (
                    <>
                      {/* kept for accessibility marker; canvas already draws now-line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-transparent z-30" style={{ top: `${topNow}rem` }} />
                    </>
                  );
                })()}

                {/* Events (virtualized) */}
                {(() => {
                  const pxPerMinute = remPerMinute * pxPerRem;
                  const yBase = getOffsetToScroll(dayRefs.current[dateIso] as HTMLElement | null);
                  const topVisible = visibleRange.top - 400; // overscan
                  const bottomVisible = visibleRange.bottom + 400;
                  return placed.map((p, idx) => {
                    const topPx = yBase + (p.start - gridStartHour * 60) * pxPerMinute;
                    const botPx = yBase + (p.end - gridStartHour * 60) * pxPerMinute;
                    if (botPx < topVisible || topPx > bottomVisible) return null;
                    return (
                      <Calendar2Event
                        key={p.todo.id + '-' + idx}
                        todo={p.todo}
                        gridStartHour={gridStartHour}
                        gridEndHour={gridEndHour}
                        parentEl={dayRefs.current[dateIso] || null}
                        leftPercent={p.left}
                        widthPercent={p.width}
                        onOpen={setSelected}
                        remPerMinute={remPerMinute}
                        slotMinutes={slotMinutes}
                        scrollEl={scrollRef.current}
                        dayIndex={dayIdx}
                        getDayIndexFromPoint={getDayIndexFromPoint}
                        daysCount={daysToShow}
                        isSelected={selectedIds.has(String(p.todo.id))}
                        selectedCount={selectedIds.size}
                        onToggleSelect={toggleSelect}
                        onGroupDrop={onGroupDrop}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>
      {/* Left panel toggle */}
      <div className="absolute top-2 left-2 z-40">
        <button onClick={() => setLeftOpen(v => !v)} className={`text-xs px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 backdrop-blur-sm ${leftOpen ? 'text-white bg-indigo-600' : 'text-slate-300 hover:bg-slate-700'}`}>{leftOpen ? 'Đóng bảng tùy chọn' : 'Mở bảng tùy chọn'}</button>
      </div>
    </div>
    <ImprovedAddTodoModal
      isOpen={quickAddOpen}
      onClose={() => setQuickAddOpen(false)}
      initialDueDate={initialDueDate}
      initialStartTime={initialStartTime}
      initialEndTime={initialEndTime}
    />
    <TodoDetailModal todo={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    {leftOpen && (
      <div className="absolute top-0 left-0 h-full w-[320px] bg-slate-900/95 border-r border-slate-700 z-50 p-4 overflow-y-auto rounded-l-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Tùy chọn lịch</h3>
          <button className="text-slate-300 hover:text-white" onClick={() => setLeftOpen(false)}>×</button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-slate-400 mb-1">Zoom</div>
            <div className="flex flex-wrap gap-2">
              {[15,30,60,120].map((m) => (
                <button key={m} onClick={() => applySlotMinutes(m as any)} className={`text-xs px-2 py-0.5 rounded ${slotMinutes===m ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{m}m</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Mật độ</div>
            <div className="flex gap-2">
              {(['compact','cozy','comfortable'] as const).map(d => (
                <button key={d} onClick={() => setDensity(d)} className={`text-xs px-2 py-0.5 rounded ${density===d ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Độ rộng cột</div>
            <select value={colMinWidth} onChange={(e) => setColMinWidth(Number(e.target.value))} className="bg-slate-700 text-slate-200 text-xs rounded px-2 py-1 border border-slate-600">
              {[140,160,180,200,240,280].map(v => <option key={v} value={v}>{v}px</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gợi ý thông minh (Heatmap)</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-600" checked={heatEnabled} onChange={(e) => setHeatEnabled(e.target.checked)} />
              <span className="text-xs">{heatEnabled ? 'Bật' : 'Tắt'}</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">HUD hiệu năng (FPS)</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-600" checked={hudEnabled} onChange={(e) => setHudEnabled(e.target.checked)} />
              <span className="text-xs">{hudEnabled ? `${fps} fps` : 'Tắt'}</span>
            </label>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
