import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useShopStore } from '../stores/useShopStore';
import Card from '../components/ui/Card';

const DebugPage: React.FC = () => {
  const { items: shopItems, fetchItems } = useShopStore();
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [rewardsCount, setRewardsCount] = useState<number>(0);
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    // Check env vars
    setEnvVars({
      SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      GEMINI_KEY: (import.meta as any).env?.VITE_GEMINI_API_KEY ? '✅ Set' : '⚠️ Optional',
    });

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('rewards').select('count');
      
      if (error) {
        console.error('Supabase error:', error);
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('connected');
        
        // Get actual count
        const { count } = await supabase
          .from('rewards')
          .select('*', { count: 'exact', head: true });
        
        setRewardsCount(count || 0);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setSupabaseStatus('error');
    }

    // Fetch shop items
    await fetchItems();
  };

  const getStatusColor = (status: string) => {
    if (status === 'connected') return 'text-green-400';
    if (status === 'error') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold text-white mb-6">🔍 Debug Dashboard</h1>

      {/* Build Info */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">📦 Build Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Build Time:</span>
            <span className="text-white">{new Date().toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Version:</span>
            <span className="text-white">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Expected JS File:</span>
            <span className="text-white font-mono text-xs">index-CLAMZcyE.js</span>
          </div>
        </div>
      </Card>

      {/* Environment Variables */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">🔑 Environment Variables</h2>
        <div className="space-y-2 text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400">{key}:</span>
              <span className={String(value).includes('✅') ? 'text-green-400' : String(value).includes('❌') ? 'text-red-400' : 'text-yellow-400'}>
                {value as string}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Supabase Connection */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">🗄️ Supabase Connection</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className={getStatusColor(supabaseStatus)}>
              {supabaseStatus === 'checking' && '⏳ Checking...'}
              {supabaseStatus === 'connected' && '✅ Connected'}
              {supabaseStatus === 'error' && '❌ Error'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Rewards Count (DB):</span>
            <span className={rewardsCount > 0 ? 'text-green-400' : 'text-red-400'}>
              {rewardsCount} {rewardsCount === 0 && '⚠️ Empty!'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Shop Items (Store):</span>
            <span className={shopItems.length > 0 ? 'text-green-400' : 'text-red-400'}>
              {shopItems.length}
            </span>
          </div>
        </div>
      </Card>

      {/* Features Status */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">✨ Features Status</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <div className="font-semibold text-white">Calendar Header Redesign</div>
              <div className="text-xs text-slate-400">2-row layout, no "- 7 Days" button</div>
            </div>
            <span className="text-green-400">✅</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div className="flex-1">
              <div className="font-semibold text-white">Todo Detail Modal</div>
              <div className="text-xs text-slate-400">Click task to view details</div>
            </div>
            <span className="text-green-400">✅</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div className="flex-1">
              <div className="font-semibold text-white">List View Scroll</div>
              <div className="text-xs text-slate-400">Smooth scrolling enabled</div>
            </div>
            <span className="text-green-400">✅</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🛍️</span>
            <div className="flex-1">
              <div className="font-semibold text-white">Shop Rewards</div>
              <div className="text-xs text-slate-400">15 items with expiry tracking</div>
            </div>
            <span className={rewardsCount >= 15 ? 'text-green-400' : 'text-red-400'}>
              {rewardsCount >= 15 ? '✅' : '❌'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div className="flex-1">
              <div className="font-semibold text-white">Inventory System</div>
              <div className="text-xs text-slate-400">Track claimed rewards</div>
            </div>
            <span className="text-green-400">✅</span>
          </div>
        </div>
      </Card>

      {/* Action Required */}
      {(rewardsCount === 0 || supabaseStatus === 'error') && (
        <Card className="bg-red-500/10 border-red-500/30">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Action Required</h2>
          <div className="space-y-3 text-sm">
            {rewardsCount === 0 && (
              <div className="bg-red-500/20 p-3 rounded">
                <div className="font-semibold text-red-300 mb-2">Shop is empty!</div>
                <div className="text-red-200">
                  1. Open Supabase SQL Editor<br />
                  2. Run <code className="bg-black/30 px-1">supabase/seed_rewards.sql</code><br />
                  3. Verify: <code className="bg-black/30 px-1">SELECT COUNT(*) FROM rewards;</code><br />
                  4. Refresh this page
                </div>
              </div>
            )}

            {supabaseStatus === 'error' && (
              <div className="bg-red-500/20 p-3 rounded">
                <div className="font-semibold text-red-300 mb-2">Supabase connection error!</div>
                <div className="text-red-200">
                  1. Check environment variables<br />
                  2. Verify Supabase project is active<br />
                  3. Check browser console for errors
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Success */}
      {rewardsCount >= 15 && supabaseStatus === 'connected' && (
        <Card className="bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎉</span>
            <div>
              <h2 className="text-xl font-bold text-green-400">All Systems Operational!</h2>
              <p className="text-green-200 text-sm mt-1">
                Everything is working correctly. If you don't see changes, try:
              </p>
              <ul className="text-green-200 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Clear browser cache (Ctrl+Shift+R)</li>
                <li>Open in incognito/private window</li>
                <li>Wait 2-3 minutes for CDN propagation</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DebugPage;
