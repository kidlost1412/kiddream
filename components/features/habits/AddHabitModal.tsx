import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useHabitStore } from '../../../stores/useHabitStore';
import { useTranslation } from '../../../hooks/useTranslation';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['Mind', 'Body', 'Spirit', 'Productivity'] as const;
const iconOptions = ['🧠', '💪', '🧘', '📚', '🏃', '💧', '🍎', '😴', '✍️', '🎯'];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const { fetchHabits } = useHabitStore();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [category, setCategory] = useState<typeof categories[number]>('Productivity');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert(t('habits.createModal.validations.nameRequired'));
      return;
    }
    
    if (!goal.trim()) {
      alert(t('habits.createModal.validations.goalRequired'));
      return;
    }
    
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert(t('errors.unauthorized'));
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('habits')
        .insert([{
          user_id: session.user.id,
          name: name.trim(),
          icon,
          category,
          goal: goal.trim(),
        }]);

      if (error) throw error;

      // Refresh habits list
      await fetchHabits();
      
      // Reset form
      setName('');
      setIcon('🎯');
      setCategory('Productivity');
      setGoal('');
      onClose();
    } catch (error) {
      console.error('Error adding habit:', error);
      alert(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('habits.createModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label={t('habits.createModal.name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('habits.createModal.namePlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('habits.createModal.chooseIcon')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    icon === emoji
                      ? 'bg-indigo-500 scale-110'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              {t('habits.createModal.category')}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof categories[number])}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            id="goal"
            label={t('habits.createModal.goal')}
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={t('habits.createModal.goalPlaceholder')}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('habits.createModal.creating') : t('habits.createModal.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
