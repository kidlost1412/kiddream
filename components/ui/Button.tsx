import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-100';

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40',
    secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/30 hover:shadow-red-500/40',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;