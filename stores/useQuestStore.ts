import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  goals: Array<{ description: string; target: number; type?: string }>;
  rewards: { xp: number; points: number };
  background_image: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: 'in_progress' | 'completed';
  progress: number[];
  started_at: string;
  completed_at?: string;
  quest?: Quest;
}

interface QuestState {
  quests: Quest[];
  userQuests: UserQuest[];
  fetchQuests: () => Promise<void>;
  fetchUserQuests: () => Promise<void>;
  startQuest: (questId: string) => Promise<void>;
  updateQuestProgress: (userQuestId: string, progress: number[]) => Promise<void>;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  userQuests: [],
  
  fetchQuests: async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('type', { ascending: false });

    if (error) {
      console.error('Error fetching quests:', error);
    } else {
      const typedQuests: Quest[] = (data || []).map(q => ({
        ...q,
        type: q.type as 'main' | 'side',
        goals: q.goals as any,
        rewards: q.rewards as any,
      }));
      set({ quests: typedQuests });
    }
  },

  fetchUserQuests: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_quests')
      .select(`
        *,
        quest:quests(*)
      `)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching user quests:', error);
    } else {
      const typedUserQuests: UserQuest[] = (data || []).map(uq => ({
        ...uq,
        status: uq.status as 'in_progress' | 'completed',
        progress: uq.progress as any,
        quest: uq.quest ? {
          ...uq.quest,
          type: uq.quest.type as 'main' | 'side',
          goals: uq.quest.goals as any,
          rewards: uq.quest.rewards as any,
        } : undefined,
      }));
      set({ userQuests: typedUserQuests });
    }
  },

  startQuest: async (questId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const quest = get().quests.find(q => q.id === questId);
    if (!quest) return;

    const initialProgress = quest.goals.map(() => 0);

    const { error } = await supabase
      .from('user_quests')
      .insert({
        user_id: session.user.id,
        quest_id: questId,
        status: 'in_progress',
        progress: initialProgress,
      });

    if (error) {
      console.error('Error starting quest:', error);
    } else {
      get().fetchUserQuests();
    }
  },

  updateQuestProgress: async (userQuestId: string, progress: number[]) => {
    const { error } = await supabase
      .from('user_quests')
      .update({ progress })
      .eq('id', userQuestId);

    if (error) {
      console.error('Error updating quest progress:', error);
    } else {
      get().fetchUserQuests();
    }
  },
}));
