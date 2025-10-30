/**
 * Loading Spinner Component
 * Beautiful, animated loading indicators
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'spinner') {
    return (
      <div className={`inline-block ${className}`}>
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent`}
        ></div>
      </div>
    );
  }

  if (variant === 'dots') {
    const dotSize = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={`${dotSize[size]} rounded-full bg-indigo-500`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-indigo-500 ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
    );
  }

  if (variant === 'bars') {
    const barHeight = {
      sm: 'h-3',
      md: 'h-6',
      lg: 'h-10',
      xl: 'h-14',
    };

    return (
      <div className={`flex items-end gap-1 ${className}`}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className={`w-1 ${barHeight[size]} bg-indigo-500 rounded-full`}
            animate={{
              scaleY: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

/**
 * Full-screen loading overlay
 */
interface LoadingOverlayProps {
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Đang tải...',
  variant = 'spinner',
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-xl p-8 shadow-2xl text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LoadingSpinner size="lg" variant={variant} className="mx-auto mb-4" />
        {message && <p className="text-slate-300 text-lg">{message}</p>}
      </motion.div>
    </motion.div>
  );
};

/**
 * Inline loading state
 */
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Đang tải...',
  size = 'sm',
}) => {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} variant="dots" />
      <span className="text-slate-400 text-sm">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
