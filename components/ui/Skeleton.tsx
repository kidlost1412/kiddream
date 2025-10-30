/**
 * Skeleton loading component for better UX
 * Shows animated placeholder while content is loading
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-slate-700/50';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton for calendar grid
 */
export const CalendarGridSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <div key={i} className="flex-1 space-y-2">
          <Skeleton height={40} />
          <Skeleton height={200} />
          <Skeleton height={100} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for todo list
 */
export const TodoListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
        <Skeleton variant="circular" width={20} height={20} />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="60%" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for dashboard cards
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-6 bg-slate-800/60 rounded-xl">
          <Skeleton height={48} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Skeleton height={400} />
      </div>
      <div>
        <Skeleton height={400} />
      </div>
    </div>
  </div>
);

export default Skeleton;
