import { create } from 'zustand';
import type { Habit } from '../types';
import { supabase } from '../lib/supabaseClient';

interface HabitState {
  habits: Habit[];
  fetchHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string, isCompleted: boolean) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  fetchHabits: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_logs ( completed_at )
      `)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error fetching habits:', error);
    } else {
      // Map the data to our client-side Habit type
      const mappedHabits: Habit[] = data.map(h => {
        const completions = h.habit_logs.reduce((acc, log) => {
          acc[log.completed_at] = true;
          return acc;
        }, {} as { [date: string]: boolean });

        // Calculate streak: consecutive days from today backwards
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];

          if (completions[dateStr]) {
            streak++;
          } else if (i > 0) {
            // Stop if we hit a day without completion (but allow today to be incomplete)
            break;
          }
        }

        // Calculate completion rate: % of last 30 days
        let completedDays = 0;
        const daysToCheck = 30;
        for (let i = 0; i < daysToCheck; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          if (completions[dateStr]) completedDays++;
        }
        const completionRate = Math.round((completedDays / daysToCheck) * 100);

        return {
          id: h.id,
          name: h.name,
          icon: h.icon,
          category: h.category as any,
          goal: h.goal,
          completions,
          streak,
          completionRate,
        };
      });
      set({ habits: mappedHabits });
    }
  },
  toggleHabitCompletion: async (habitId, date, isCompleted) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (isCompleted) {
      // It's currently completed, so we need to delete the log
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, completed_at: date, user_id: session.user.id });
      if (error) console.error("Error deleting habit log", error);

    } else {
      // It's not completed, so we need to insert a log
      const { error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, completed_at: date, user_id: session.user.id });
      if (error) console.error("Error inserting habit log", error);
    }
    
    // Refetch habits to get the latest state. A more optimized approach
    // would be to update the state locally, but refetching is simpler and more robust.
    get().fetchHabits();
  },
}));
