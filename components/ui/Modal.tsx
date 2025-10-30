/**
 * Enhanced Modal Component with Framer Motion animations
 * Replaces static modals with animated versions
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className={`${sizeClasses[size]} w-full bg-slate-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden pointer-events-auto`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Confirm Dialog Modal
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'info',
}) => {
  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-500',
    info: 'bg-indigo-600 hover:bg-indigo-500',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="p-6">
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 ${variantColors[variant]} text-white rounded-lg transition-all font-semibold`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
