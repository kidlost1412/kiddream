import React from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import { Todo, TodoPriority } from '../../../types';
import Button from '../../ui/Button';

const priorityConfig = {
    [TodoPriority.High]: { label: 'High', color: 'bg-red-500/80', icon: 'M12 19V5m-7 7l7-7 7 7' },
    [TodoPriority.Medium]: { label: 'Medium', color: 'bg-yellow-500/80', icon: 'M5 12h14' },
    [TodoPriority.Low]: { label: 'Low', color: 'bg-green-500/80', icon: 'M12 5v14m-7-7l7 7 7-7' },
};

const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    const { toggleTodo, removeTodo } = useTodoStore();
    return (
        <div className="flex items-center p-3 bg-slate-800/70 rounded-lg hover:bg-slate-700/60 transition-colors group">
            <label className="flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={todo.isCompleted} 
                    onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                    className="sr-only"
                />
                <span className={`w-6 h-6 rounded-md flex items-center justify-center bg-slate-900 border-2 border-slate-700 transition-all duration-200 ${todo.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'group-hover:border-indigo-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-white transition-transform duration-300 ease-in-out ${todo.isCompleted ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </span>
            </label>
            
            <div className="ml-4 flex-1">
                <p className={`text-slate-100 transition-all ${todo.isCompleted ? 'line-through text-slate-500' : ''}`}>{todo.task}</p>
                <p className="text-xs text-slate-400">Due: {new Date(todo.dueDate).toLocaleDateString()}</p>
            </div>

            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${priorityConfig[todo.priority].color}`}>
                {priorityConfig[todo.priority].label}
            </div>

            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => removeTodo(todo.id)} className="hover:bg-red-500/20 hover:text-red-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </Button>
            </div>
        </div>
    );
}

export default TodoItem;