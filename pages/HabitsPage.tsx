import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { useHabitStore } from '../stores/useHabitStore';
import { useTranslation } from '../hooks/useTranslation';
import HabitCard from '../components/features/habits/HabitCard';
import HabitStats from '../components/features/habits/HabitStats';
import AddHabitModal from '../components/features/habits/AddHabitModal';

const HabitsPage: React.FC = () => {
    const { habits } = useHabitStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="animate-fade-in p-6 md:p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">{t('habits.title')}</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    {t('habits.newHabit')}
                </Button>
            </div>
            
            <HabitStats habits={habits} />
            
            <div className="mt-8">
                 <h3 className="text-xl font-bold text-slate-200 mb-4">{t('habits.myHabits')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {habits.map(habit => (
                        <HabitCard key={habit.id} habit={habit} />
                     ))}
                </div>
            </div>
            <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HabitsPage;
