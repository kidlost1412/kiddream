import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

// The profile data from our `profiles` table
export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  level: number;
  xp: number;
  points: number;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  user: User | null; // Keep a compatible user object for the UI
}

// Function to map Supabase user and profile to our internal User type
const mapToAppUser = (sbUser: SupabaseUser | undefined, profile: Profile | null): User | null => {
  if (!sbUser || !profile) return null;
  
  // A simple XP formula, this should ideally live in the backend or be more sophisticated
  const xpToNextLevel = Math.floor(100 * Math.pow(1.5, profile.level - 1));

  return {
    id: profile.id,
    email: sbUser.email || '',
    username: profile.username,
    avatarUrl: profile.avatar_url,
    level: profile.level,
    xp: profile.xp,
    xpToNextLevel,
    points: profile.points,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  user: null, // Initially no user
  setSession: (session) => {
    set({ session });
    const { profile } = get();
    set({ user: mapToAppUser(session?.user, profile) });
  },
  setProfile: (profile) => {
    set({ profile });
    const { session } = get();
    set({ user: mapToAppUser(session?.user, profile) });
  },
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },
  signUp: async (email, password, username) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    return { error };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      set({ session: null, profile: null, user: null });
    }
    return { error };
  },
}));
