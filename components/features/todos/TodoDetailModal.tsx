import React, { useState } from 'react';
import { useTodoStore } from '../../../stores/useTodoStore';
import { useTranslation } from '../../../hooks/useTranslation';
import type { Todo } from '../../../types';
import Button from '../../ui/Button';
import { supabase } from '../../../lib/supabaseClient';
import EditTodoModal from './EditTodoModal';
import { useToastStore } from '../../../stores/useToastStore';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatLocalizedDate } from '../../../utils/dateHelpers';

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
}

const TodoDetailModal: React.FC<TodoDetailModalProps> = ({ todo, isOpen, onClose }) => {
  const { toggleTodo, removeTodo, todos } = useTodoStore();
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; file_name: string; file_url: string; file_type: string; file_size: number }>>([]);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>('');
  const liveTodo = React.useMemo(() => todos.find(t => t.id === todo?.id) || todo, [todos, todo?.id]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  React.useEffect(() => {
    const load = async () => {
      if (!todo) return;
      const { data, error } = await (supabase as any)
        .from('todo_attachments')
        .select('id, file_name, file_url, file_type, file_size')
        .eq('todo_id', todo.id)
        .order('uploaded_at', { ascending: false });
      if (!error) setAttachments(data || []);
    };
    if (isOpen) load();
  }, [isOpen, todo?.id]);

  const handleToggle = async () => {
    if (!liveTodo) return;
    await toggleTodo(liveTodo.id, liveTodo.isCompleted);
  };

  const handleDelete = async () => {
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await removeTodo(todo!.id);
      useToastStore.getState().push({ type: 'success', message: 'Đã xóa công việc.' });
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deleting todo:', error);
      useToastStore.getState().push({ type: 'error', message: 'Không thể xóa công việc' });
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['Thấp', 'Trung bình', 'Cao'];
    return labels[priority] || 'Trung bình';
  };

  const getPriorityColor = (priority: number) => {
    const colors = ['text-green-400', 'text-yellow-400', 'text-red-400'];
    return colors[priority] || 'text-yellow-400';
  };

  if (!isOpen || !todo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${liveTodo?.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
              {liveTodo?.task}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm font-semibold ${getPriorityColor(liveTodo?.priority || 1)}`}>
                ● {getPriorityLabel(liveTodo?.priority || 1)}
              </span>
              {liveTodo?.isCompleted && (
                <span className="text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded">
                  ✓ Đã hoàn thành
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Description */}
        {liveTodo?.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Mô tả</h3>
            <p className="text-slate-200 whitespace-pre-wrap">{liveTodo.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Due Date */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Ngày hết hạn
            </div>
            <p className="text-white font-semibold">
              {formatLocalizedDate(liveTodo!.dueDate)}
            </p>
          </div>

          {/* Time */}
          {liveTodo?.startTime && liveTodo?.endTime && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Thời gian
              </div>
              <p className="text-white font-semibold">
                {liveTodo.startTime} - {liveTodo.endTime}
              </p>
            </div>
          )}

          {/* Stakes */}
          {liveTodo?.stakes && (
            <>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Phần thưởng
                </div>
                <p className="text-white font-semibold">+{liveTodo.stakes.reward} điểm</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Phạt
                </div>
                <p className="text-white font-semibold">-{liveTodo.stakes.penalty} điểm</p>
              </div>
            </>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Tệp đính kèm</h3>
            {/* Image previews */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {attachments
                .filter(a => a.file_type?.startsWith('image/'))
                .map(a => {
                  const { data: pub } = supabase.storage.from('todo-attachments').getPublicUrl(a.file_url);
                  return (
                    <button key={a.id} onClick={() => { setViewerUrl(pub.publicUrl); setViewerTitle(a.file_name); }} className="block group text-left">
                      <img src={pub.publicUrl} alt={a.file_name} className="h-32 w-full object-cover rounded-lg border border-slate-700 group-hover:opacity-90" />
                      <div className="mt-1 text-xs text-slate-400 truncate">{a.file_name}</div>
                    </button>
                  );
                })}
            </div>

            {/* Other files */}
            <div className="space-y-2">
              {attachments
                .filter(a => !a.file_type?.startsWith('image/'))
                .map(a => {
                  const { data: pub } = supabase.storage.from('todo-attachments').getPublicUrl(a.file_url);
                  return (
                    <div key={a.id} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                        <span className="text-sm text-slate-200 truncate">{a.file_name}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0">{Math.round(a.file_size/1024)} KB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-indigo-300 hover:text-indigo-200 text-sm"
                          onClick={() => {
                            const url = pub.publicUrl;
                            const lower = (a.file_type || '').toLowerCase();
                            if (lower.includes('pdf') || a.file_name.toLowerCase().endsWith('.pdf')) {
                              setViewerUrl(url);
                              setViewerTitle(a.file_name);
                            } else if (a.file_name.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) {
                              const office = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                              setViewerUrl(office);
                              setViewerTitle(a.file_name);
                            } else {
                              window.open(url, '_blank');
                            }
                          }}
                        >
                          Xem
                        </button>
                        <a href={pub.publicUrl} download className="text-slate-300 hover:text-white text-sm">Tải</a>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Inline Viewer Overlay */}
        {viewerUrl && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setViewerUrl(null)}>
            <div className="relative w-full max-w-5xl h-[80vh] bg-slate-900 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b border-slate-700">
                <div className="text-slate-200 font-semibold truncate pr-4">{viewerTitle}</div>
                <button onClick={() => setViewerUrl(null)} className="text-slate-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              {/* Use iframe/embed depending on type, iframe covers both PDF/Office viewer urls */}
              <iframe title="viewer" src={viewerUrl} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Tags */}
        {liveTodo?.tags && liveTodo.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {liveTodo.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Completed At */}
        {liveTodo?.completedAt && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              ✓ Hoàn thành lúc: {new Date(liveTodo.completedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <Button 
            onClick={handleToggle}
            className="flex-1"
            variant={liveTodo?.isCompleted ? 'secondary' : 'primary'}
          >
            {liveTodo?.isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          </Button>
          <Button 
            onClick={() => setEditing(true)}
            variant="secondary"
            className="bg-slate-600/20 hover:bg-slate-600/30 text-slate-200"
          >
            Chỉnh sửa
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={deleting}
            variant="secondary"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
          >
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
        <EditTodoModal isOpen={editing} onClose={() => setEditing(false)} todo={todo} />
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Xóa công việc"
          description="Bạn có chắc muốn xóa công việc này? Hành động này không thể hoàn tác."
          confirmLabel={deleting ? 'Đang xóa...' : 'Xóa'}
          cancelLabel="Hủy"
          onConfirm={deleting ? () => {} : confirmDelete}
          onCancel={() => !deleting && setConfirmOpen(false)}
        />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TodoDetailModal;
