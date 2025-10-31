import React, { useState } from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import { TodoPriority } from '../../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useToastStore } from '../../../stores/useToastStore';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose }) => {
  const { addTodo } = useTodoStore();
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<TodoPriority>(TodoPriority.Medium);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!task.trim()) {
      useToastStore.getState().push({ type: 'error', message: 'Tên công việc là bắt buộc' });
      return;
    }

    if (startTime && endTime && startTime >= endTime) {
      useToastStore.getState().push({ type: 'error', message: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
      return;
    }

    setLoading(true);

    try {
      await addTodo({
        task: task.trim(),
        description: description.trim() || undefined,
        dueDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        priority,
        stakes: { reward: 10, penalty: 5 },
      });

      // Reset form
      setTask('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setPriority(TodoPriority.Medium);
      useToastStore.getState().push({ type: 'success', message: 'Đã tạo công việc mới' });
      onClose();
    } catch (error) {
      useToastStore.getState().push({ type: 'error', message: 'Không thể tạo công việc. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="task"
            label="Task"
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What needs to be done?"
            required
            disabled={loading}
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              rows={3}
              disabled={loading}
            />
          </div>

          <Input
            id="dueDate"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startTime"
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              id="endTime"
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TodoPriority)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={TodoPriority.Low}>Low</option>
              <option value={TodoPriority.Medium}>Medium</option>
              <option value={TodoPriority.High}>High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal;
