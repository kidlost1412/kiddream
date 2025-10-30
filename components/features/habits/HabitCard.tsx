import React from 'react';
import { Habit } from '../../../types';
import Card from '../../ui/Card';
import { useHabitStore } from '../../../stores/useHabitStore';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const categoryStyles = {
    'Mind': 'bg-purple-500/20 text-purple-300',
    'Body': 'bg-green-500/20 text-green-300',
    'Spirit': 'bg-sky-500/20 text-sky-300',
    'Productivity': 'bg-amber-500/20 text-amber-300',
};

const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { toggleHabitCompletion } = useHabitStore();
    const today = new Date();
    const todayIndex = today.getDay();

    const checkAndToggle = (dayIndex: number) => {
        const date = new Date();
        date.setDate(today.getDate() - (todayIndex - dayIndex));
        const dateString = date.toISOString().split('T')[0];
        const isCompleted = !!habit.completions[dateString];
        toggleHabitCompletion(habit.id, dateString, isCompleted);
    };
    
    return (
        <Card className="p-5 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-x-4">
                        <div className="text-4xl">{habit.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">{habit.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryStyles[habit.category]}`}>{habit.category}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-amber-400">{habit.streak} 🔥</span>
                        <p className="text-xs text-slate-400">day streak</p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-md mb-5">
                    <span className="text-sm font-medium text-slate-300">Success Rate</span>
                    <span className="text-sm font-bold text-green-400">{habit.completionRate}%</span>
                </div>
            </div>

            <div>
                 <p className="text-xs font-semibold text-slate-400 mb-2 text-center">This Week</p>
                 <div className="flex justify-around">
                    {weekDays.map((day, index) => {
                         const date = new Date();
                         date.setDate(today.getDate() - (todayIndex - index));
                         const dateString = date.toISOString().split('T')[0];
                         const isCompleted = !!habit.completions[dateString];

                        return (
                        <button 
                            key={index} 
                            onClick={() => checkAndToggle(index)}
                            disabled={index > todayIndex}
                            className={`h-9 w-9 rounded-full font-bold text-sm transition-all duration-200 transform hover:scale-110 disabled:opacity-30 disabled:pointer-events-none
                                ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                                ${index === todayIndex ? 'ring-2 ring-indigo-400' : ''}
                            `}>
                            {day}
                        </button>
                    )})}
                </div>
            </div>
        </Card>
    );
};

export default HabitCard;