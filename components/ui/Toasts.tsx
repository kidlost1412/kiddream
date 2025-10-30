import React from 'react';
import { useToastStore } from '../../stores/useToastStore';

const typeStyles: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-500/15',
    border: 'border-green-500/30',
    text: 'text-green-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    )
  },
  error: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    )
  },
  info: {
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    text: 'text-indigo-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    )
  },
  warning: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    )
  }
};

const Toasts: React.FC = () => {
  const { toasts, remove } = useToastStore();
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map(t => {
        const s = typeStyles[t.type] || typeStyles.info;
        return (
          <div key={t.id} className={`pointer-events-auto w-[320px] rounded-xl border px-4 py-3 shadow-lg ${s.bg} ${s.border} backdrop-blur-sm` }>
            <div className="flex items-start gap-3">
              <div className={`${s.text} mt-0.5`}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                {t.title && <div className={`text-sm font-semibold ${s.text}`}>{t.title}</div>}
                <div className="text-sm text-slate-200 truncate whitespace-pre-wrap">{t.message}</div>
              </div>
              <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Toasts;
