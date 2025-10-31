import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { useHabitStore } from '../stores/useHabitStore';
import { useTranslation } from '../hooks/useTranslation';
import HabitCard from '../components/features/habits/HabitCard';
import HabitStats from '../components/features/habits/HabitStats';
import AddHabitModal from '../components/features/habits/AddHabitModal';
import { AnimatedPage, StaggerContainer, AnimatedItem } from '../components/AnimatedPage';
import { TodoListSkeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';

const HabitsPage: React.FC = () => {
  const { habits } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <AnimatedPage className="p-6 md:p-8 lg:p-10">
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white">{t('habits.title')}</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t('habits.newHabit')}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HabitStats habits={habits} />
      </motion.div>

      <div className="mt-8">
        <motion.h3
          className="text-xl font-bold text-slate-200 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('habits.myHabits')}
        </motion.h3>
        {habits.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-slate-400 text-lg mb-4">Chưa có thói quen nào</p>
            <Button onClick={() => setIsModalOpen(true)} variant="secondary">
              Tạo thói quen đầu tiên
            </Button>
          </motion.div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {habits.map(habit => (
              <AnimatedItem key={habit.id}>
                <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                  <HabitCard habit={habit} />
                </motion.div>
              </AnimatedItem>
            ))}
          </StaggerContainer>
        )}
      </div>
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AnimatedPage>
  );
};

export default HabitsPage;
