import { create } from 'zustand';
import type { Todo } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useToastStore } from './useToastStore';
import { mapDbTodoToApp, mapAppChangesToDb, mapAppTodoToDbInsert } from '../utils/todoMappers';

interface TodoState {
  todos: Todo[];
  fetchTodos: () => Promise<void>;
  addTodo: (newTodo: Omit<Todo, 'id' | 'isCompleted'>) => Promise<Todo | null>;
  toggleTodo: (id: string, isCompleted: boolean) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, changes: Partial<Omit<Todo, 'id'>>) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  fetchTodos: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true })
      .order('start_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      const mappedTodos = (data || []).map(mapDbTodoToApp);
      set({ todos: mappedTodos });
    }
  },
  addTodo: async (newTodo) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = mapAppTodoToDbInsert(newTodo);
    const { data, error } = await supabase
      .from('todos')
      .insert([{
        ...payload,
        user_id: session.user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
      return null;
    } else if (data) {
      const addedTodo = mapDbTodoToApp(data);
      set((state) => ({ todos: [...state.todos, addedTodo] }));
      return addedTodo;
    }
    return null;
  },
  updateTodo: async (id, changes) => {
    const payload = mapAppChangesToDb(changes);

    // Optimistic UI: apply local change first
    const prev = get().todos;
    const next = prev.map(t => t.id === id ? { ...t, ...changes } : t);
    set({ todos: next });

    const { error } = await supabase.from('todos').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating todo:', error);
      const keys = Object.keys(payload);
      const scheduleOnly = keys.length > 0 && keys.every(k => k === 'start_time' || k === 'end_time' || k === 'due_date');
      if (!scheduleOnly) {
        // Revert for non-schedule edits
        set({ todos: prev });
      }
      useToastStore.getState().push({ type: 'error', message: scheduleOnly ? 'Lịch trình đã thay đổi cục bộ (giờ/ngày). Đồng bộ server thất bại.' : 'Không thể cập nhật công việc.' });
      return;
    }
    // Success toast (silent for small moves to avoid noise)
    // useToastStore.getState().push({ type: 'success', message: 'Đã cập nhật.' });
  },
  toggleTodo: async (id, isCompleted) => {
    const nextCompleted = !isCompleted;
    const completedAt = nextCompleted ? new Date().toISOString() : null;
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: nextCompleted, completed_at: completedAt })
      .eq('id', id);

    if (error) {
      console.error('Error toggling todo:', error);
      useToastStore.getState().push({ type: 'error', message: 'Không thể cập nhật trạng thái.' });
    } else {
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: nextCompleted, completedAt: completedAt || undefined } : todo
        ),
      }));
      useToastStore.getState().push({ type: 'success', message: nextCompleted ? 'Đã đánh dấu hoàn thành.' : 'Đã hủy hoàn thành.' });
    }
  },
  removeTodo: async (id) => {
     const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing todo:', error);
    } else {
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    }
  },
}));
