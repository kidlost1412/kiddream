import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={`bg-slate-800/60 rounded-xl shadow-lg backdrop-blur-xl border border-slate-700/50 overflow-hidden transition-all duration-300 hover:border-slate-600/80 hover:bg-slate-800/80 animate-fade-in ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-slate-100 tracking-wide">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;