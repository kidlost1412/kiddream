import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;