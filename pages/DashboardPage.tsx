import React from 'react';
import Card from '../components/ui/Card';
import { useTodoStore } from '../stores/useTodoStore';
import { useHabitStore } from '../stores/useHabitStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';
import ProductivityChart from '../components/features/dashboard/ProductivityChart';
import AgendaItem from '../components/features/dashboard/AgendaItem';

const StatCard = ({ icon, value, label, color }: { icon: string, value: string | number, label: string, color: string }) => (
  <Card className="flex items-center p-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { todos } = useTodoStore();
  const { habits } = useHabitStore();
  const { t } = useTranslation();
  
  const today = new Date().toISOString().split('T')[0];
  
  type AgendaItem = {
    id: string;
    task?: string;
    name?: string;
    icon?: string;
    isCompleted: boolean;
    type?: 'habit';
    startTime?: string;
  };
  
  const todaysAgenda: AgendaItem[] = [
    ...todos.filter(t => t.dueDate === today),
    ...habits.map(h => ({ task: h.name, icon: h.icon, isCompleted: h.completions[today] || false, id: h.id, type: 'habit' as const }))
  ].sort((a, b) => {
    const timeA = ('startTime' in a && a.startTime) ? a.startTime.replace(':', '') : '2359';
    const timeB = ('startTime' in b && b.startTime) ? b.startTime.replace(':', '') : '2359';
    return parseInt(timeA) - parseInt(timeB);
  });

  const overallHabitCompletion = Math.round(
    habits.reduce((acc, h) => acc + h.completionRate, 0) / (habits.length || 1)
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">{t('dashboard.title', { username: user?.username || 'bạn' })}</h1>
        <p className="text-slate-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="🎯" value={`${todos.filter(t => t.isCompleted && t.dueDate === today).length}/${todos.filter(t => t.dueDate === today).length}`} label={t('dashboard.tasksCompletedToday')} color="bg-indigo-500/20" />
        <StatCard icon="📈" value={`${overallHabitCompletion}%`} label={t('dashboard.habitSuccessRate')} color="bg-green-500/20" />
        <StatCard icon="💰" value={user?.points || 0} label={t('dashboard.rewardPoints')} color="bg-amber-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title={t('dashboard.weeklyProductivity')}>
            <ProductivityChart />
          </Card>
        </div>
        <div>
          <Card title={t('dashboard.todaysAgenda')}>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {todaysAgenda.length > 0 ? (
                todaysAgenda.map((item, index) => <AgendaItem key={`${item.id}-${index}`} item={item} />)
              ) : (
                <p className="text-slate-400 text-center py-4">{t('dashboard.noAgenda')}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
