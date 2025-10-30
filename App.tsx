import React, { useEffect, useState, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { supabase } from './lib/supabaseClient';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';

import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TodosPage from './pages/TodosPage';
import HabitsPage from './pages/HabitsPage';
import QuestsPage from './pages/QuestsPage';
import ShopPage from './pages/ShopPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import DebugPage from './pages/DebugPage';
import { useTodoStore } from './stores/useTodoStore';
import { useHabitStore } from './stores/useHabitStore';
import { useShopStore } from './stores/useShopStore';
import { useQuestStore } from './stores/useQuestStore';

const App: React.FC = () => {
  const { session, setSession, setProfile, profile } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Get fetch functions from stores
  const { fetchTodos } = useTodoStore();
  const { fetchHabits } = useHabitStore();
  const { fetchItems } = useShopStore();
  const { fetchQuests, fetchUserQuests } = useQuestStore();

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data);
          });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data);
          });
      } else {
        setProfile(null);
      }
      if (_event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setProfile]);

  useEffect(() => {
    // Once the user is authenticated, fetch all necessary data for the app.
    if (session) {
      fetchTodos();
      fetchHabits();
      fetchItems();
      fetchQuests();
      fetchUserQuests();
    }
  }, [session, fetchTodos, fetchHabits, fetchItems, fetchQuests, fetchUserQuests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <LoadingSpinner size="xl" variant="spinner" className="mb-4" />
          <p className="text-slate-300 text-lg animate-pulse">Đang khởi động...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
              <LoadingSpinner size="lg" variant="dots" />
            </div>
          }
        >
          <Routes>
            <Route
              path="/login"
              element={!session ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={session && profile ? <MainLayout /> : <Navigate to="/login" />}
            >
              <Route index element={<DashboardPage />} />
              <Route path="todos" element={<TodosPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="quests" element={<QuestsPage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="debug" element={<DebugPage />} />
            </Route>
            <Route path="*" element={<Navigate to={session ? '/' : '/login'} />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
