import React, { useState, useRef, useEffect } from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import { TodoPriority } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { supabase } from '../../../lib/supabaseClient';
import { useToastStore } from '../../../stores/useToastStore';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDueDate?: string; // 'YYYY-MM-DD'
  initialStartTime?: string; // 'HH:mm'
  initialEndTime?: string;   // 'HH:mm'
}

const ImprovedAddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, initialDueDate, initialStartTime, initialEndTime }) => {
  const { addTodo } = useTodoStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [priority, setPriority] = useState<TodoPriority>(TodoPriority.Medium);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const sanitizeFileName = (name: string) => {
    const parts = name.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
    const base = parts.join('.')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_\. ]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    return (base || 'file') + ext;
  };

  // Apply initial values when opening
  useEffect(() => {
    if (!isOpen) return;
    if (initialDueDate) setDueDate(initialDueDate);
    if (initialStartTime && /^\d{2}:\d{2}$/.test(initialStartTime)) {
      const [h, m] = initialStartTime.split(':');
      setStartHour(h);
      setStartMinute(m);
    }
    if (initialEndTime && /^\d{2}:\d{2}$/.test(initialEndTime)) {
      const [h, m] = initialEndTime.split(':');
      setEndHour(h);
      setEndMinute(m);
    }
  }, [isOpen, initialDueDate, initialStartTime, initialEndTime]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!task.trim()) {
      useToastStore.getState().push({ type: 'warning', message: t('addTask.validations.nameRequired') });
      return;
    }
    
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    
    if (startTime >= endTime) {
      useToastStore.getState().push({ type: 'warning', message: t('addTask.validations.endTimeAfterStart') });
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);

    try {
      const added = await addTodo({
        task: task.trim(),
        description: description.trim() || undefined,
        dueDate,
        startTime,
        endTime,
        priority,
        stakes: { reward: 10, penalty: 5 },
      });
      if (!added) {
        throw new Error('Không thể tạo công việc');
      }
      
      // Upload attachments to Supabase Storage and create records
      if (attachments.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Bạn cần đăng nhập');
        
        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const unique = `${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`;
          const safeName = sanitizeFileName(file.name);
          const path = `${session.user.id}/${added.id}/${unique}_${safeName}`;
          const { error: uploadError } = await supabase
            .storage
            .from('todo-attachments')
            .upload(path, file, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;

          const { error: insertErr } = await (supabase as any)
            .from('todo_attachments')
            .insert({
              todo_id: added.id,
              file_name: file.name,
              file_url: path,
              file_type: file.type,
              file_size: file.size,
            });
          if (insertErr) throw insertErr;

          setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
        }
      }
      
      // Reset form
      setTask('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStartHour('09');
      setStartMinute('00');
      setEndHour('10');
      setEndMinute('00');
      setPriority(TodoPriority.Medium);
      setAttachments([]);
      setUploadProgress(0);
      onClose();
      useToastStore.getState().push({ type: 'success', message: 'Đã tạo công việc thành công.' });
    } catch (error: any) {
      console.error('Error adding todo:', error);
      useToastStore.getState().push({ type: 'error', message: `Không thể thêm công việc: ${error?.message || 'Lỗi không xác định'}` });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('addTask.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Name */}
          <Input
            id="task"
            label={t('addTask.taskName')}
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder={t('addTask.taskPlaceholder')}
            required
            disabled={loading}
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              {t('addTask.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('addTask.descriptionPlaceholder')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 min-h-[80px]"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Due Date */}
          <Input
            id="dueDate"
            label={t('addTask.dueDate')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={loading}
          />

          {/* Time Selection - Improved UX */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('addTask.startTime')}
              </label>
              <div className="flex gap-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                  disabled={loading}
                >
                  {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-2xl text-slate-400 flex items-center">:</span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                  disabled={loading}
                >
                  {minutes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('addTask.endTime')}
              </label>
              <div className="flex gap-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                  disabled={loading}
                >
                  {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-2xl text-slate-400 flex items-center">:</span>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                  disabled={loading}
                >
                  {minutes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
              {t('addTask.priority')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: TodoPriority.Low, label: t('addTask.priorityLow'), color: 'bg-green-500/20 border-green-500 text-green-300' },
                { value: TodoPriority.Medium, label: t('addTask.priorityMedium'), color: 'bg-yellow-500/20 border-yellow-500 text-yellow-300' },
                { value: TodoPriority.High, label: t('addTask.priorityHigh'), color: 'bg-red-500/20 border-red-500 text-red-300' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`py-2 px-4 rounded-lg border-2 font-semibold transition-all ${
                    priority === value ? color : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                  disabled={loading}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('addTask.attachments')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />

            <div
              className="w-full py-3 px-4 bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setAttachments([...attachments, ...Array.from(e.dataTransfer.files)]);
                }
              }}
            >
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {t('addTask.uploadFile')}
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-300 text-sm truncate">{file.name}</span>
                      <span className="text-slate-500 text-xs flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                      {file.type?.startsWith('image/') && (
                        <img src={URL.createObjectURL(file)} alt="preview" className="h-8 w-8 rounded object-cover border border-slate-700 ml-2" />
                      )}
                    </div>
                    <button type="button" onClick={() => removeAttachment(index)} className="text-red-400 hover:text-red-300 ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {loading && attachments.length > 0 && (
              <div className="mt-3">
                <div className="h-2 w-full bg-slate-700 rounded">
                  <div className="h-2 bg-indigo-500 rounded" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Đang tải tệp... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1" disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('addTask.creating') : t('addTask.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImprovedAddTodoModal;
