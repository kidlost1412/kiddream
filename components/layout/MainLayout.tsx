import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIAssistantSidebar from './AIAssistantSidebar';
import { useUIStore } from '../../stores/useUIStore';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../stores/useAuthStore';
import Toasts from '../ui/Toasts';

const MainLayout: React.FC = () => {
  const { isAIAssistantOpen } = useUIStore();
  const { session, setProfile } = useAuthStore();

  useEffect(() => {
    if (!session) return;

    // Set up a real-time subscription to the user's profile
    const channel = supabase
      .channel(`public:profiles:id=eq.${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => {
          console.log('Profile update received!', payload.new);
          setProfile(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, setProfile]);


  return (
    <div className="flex h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <AIAssistantSidebar isOpen={isAIAssistantOpen} />
        </main>
        <Toasts />
      </div>
    </div>
  );
};

export default MainLayout;
