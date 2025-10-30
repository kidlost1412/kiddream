import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  remove: (id: string) => void;
  clear: () => void;
}

const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id || uid();
    const item: ToastItem = { durationMs: 3500, ...toast, id } as ToastItem;
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (item.durationMs && item.durationMs > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, item.durationMs);
    }
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
