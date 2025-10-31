import React from 'react';
import Card from '../components/ui/Card';
import { useTodoStore } from '../stores/useTodoStore';
import { useHabitStore } from '../stores/useHabitStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';
import ProductivityChart from '../components/features/dashboard/ProductivityChart';
import AgendaItem from '../components/features/dashboard/AgendaItem';
import { AnimatedPage, StaggerContainer, AnimatedItem } from '../components/AnimatedPage';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}) => (
  <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
    <Card className="flex items-center p-4 cursor-pointer">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </Card>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { todos } = useTodoStore();
  const { habits } = useHabitStore();
  const { t } = useTranslation();

  const today = React.useMemo(() => new Date().toISOString().split('T')[0], []);

  type AgendaItemType = {
    id: string;
    task?: string;
    name?: string;
    icon?: string;
    isCompleted: boolean;
    type?: 'habit';
    startTime?: string;
  };

  const todaysAgenda: AgendaItemType[] = React.useMemo(() => [
    ...todos.filter(t => t.dueDate === today),
    ...habits.map(h => ({
      task: h.name,
      icon: h.icon,
      isCompleted: h.completions[today] || false,
      id: h.id,
      type: 'habit' as const,
    })),
  ].sort((a, b) => {
    const timeA = 'startTime' in a && a.startTime ? a.startTime.replace(':', '') : '2359';
    const timeB = 'startTime' in b && b.startTime ? b.startTime.replace(':', '') : '2359';
    return parseInt(timeA) - parseInt(timeB);
  }), [todos, habits, today]);

  const overallHabitCompletion = React.useMemo(() =>
    Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / (habits.length || 1)),
    [habits]
  );

  return (
    <AnimatedPage className="p-6 md:p-8 lg:p-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-white">
          {t('dashboard.title', { username: user?.username || 'bạn' })}
        </h1>
        <p className="text-slate-400">{t('dashboard.subtitle')}</p>
      </motion.div>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem>
          <StatCard
            icon="🎯"
            value={`${todos.filter(t => t.isCompleted && t.dueDate === today).length}/${todos.filter(t => t.dueDate === today).length}`}
            label={t('dashboard.tasksCompletedToday')}
            color="bg-indigo-500/20"
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon="📈"
            value={`${overallHabitCompletion}%`}
            label={t('dashboard.habitSuccessRate')}
            color="bg-green-500/20"
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon="💰"
            value={user?.points || 0}
            label={t('dashboard.rewardPoints')}
            color="bg-amber-500/20"
          />
        </AnimatedItem>
      </StaggerContainer>

      {/* Charts and Agenda */}
      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnimatedItem className="lg:col-span-2">
          <Card title={t('dashboard.weeklyProductivity')}>
            <ProductivityChart />
          </Card>
        </AnimatedItem>
        <AnimatedItem>
          <Card title={t('dashboard.todaysAgenda')}>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {todaysAgenda.length > 0 ? (
                <StaggerContainer staggerDelay={0.03}>
                  {todaysAgenda.map((item, index) => (
                    <AnimatedItem key={`${item.id}-${index}`}>
                      <AgendaItem item={item} />
                    </AnimatedItem>
                  ))}
                </StaggerContainer>
              ) : (
                <motion.p
                  className="text-slate-400 text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {t('dashboard.noAgenda')}
                </motion.p>
              )}
            </div>
          </Card>
        </AnimatedItem>
      </StaggerContainer>
    </AnimatedPage>
  );
};

export default DashboardPage;
