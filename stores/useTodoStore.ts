import { create } from 'zustand';
import type { Todo } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useToastStore } from './useToastStore';

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
      // FIX: Map from database snake_case (due_date, is_completed) to application camelCase (dueDate, isCompleted)
      const mappedTodos: Todo[] = (data || []).map(todo => ({
        ...todo,
        dueDate: todo.due_date,
        isCompleted: todo.is_completed,
        startTime: todo.start_time ?? undefined,
        endTime: todo.end_time ?? undefined,
        description: todo.description ?? undefined,
        stakes: todo.stakes as any,
        tags: todo.tags ?? undefined,
        color: todo.color ?? undefined,
        completedAt: (todo as any).completed_at ?? undefined,
        projectId: undefined
      }));
      set({ todos: mappedTodos });
    }
  },
  addTodo: async (newTodo) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // FIX: Map from application camelCase to database snake_case for insert
    const { dueDate, startTime, endTime, ...rest } = newTodo;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ 
        ...rest, 
        user_id: session.user.id,
        due_date: dueDate,
        start_time: startTime,
        end_time: endTime,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
      return null;
    } else if (data) {
      // FIX: Map response from snake_case to camelCase before adding to store
      const addedTodo: Todo = {
        ...data,
        dueDate: data.due_date,
        isCompleted: data.is_completed,
        startTime: data.start_time ?? undefined,
        endTime: data.end_time ?? undefined,
        description: data.description ?? undefined,
        stakes: data.stakes as any,
        tags: data.tags ?? undefined,
        color: data.color ?? undefined,
        completedAt: (data as any).completed_at ?? undefined,
        projectId: undefined,
      };
      set((state) => ({ todos: [...state.todos, addedTodo] }));
      return addedTodo;
    }
    return null;
  },
  updateTodo: async (id, changes) => {
    // Prepare payload (camelCase -> snake_case)
    const payload: any = {};
    if (changes.task !== undefined) payload.task = changes.task;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.dueDate !== undefined) payload.due_date = changes.dueDate;
    if (changes.startTime !== undefined) payload.start_time = changes.startTime;
    if (changes.endTime !== undefined) payload.end_time = changes.endTime;
    if (changes.priority !== undefined) payload.priority = changes.priority;
    if (changes.tags !== undefined) payload.tags = changes.tags;
    if (changes.color !== undefined) payload.color = changes.color;
    if (changes.stakes !== undefined) payload.stakes = changes.stakes as any;
    if (changes.isCompleted !== undefined) payload.is_completed = changes.isCompleted;

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
