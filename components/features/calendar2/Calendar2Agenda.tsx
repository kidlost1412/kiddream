import React, { useMemo, useState } from 'react';
import type { Todo } from '../../../types';
import { useTodoStore } from '../../../stores/useTodoStore';
import { useTranslation } from '../../../hooks/useTranslation';
import TodoDetailModal from '../todos/TodoDetailModal';
import ImprovedAddTodoModal from '../todos/ImprovedAddTodoModal';
import { formatLocalDate } from '../../../utils/dateHelpers';

interface Calendar2AgendaProps {
  startDate: Date;
  daysToShow: number;
  searchTerm?: string;
  priorityFilter?: number | 'all';
  tagFilter?: string;
}

const Calendar2Agenda: React.FC<Calendar2AgendaProps> = ({ startDate, daysToShow, searchTerm = '', priorityFilter = 'all', tagFilter = '' }) => {
  const { todos, toggleTodo } = useTodoStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Todo | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [initialDueDate, setInitialDueDate] = useState<string | undefined>(undefined);
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>(undefined);
  const [initialEndTime, setInitialEndTime] = useState<string | undefined>(undefined);

  const dates = useMemo(() => Array.from({ length: daysToShow }, (_, i) => { const d = new Date(startDate); d.setDate(startDate.getDate()+i); return d; }), [startDate, daysToShow]);

  const getTodosForDay = (d: Date) => {
    const key = formatLocalDate(d);
    let list = todos.filter(t => t.dueDate === key);
    if (typeof priorityFilter === 'number') list = list.filter(t => t.priority === priorityFilter);
    const tag = tagFilter.trim().replace(/^#/, '').toLowerCase();
    if (tag) list = list.filter(t => (t.tags||[]).some(x => x.toLowerCase().includes(tag)));
    const q = searchTerm.trim().toLowerCase();
    if (q) list = list.filter(t => t.task.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || (t.tags||[]).some(x => x.toLowerCase().includes(q)));
    // Sort by start time then priority
    return list.slice().sort((a,b) => (a.startTime||'24:00').localeCompare(b.startTime||'24:00') || (b.priority - a.priority));
  };

  return (
    <>
      <div className="space-y-4 p-4 overflow-y-auto h-full bg-slate-900/40 rounded-xl">
        {dates.map(date => {
          const day = getTodosForDay(date);
          const dateLabel = date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={date.toISOString()} className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
              <div className={`px-4 py-2 border-b ${isToday ? 'bg-indigo-500/15 border-indigo-500/40' : 'bg-slate-800/60 border-slate-700/40'}`}> 
                <h3 className={`text-sm font-semibold ${isToday ? 'text-indigo-300' : 'text-slate-300'}`}>{dateLabel}{isToday && <span className="ml-2">({t('calendar.today')})</span>}</h3>
              </div>
              <div className="divide-y divide-slate-700/40">
                {day.length === 0 && (
                  <div className="px-4 py-3 text-slate-500 text-sm italic">Không có công việc nào</div>
                )}
                {day.map(todo => (
                  <div key={todo.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer`} onClick={() => setSelected(todo)} onDoubleClick={() => setSelected(todo)}>
                    <div className={`mt-1 h-3 w-3 rounded-full ${todo.priority === 2 ? 'bg-red-400' : todo.priority === 1 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className={`font-semibold truncate ${todo.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{todo.task}</h4>
                        <div className="shrink-0 text-xs text-slate-400">{todo.startTime && todo.endTime ? `${todo.startTime}–${todo.endTime}` : 'All‑day'}</div>
                      </div>
                      {todo.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{todo.description}</p>}
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {todo.tags.slice(0,3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 text-[11px]">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id, todo.isCompleted); }} className={`ml-2 h-6 w-6 rounded-full border-2 flex items-center justify-center ${todo.isCompleted ? 'bg-green-500 border-green-400' : 'bg-slate-900/50 border-slate-500 hover:border-green-400'}`}>{todo.isCompleted && (<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}</button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-700/40 text-right">
                <button className="text-xs text-indigo-300 hover:text-indigo-200" onClick={() => { const pad = (n:number)=>String(n).padStart(2,'0'); const now = new Date(); setInitialDueDate(formatLocalDate(date)); setInitialStartTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`); setInitialEndTime(`${pad(now.getHours()+1)}:${pad(now.getMinutes())}`); setQuickAddOpen(true); }}>+ Thêm nhanh</button>
              </div>
            </div>
          );
        })}
      </div>
      <ImprovedAddTodoModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} initialDueDate={initialDueDate} initialStartTime={initialStartTime} initialEndTime={initialEndTime} />
      <TodoDetailModal todo={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default Calendar2Agenda;
