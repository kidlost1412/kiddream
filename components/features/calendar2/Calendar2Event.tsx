import React from 'react';
import { Todo } from '../../../types';
import { useTodoStore } from '../../../stores/useTodoStore';
import { timeToMinutes, formatLocalDate, parseLocalDate } from '../../../utils/dateHelpers';
import { motion } from 'framer-motion';

interface Calendar2EventProps {
  todo: Todo;
  gridStartHour: number;
  gridEndHour: number;
  parentEl: HTMLDivElement | null;
  leftPercent: number;
  widthPercent: number;
  onOpen: (todo: Todo) => void;
  remPerMinute: number;
  slotMinutes: number;
  scrollEl?: HTMLDivElement | null;
  dayIndex: number;
  getDayIndexFromPoint?: (x: number, y: number) => number | null;
  daysCount: number;
  isSelected?: boolean;
  selectedCount?: number;
  onToggleSelect?: (todo: Todo) => void;
  onGroupDrop?: (leader: Todo, deltaMinutes: number, deltaDays: number) => Promise<void> | void;
}

const Calendar2Event: React.FC<Calendar2EventProps> = ({ todo, gridStartHour, gridEndHour, parentEl, leftPercent, widthPercent, onOpen, remPerMinute, slotMinutes, scrollEl, dayIndex, getDayIndexFromPoint, daysCount, isSelected=false, selectedCount=0, onToggleSelect, onGroupDrop }) => {
  const { updateTodo } = useTodoStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const [tempStart, setTempStart] = React.useState<number|null>(null);
  const [tempEnd, setTempEnd] = React.useState<number|null>(null);
  const tempStartRef = React.useRef<number|null>(null);
  const tempEndRef = React.useRef<number|null>(null);
  const dragModeRef = React.useRef<'move'|'resize-start'|'resize-end'|null>(null);
  const startYRef = React.useRef(0);
  const initStartRef = React.useRef(0);
  const initEndRef = React.useRef(0);
  const movedRef = React.useRef(false);
  const lastClientXRef = React.useRef<number>(0);
  const lastClientYRef = React.useRef<number>(0);
  const dragElRef = React.useRef<HTMLDivElement|null>(null);
  const rafIdRef = React.useRef<number | null>(null);
  const pendingStartRef = React.useRef<number | null>(null);
  const pendingEndRef = React.useRef<number | null>(null);
  const autoscrollRafRef = React.useRef<number | null>(null);
  const suppressClickUntilRef = React.useRef<number>(0);

  const scheduleTempUpdate = React.useCallback((ns: number, ne: number) => {
    pendingStartRef.current = ns;
    pendingEndRef.current = ne;
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingStartRef.current != null) setTempStart(pendingStartRef.current);
        if (pendingEndRef.current != null) setTempEnd(pendingEndRef.current);
      });
    }
  }, []);

  if (!todo.startTime || !todo.endTime) return null;
  const startMinutes = timeToMinutes(todo.startTime);
  const endMinutes = timeToMinutes(todo.endTime);
  const startActive = tempStart ?? startMinutes;
  const endActive = tempEnd ?? endMinutes;

  const topRem = (startActive - gridStartHour * 60) * remPerMinute;
  const heightRem = (endActive - startActive) * remPerMinute;

  const totalMinutes = (gridEndHour - gridStartHour) * 60;
  const minDuration = Math.max(slotMinutes, 15);

  const autoDirRef = React.useRef(0);
  const autoLoop = React.useCallback(() => {
    if (!scrollEl) return;
    const dir = autoDirRef.current;
    if (dir === 0) { autoscrollRafRef.current = null; return; }
    scrollEl.scrollBy({ top: dir * 24, behavior: 'auto' });
    autoscrollRafRef.current = requestAnimationFrame(autoLoop);
  }, [scrollEl]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Toggle selection with modifiers without entering drag
    if ((e.ctrlKey || (e as any).metaKey || e.shiftKey) && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(todo);
      return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    dragElRef.current = el;
    el.setPointerCapture(e.pointerId);

    const target = e.target as HTMLElement;
    if (target.closest('[data-handle="start"]')) dragModeRef.current = 'resize-start';
    else if (target.closest('[data-handle="end"]')) dragModeRef.current = 'resize-end';
    else dragModeRef.current = 'move';

    startYRef.current = e.clientY;
    initStartRef.current = startMinutes;
    initEndRef.current = endMinutes;
    setTempStart(startMinutes);
    setTempEnd(endMinutes);
    tempStartRef.current = startMinutes;
    tempEndRef.current = endMinutes;
    setIsDragging(true);
    movedRef.current = false;

    const onMove = (ev: PointerEvent) => {
      if (!dragModeRef.current) return;
      lastClientXRef.current = ev.clientX;
      lastClientYRef.current = ev.clientY;
      const container = parentEl || el.parentElement as HTMLDivElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pxPerMinute = rect.height / totalMinutes;
      const deltaY = ev.clientY - startYRef.current;
      const minutesDeltaRaw = deltaY / pxPerMinute;
      const minutesDelta = Math.round(minutesDeltaRaw / slotMinutes) * slotMinutes;

      if (scrollEl) {
        const srect = scrollEl.getBoundingClientRect();
        const edge = 50;
        autoDirRef.current = ev.clientY < srect.top + edge ? -1 : (ev.clientY > srect.bottom - edge ? 1 : 0);
        if (autoscrollRafRef.current == null && autoDirRef.current !== 0) {
          autoscrollRafRef.current = requestAnimationFrame(autoLoop);
        } else if (autoDirRef.current === 0 && autoscrollRafRef.current != null) {
          cancelAnimationFrame(autoscrollRafRef.current); autoscrollRafRef.current = null;
        }
      }

      if (Math.abs(minutesDelta) > 0) movedRef.current = true;

      if (dragModeRef.current === 'move') {
        let ns = initStartRef.current + minutesDelta;
        let ne = initEndRef.current + minutesDelta;
        const minStart = gridStartHour * 60;
        const maxEnd = gridEndHour * 60;
        const dur = initEndRef.current - initStartRef.current;
        if (ns < minStart) { ns = minStart; ne = ns + dur; }
        if (ne > maxEnd) { ne = maxEnd; ns = ne - dur; }
        scheduleTempUpdate(ns, ne);
        tempStartRef.current = ns; tempEndRef.current = ne;
      } else if (dragModeRef.current === 'resize-start') {
        let ns = initStartRef.current + minutesDelta;
        const minStart = gridStartHour * 60;
        const maxStart = initEndRef.current - minDuration;
        ns = Math.max(minStart, Math.min(ns, maxStart));
        scheduleTempUpdate(ns, tempEndRef.current ?? initEndRef.current); tempStartRef.current = ns;
      } else if (dragModeRef.current === 'resize-end') {
        let ne = initEndRef.current + minutesDelta;
        const maxEnd = gridEndHour * 60;
        const minEnd = initStartRef.current + minDuration;
        ne = Math.max(minEnd, Math.min(ne, maxEnd));
        scheduleTempUpdate(tempStartRef.current ?? initStartRef.current, ne); tempEndRef.current = ne;
      }
    };

    const onUp = async (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      setIsDragging(false);
      const ns = tempStartRef.current; const ne = tempEndRef.current;
      if (rafIdRef.current != null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
      if (autoscrollRafRef.current != null) { cancelAnimationFrame(autoscrollRafRef.current); autoscrollRafRef.current = null; }
      autoDirRef.current = 0;
      let deltaDays = 0;
      const targetIndex = getDayIndexFromPoint?.(lastClientXRef.current, lastClientYRef.current);
      if (typeof targetIndex === 'number') deltaDays = targetIndex - dayIndex;
      else {
        const host = (dragElRef.current?.parentElement as HTMLDivElement) || parentEl || null;
        if (host) {
          const rect = host.getBoundingClientRect();
          const dx = lastClientXRef.current - (rect.left + rect.width/2);
          deltaDays = Math.round(dx / rect.width);
        }
      }
      const minShift = -dayIndex; const maxShift = (daysCount - 1) - dayIndex;
      if (deltaDays < minShift) deltaDays = minShift;
      if (deltaDays > maxShift) deltaDays = maxShift;
      if (ns != null && ne != null && ((ns !== startMinutes || ne !== endMinutes) || deltaDays !== 0)) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const toHM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
        let nextDue = todo.dueDate;
        if (deltaDays !== 0) {
          const d = parseLocalDate(todo.dueDate);
          d.setDate(d.getDate() + deltaDays);
          nextDue = formatLocalDate(d);
        }
        await updateTodo(todo.id, { dueDate: nextDue, startTime: toHM(ns), endTime: toHM(ne) });
        // Group apply for multi-select move only
        if (onGroupDrop && selectedCount > 1 && dragModeRef.current === 'move') {
          const deltaMinutes = ns - initStartRef.current;
          await onGroupDrop(todo, deltaMinutes, deltaDays);
        }
      }
      dragModeRef.current = null;
      setTempStart(null); setTempEnd(null);
      tempStartRef.current = null; tempEndRef.current = null;
      if (movedRef.current) { suppressClickUntilRef.current = Date.now() + 120; }
      setTimeout(() => { movedRef.current = false; }, 0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  };

  const left = `${leftPercent}%`;
  const width = `${widthPercent}%`;
  const colorClasses = todo.isCompleted
    ? 'bg-slate-700/50 border-slate-600/50 text-slate-500'
    : (todo.priority === 2
        ? 'bg-gradient-to-br from-rose-500/25 to-rose-600/10 text-rose-100 border-rose-400/60'
        : todo.priority === 1
          ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-100 border-amber-400/60'
          : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-100 border-emerald-400/60');
  const selectionClasses = isSelected ? 'ring-2 ring-indigo-400/70 shadow-indigo-500/30 z-30' : '';
  const dragClasses = isDragging ? 'shadow-2xl z-40' : '';

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(todo);
      return;
    }
    if (!todo.startTime || !todo.endTime) return;
    const start0 = timeToMinutes(todo.startTime);
    const end0 = timeToMinutes(todo.endTime);
    const slot = slotMinutes;
    const minDur = Math.max(slot, 15);
    const minStart = gridStartHour * 60;
    const maxEnd = gridEndHour * 60;
    const pad = (n:number) => String(n).padStart(2,'0');
    const toHM = (m:number) => `${pad(Math.floor(m/60))}:${pad(m%60)}`;

    let nextStart = start0;
    let nextEnd = end0;
    let nextDue = todo.dueDate;
    let changed = false;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      if (e.shiftKey) {
        // Resize end by one slot
        let ne = end0 + dir*slot;
        ne = Math.max(nextStart + minDur, Math.min(ne, maxEnd));
        if (ne !== end0) { nextEnd = ne; changed = true; }
      } else {
        // Move event by one slot
        let ns = start0 + dir*slot;
        let ne = end0 + dir*slot;
        const dur = end0 - start0;
        if (ns < minStart) { ns = minStart; ne = ns + dur; }
        if (ne > maxEnd) { ne = maxEnd; ns = ne - dur; }
        if (ns !== start0 || ne !== end0) { nextStart = ns; nextEnd = ne; changed = true; }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      const by = e.shiftKey ? 7 : 1;
      const d = parseLocalDate(todo.dueDate);
      d.setDate(d.getDate() + dir*by);
      nextDue = formatLocalDate(d);
      changed = true;
    }

    if (changed) {
      await updateTodo(todo.id, { dueDate: nextDue, startTime: toHM(nextStart), endTime: toHM(nextEnd) });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches || e.touches.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    dragElRef.current = e.currentTarget;
    const target = e.target as HTMLElement;
    if (target.closest('[data-handle="start"]')) {
      dragModeRef.current = 'resize-start';
    } else if (target.closest('[data-handle="end"]')) {
      dragModeRef.current = 'resize-end';
    } else {
      dragModeRef.current = 'move';
    }

    const touchY = e.touches[0].clientY;
    startYRef.current = touchY;
    initStartRef.current = startMinutes;
    initEndRef.current = endMinutes;
    setTempStart(startMinutes);
    setTempEnd(endMinutes);
    tempStartRef.current = startMinutes;
    tempEndRef.current = endMinutes;
    setIsDragging(true);
    movedRef.current = false;

    const handleTouchMove = (ev: TouchEvent) => {
      if (!dragModeRef.current) return;
      const t = ev.touches[0] || ev.changedTouches[0];
      if (!t) return;
      lastClientXRef.current = t.clientX;
      lastClientYRef.current = t.clientY;
      const container = parentEl || (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pxPerMinute = rect.height / totalMinutes;
      const deltaY = t.clientY - startYRef.current;
      const minutesDeltaRaw = deltaY / pxPerMinute;
      const minutesDelta = Math.round(minutesDeltaRaw / slotMinutes) * slotMinutes;

      if (scrollEl) {
        const srect = scrollEl.getBoundingClientRect();
        const edge = 50;
        const dir = t.clientY < srect.top + edge ? -1 : (t.clientY > srect.bottom - edge ? 1 : 0);
        if (dir !== 0) {
          if (autoscrollRafRef.current == null) {
            autoscrollRafRef.current = requestAnimationFrame(() => {
              autoscrollRafRef.current = null;
              scrollEl.scrollBy({ top: dir * 20, behavior: 'auto' });
            });
          }
        }
      }

      if (Math.abs(minutesDelta) > 0) {
        movedRef.current = true;
      }

      if (dragModeRef.current === 'move') {
        let ns = initStartRef.current + minutesDelta;
        let ne = initEndRef.current + minutesDelta;
        const minStart = gridStartHour * 60;
        const maxEnd = gridEndHour * 60;
        const dur = initEndRef.current - initStartRef.current;
        if (ns < minStart) { ns = minStart; ne = ns + dur; }
        if (ne > maxEnd) { ne = maxEnd; ns = ne - dur; }
        scheduleTempUpdate(ns, ne);
        tempStartRef.current = ns; tempEndRef.current = ne;
      } else if (dragModeRef.current === 'resize-start') {
        let ns = initStartRef.current + minutesDelta;
        const minStart = gridStartHour * 60;
        const maxStart = initEndRef.current - minDuration;
        ns = Math.max(minStart, Math.min(ns, maxStart));
        scheduleTempUpdate(ns, tempEndRef.current ?? initEndRef.current); tempStartRef.current = ns;
      } else if (dragModeRef.current === 'resize-end') {
        let ne = initEndRef.current + minutesDelta;
        const maxEnd = gridEndHour * 60;
        const minEnd = initStartRef.current + minDuration;
        ne = Math.max(minEnd, Math.min(ne, maxEnd));
        scheduleTempUpdate(tempStartRef.current ?? initStartRef.current, ne); tempEndRef.current = ne;
      }
    };

    const handleTouchEnd = async () => {
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleTouchEnd as any);
      setIsDragging(false);
      const ns = tempStartRef.current; const ne = tempEndRef.current;
      // compute horizontal day delta
      let deltaDays = 0;
      const ti = getDayIndexFromPoint?.(lastClientXRef.current, lastClientYRef.current);
      if (typeof ti === 'number') {
        deltaDays = ti - dayIndex;
      } else {
        const host = (dragElRef.current?.parentElement as HTMLDivElement) || parentEl || null;
        if (host) {
          const rect = host.getBoundingClientRect();
          const dx = lastClientXRef.current - (rect.left + rect.width/2);
          deltaDays = Math.round(dx / rect.width);
        }
      }
      // clamp to visible days
      const minShift2 = -dayIndex;
      const maxShift2 = (daysCount - 1) - dayIndex;
      if (deltaDays < minShift2) deltaDays = minShift2;
      if (deltaDays > maxShift2) deltaDays = maxShift2;
      if (ns != null && ne != null && ((ns !== startMinutes || ne !== endMinutes) || deltaDays !== 0)) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const toHM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
        let nextDue = todo.dueDate;
        if (deltaDays !== 0) {
          const d = parseLocalDate(todo.dueDate);
          d.setDate(d.getDate() + deltaDays);
          nextDue = formatLocalDate(d);
        }
        await updateTodo(todo.id, { dueDate: nextDue, startTime: toHM(ns), endTime: toHM(ne) });
      }
      dragModeRef.current = null;
      setTempStart(null); setTempEnd(null);
      tempStartRef.current = null; tempEndRef.current = null;
      if (movedRef.current) { suppressClickUntilRef.current = Date.now() + 120; }
      setTimeout(() => { movedRef.current = false; }, 0);
    };

    document.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    document.addEventListener('touchend', handleTouchEnd as any, { passive: false });
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => onOpen(todo)}
      tabIndex={0}
      role="button"
      onClick={(e) => {
        if (!movedRef.current && Date.now() >= suppressClickUntilRef.current) {
          onOpen(todo);
        }
      }}
      data-event-id={String(todo.id)}
      data-draggable-event="1"
      data-selected={isSelected ? 'true' : 'false'}
      className={`absolute z-20 select-none rounded-lg text-xs overflow-hidden p-2.5 border-l-4 transition-shadow ${colorClasses} cursor-move hover:shadow-lg hover:ring-1 hover:ring-white/10 ${selectionClasses} ${dragClasses}`}
      style={{ top: `${topRem}rem`, height: `${heightRem}rem`, left, width, willChange: 'top, height', touchAction: 'none', borderLeftColor: isSelected ? 'rgba(129,140,248,0.9)' : undefined }}
      aria-pressed={isSelected}
    >
      <div className="relative pointer-events-none">
        <div data-handle="start" className="absolute -top-1 left-0 right-0 h-4 cursor-n-resize pointer-events-auto" style={{ background: 'transparent' }} />
        <div data-handle="end" className="absolute -bottom-1 left-0 right-0 h-4 cursor-s-resize pointer-events-auto" style={{ background: 'transparent' }} />
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${todo.priority === 2 ? 'bg-red-400' : todo.priority === 1 ? 'bg-yellow-400' : 'bg-green-400'}`} />
          <p className={`font-semibold truncate text-[13px] tracking-wide ${todo.isCompleted ? 'line-through' : ''}`}>{todo.task}</p>
        </div>
        {(!((endActive - startActive) <= 30)) && (
          <p className={"mt-0.5 text-[11px] opacity-90"}>{todo.startTime} - {todo.endTime}</p>
        )}
      </div>
    </div>
  );
};

export default Calendar2Event;
