import React, { useMemo, useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Todo } from '../../../types';
import { useTodoStore } from '../../../stores/useTodoStore';
import TodoDetailModal from '../todos/TodoDetailModal';

interface CalendarFullProps {
  startDate: Date;
  daysToShow: number;
  searchTerm?: string;
  priorityFilter?: number | 'all';
  tagFilter?: string;
}

const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

const toHM = (m: number) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

const CalendarFull: React.FC<CalendarFullProps> = ({ startDate, daysToShow, searchTerm = '', priorityFilter = 'all', tagFilter = '' }) => {
  const { todos, updateTodo } = useTodoStore();
  const [selected, setSelected] = useState<Todo | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const calRef = useRef<FullCalendar | null>(null);

  const events = useMemo(() => {
    const tag = tagFilter.trim().replace(/^#/, '').toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    return todos.filter(t => {
      if (typeof priorityFilter === 'number' && t.priority !== priorityFilter) return false;
      if (tag && !(t.tags||[]).some(x => x.toLowerCase().includes(tag))) return false;
      if (q && !(t.task.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || (t.tags||[]).some(x => x.toLowerCase().includes(q)))) return false;
      return true;
    }).map(t => {
      const allDay = !t.startTime || !t.endTime;
      const [yy,mm,dd] = t.dueDate.split('-').map(Number);
      let start: Date;
      let end: Date;
      if (allDay) {
        start = new Date(yy, (mm||1)-1, dd||1, 0, 0, 0);
        end = new Date(yy, (mm||1)-1, dd||1, 23, 59, 59);
      } else {
        const [sh, sm] = (t.startTime||'00:00').split(':').map(Number);
        const [eh, em] = (t.endTime||'00:00').split(':').map(Number);
        start = new Date(yy, (mm||1)-1, dd||1, sh||0, sm||0, 0);
        end = new Date(yy, (mm||1)-1, dd||1, eh||0, em||0, 0);
      }
      return {
        id: String(t.id),
        title: t.task,
        start,
        end,
        allDay,
        extendedProps: { todo: t },
      };
    });
  }, [todos, searchTerm, priorityFilter, tagFilter]);

  useEffect(() => {
    // Adjust view duration when daysToShow changes (custom timeGrid view)
    const api = calRef.current?.getApi?.();
    if (!api) return;
    const viewName = daysToShow === 1 ? 'timeGridDay' : daysToShow >= 7 ? 'timeGridWeek' : 'timeGridWeek';
    if (api.view.type !== viewName) {
      api.changeView(viewName, startDate);
    } else {
      api.gotoDate(startDate);
    }
  }, [daysToShow, startDate]);

  return (
    <div className="relative h-full">
      <div className="absolute top-2 right-2 z-40 flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 backdrop-blur-sm">
        <button onClick={() => setPanelOpen(p => !p)} className={`text-xs px-2 py-0.5 rounded ${panelOpen ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{panelOpen ? 'Đóng panel' : 'Mở panel'}</button>
      </div>
      <FullCalendar
        ref={calRef as any}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={daysToShow === 1 ? 'timeGridDay' : 'timeGridWeek'}
        initialDate={startDate}
        timeZone="local"
        headerToolbar={false}
        height="100%"
        slotMinTime="05:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        nowIndicator={true}
        editable={true}
        eventStartEditable={true}
        eventDurationEditable={true}
        selectable={false}
        events={events}
        eventDidMount={(info) => {
          const t = info.event.extendedProps?.todo as Todo | undefined;
          if (!t) return;
          const el = info.el as HTMLElement;
          const priColor = t.priority === 2 ? '#f87171' : t.priority === 1 ? '#facc15' : '#34d399';
          el.style.borderLeft = `4px solid ${priColor}`;
          el.style.padding = '6px 8px';
          el.style.borderRadius = '8px';
          el.style.overflow = 'hidden';
          // Title emphasis
          const titleEl = el.querySelector('.fc-event-title');
          if (titleEl) {
            (titleEl as HTMLElement).style.fontWeight = '600';
            (titleEl as HTMLElement).style.fontSize = '13px';
          }
          // Higher contrast time
          const timeEl = el.querySelector('.fc-event-time');
          if (timeEl) {
            (timeEl as HTMLElement).style.opacity = '0.9';
          }
        }}
        eventClick={(info) => {
          const t = info.event.extendedProps?.todo as Todo | undefined;
          if (t) setSelected(t);
        }}
        eventDrop={async (info) => {
          const t = info.event.extendedProps?.todo as Todo | undefined;
          if (!t) return;
          const s = info.event.start!; const e = info.event.end!;
          const due = formatDateLocal(s);
          const startTime = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`;
          const endTime = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`;
          await updateTodo(t.id, { dueDate: due, startTime, endTime });
        }}
        eventResize={async (info) => {
          const t = info.event.extendedProps?.todo as Todo | undefined;
          if (!t) return;
          const s = info.event.start!; const e = info.event.end!;
          const due = formatDateLocal(s);
          const startTime = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`;
          const endTime = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`;
          await updateTodo(t.id, { dueDate: due, startTime, endTime });
        }}
      />
      {!panelOpen && (
        <TodoDetailModal todo={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
      )}
      {panelOpen && (
        <div className="absolute top-0 right-0 h-full w-[360px] bg-slate-900/95 border-l border-slate-700 z-50 p-4 overflow-y-auto rounded-r-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">Chi tiết công việc</h3>
            <button className="text-slate-300 hover:text-white" onClick={() => setPanelOpen(false)}>×</button>
          </div>
          {!selected && <div className="text-slate-500 text-sm">Chọn một công việc để xem chi tiết.</div>}
          {selected && (
            <div className="space-y-2 text-sm text-slate-300">
              <div className="text-base font-bold text-white">{selected.task}</div>
              <div className="text-slate-400">{selected.startTime} – {selected.endTime} • {selected.dueDate}</div>
              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">{selected.tags.slice(0,6).map((tg,i)=>(<span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">#{tg}</span>))}</div>
              )}
              {selected.description && <p className="leading-relaxed whitespace-pre-wrap">{selected.description}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarFull;
