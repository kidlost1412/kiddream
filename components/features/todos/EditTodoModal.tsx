import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import type { Todo } from '../../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { supabase } from '../../../lib/supabaseClient';
import { useToastStore } from '../../../stores/useToastStore';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({ isOpen, onClose, todo }) => {
  const { updateTodo } = useTodoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [priority, setPriority] = useState(1);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const [existingAttachments, setExistingAttachments] = useState<Array<{ id: string; file_name: string; file_url: string; file_type: string; file_size: number }>>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minutes = ['00', '15', '30', '45'];

  useEffect(() => {
    if (!isOpen || !todo) return;
    setTask(todo.task);
    setDescription(todo.description || '');
    setDueDate(todo.dueDate);
    if (todo.startTime) {
      const [h, m] = todo.startTime.split(':');
      setStartHour(h);
      setStartMinute(m);
    }
    if (todo.endTime) {
      const [h, m] = todo.endTime.split(':');
      setEndHour(h);
      setEndMinute(m);
    }
    setPriority(todo.priority);
    setTags((todo.tags || []).join(', '));

    (async () => {
      const { data } = await (supabase as any)
        .from('todo_attachments')
        .select('id,file_name,file_url,file_type,file_size')
        .eq('todo_id', todo.id)
        .order('uploaded_at', { ascending: false });
      setExistingAttachments(data || []);
    })();
  }, [isOpen, todo?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles([...newFiles, ...Array.from(e.target.files)]);
  };

  const removeNewFile = (index: number) => setNewFiles(newFiles.filter((_, i) => i !== index));

  const removeExisting = async (id: string, path: string) => {
    if (!confirm('Xóa tệp này?')) return;
    setLoading(true);
    try {
      await (supabase as any).from('todo_attachments').delete().eq('id', id);
      await supabase.storage.from('todo-attachments').remove([path]);
      setExistingAttachments(prev => prev.filter(a => a.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo) return;
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    if (startTime && endTime && startTime >= endTime) {
      useToastStore.getState().push({ type: 'warning', message: 'Giờ kết thúc phải sau giờ bắt đầu' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      await updateTodo(todo.id, {
        task: task.trim(),
        description: description.trim() || undefined,
        dueDate,
        startTime,
        endTime,
        priority,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      if (newFiles.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Bạn cần đăng nhập');
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const safeName = sanitizeFileName(file.name);
          const path = `${session.user.id}/${todo.id}/${Date.now()}_${i}_${Math.random().toString(36).slice(2)}_${safeName}`;
          const { error: uploadError } = await supabase.storage.from('todo-attachments').upload(path, file, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;
          const { error: insertErr } = await (supabase as any)
            .from('todo_attachments')
            .insert({ todo_id: todo.id, file_name: file.name, file_url: path, file_type: file.type, file_size: file.size });
          if (insertErr) throw insertErr;
          setUploadProgress(Math.round(((i + 1) / newFiles.length) * 100));
        }
      }

      onClose();
      useToastStore.getState().push({ type: 'success', message: 'Đã cập nhật công việc.' });
    } catch (err) {
      console.error(err);
      useToastStore.getState().push({ type: 'error', message: 'Không thể cập nhật công việc' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Chỉnh sửa công việc</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input id="task" label="Tên công việc" type="text" value={task} onChange={(e) => setTask(e.target.value)} required disabled={loading} />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 min-h-[80px]" />
          </div>
          <Input id="dueDate" label="Ngày hết hạn" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required disabled={loading} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Giờ bắt đầu</label>
              <div className="flex gap-2">
                <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold" disabled={loading}>
                  {hours.map(h => (<option key={h} value={h}>{h}</option>))}
                </select>
                <span className="text-2xl text-slate-400 flex items-center">:</span>
                <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold" disabled={loading}>
                  {minutes.map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Giờ kết thúc</label>
              <div className="flex gap-2">
                <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold" disabled={loading}>
                  {hours.map(h => (<option key={h} value={h}>{h}</option>))}
                </select>
                <span className="text-2xl text-slate-400 flex items-center">:</span>
                <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold" disabled={loading}>
                  {minutes.map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags (phân tách bằng dấu phẩy)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tệp hiện có</label>
              <div className="space-y-2">
                {existingAttachments.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 border border-slate-700/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      <span className="text-sm text-slate-200 truncate">{a.file_name}</span>
                      <span className="text-xs text-slate-500 flex-shrink-0">{Math.round(a.file_size/1024)} KB</span>
                    </div>
                    <button type="button" className="text-red-400 hover:text-red-300 text-sm" onClick={() => removeExisting(a.id, a.file_url)} disabled={loading}>Xóa</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Attachments */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Thêm tệp</label>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-3 px-4 bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all">Tải tệp lên</button>
            {newFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {newFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      <span className="text-slate-300 text-sm truncate">{f.name}</span>
                      <span className="text-slate-500 text-xs flex-shrink-0">({(f.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" className="text-red-400 hover:text-red-300 text-sm" onClick={() => removeNewFile(i)}>Gỡ</button>
                  </div>
                ))}
              </div>
            )}

            {loading && newFiles.length > 0 && (
              <div className="mt-3">
                <div className="h-2 w-full bg-slate-700 rounded"><div className="h-2 bg-indigo-500 rounded" style={{ width: `${uploadProgress}%` }} /></div>
                <p className="text-xs text-slate-400 mt-1">Đang tải tệp... {uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1" disabled={loading}>Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoModal;
