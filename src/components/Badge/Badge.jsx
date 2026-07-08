import React from 'react';
import clsx from 'clsx';

export const Badge = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'error' | 'outline'
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border';
  
  const variants = {
    primary: 'bg-primary-container/20 text-primary border-primary-container/30',
    secondary: 'bg-secondary-container/20 text-secondary border-secondary-container/30',
    tertiary: 'bg-tertiary-container/20 text-tertiary border-tertiary-container/30',
    error: 'bg-error-container/20 text-error border-error-container/30',
    outline: 'border-outline-variant text-on-surface-variant bg-transparent'
  };

  return (
    <span
      className={clsx(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
