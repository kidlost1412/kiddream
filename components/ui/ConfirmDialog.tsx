import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Xác nhận',
  description = 'Bạn có chắc chắn?',
  confirmLabel = 'Đồng ý',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-slate-800 border border-slate-700 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold text-white mb-2">{title}</div>
        <div className="text-sm text-slate-300 mb-5 whitespace-pre-wrap">{description}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
