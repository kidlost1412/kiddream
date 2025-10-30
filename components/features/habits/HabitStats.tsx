
import React from 'react';
import Card from '../../ui/Card';
import type { Habit } from '../../../types';

interface HabitStatsProps {
    habits: Habit[];
}

const StatDisplay = ({ value, label, color }: { value: string | number, label: string, color: string }) => (
    <div className="text-center">
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
)

const HabitStats: React.FC<HabitStatsProps> = ({ habits }) => {
    const totalCompletions = habits.reduce((sum, habit) => sum + Object.keys(habit.completions).length, 0);
    const longestStreak = Math.max(...habits.map(h => h.streak), 0);
    const overallCompletionRate = Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / (habits.length || 1));

    return (
        <Card title="Overall Performance">
            <div className="grid grid-cols-3 divide-x divide-slate-700">
                <StatDisplay value={`${overallCompletionRate}%`} label="Monthly Success" color="text-green-400" />
                <StatDisplay value={longestStreak} label="Longest Streak" color="text-amber-400" />
                <StatDisplay value={totalCompletions} label="Total Completions" color="text-sky-400" />
            </div>
        </Card>
    );
};

export default HabitStats;
