import React from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import { useHabitStore } from '../../../stores/useHabitStore';

const AgendaItem: React.FC<{ item: any }> = ({ item }) => {
  const { toggleTodo } = useTodoStore();
  const { toggleHabitCompletion } = useHabitStore();

  const isHabit = item.type === 'habit';
  const today = new Date().toISOString().split('T')[0];

  const handleToggle = () => {
    if (isHabit) {
      toggleHabitCompletion(item.id, today, item.isCompleted);
    } else {
      toggleTodo(item.id, item.isCompleted);
    }
  };
  
  return (
    <div className="flex items-center p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors">
      <div className="w-12 text-center text-sm font-semibold text-slate-400">
        {isHabit ? (
          <span className="text-lg">{item.icon}</span>
        ) : (
          item.startTime || 'All-day'
        )}
      </div>
      <div className="w-px h-6 bg-slate-700 mx-3"></div>
      <div className="flex-1">
        <p className={`text-slate-200 ${item.isCompleted ? 'line-through text-slate-500' : ''}`}>
          {item.task || item.name}
        </p>
      </div>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.isCompleted}
          onChange={handleToggle}
          className="sr-only"
        />
        <span className={`w-5 h-5 rounded-full flex items-center justify-center bg-slate-900 border-2 border-slate-600 transition-all ${item.isCompleted ? 'bg-green-500 border-green-500' : ''}`}>
          {item.isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </span>
      </label>
    </div>
  );
};

export default AgendaItem;