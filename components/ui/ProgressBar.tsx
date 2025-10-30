import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, className }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={`w-full bg-slate-700/50 rounded-full h-3 ${className}`}>
      <div
        className="bg-gradient-to-r from-sky-400 to-cyan-300 h-3 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;