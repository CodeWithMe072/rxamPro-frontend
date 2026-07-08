import React from 'react';
import clsx from 'clsx';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'solid', // 'solid' | 'outline' | 'gradient' | 'ghost' | 'danger'
  size = 'md',      // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-button rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    solid: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/10',
    outline: 'border border-outline text-on-background hover:bg-surface-container/50',
    gradient: 'btn-primary-gradient text-on-primary shadow-lg shadow-primary/10',
    ghost: 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary dark:hover:text-primary-fixed',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-md shadow-error/10'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs h-9',
    md: 'px-6 py-2.5 text-sm h-11',
    lg: 'px-8 py-4 text-base h-14'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
