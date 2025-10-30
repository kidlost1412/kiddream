import React, { useMemo } from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';

const ProductivityChart: React.FC = () => {
  const { todos } = useTodoStore();

  const weeklyData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const completedTasks = todos.filter(
        t => t.dueDate === dateString && t.isCompleted
      ).length;
      
      data.push({ day: dayName, tasks: completedTasks, date: dateString });
    }
    
    return data;
  }, [todos]);

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks), 1);

  return (
    <div className="h-64 flex items-end justify-between space-x-2 md:space-x-4 p-4 bg-slate-900/50 rounded-lg">
      {weeklyData.map((data, index) => {
        const barHeight = (data.tasks / maxTasks) * 100;
        const isToday = new Date().getDay() === index;
        return (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full rounded-t-md transition-all duration-500 ease-out group relative"
              style={{ height: `${barHeight}%` }}
            >
               <div className={`w-full h-full rounded-t-md ${isToday ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-indigo-600 group-hover:to-purple-600'}`}></div>
               <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-950 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {data.tasks}
               </span>
            </div>
            <span className="text-sm font-semibold text-slate-400">{data.day}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ProductivityChart;
