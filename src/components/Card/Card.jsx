import React from 'react';
import clsx from 'clsx';

export const Card = ({
  children,
  className = '',
  variant = 'glass', // 'glass' | 'solid' | 'outline'
  onClick,
  ...props
}) => {
  const baseStyle = 'rounded-[20px] p-4 sm:p-6 transition-all duration-300';
  
  const variants = {
    glass: 'glass-card',
    solid: 'bg-surface-container dark:bg-surface-container-low border border-outline-variant/20 shadow-sm',
    outline: 'border border-outline-variant/30 bg-transparent'
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        baseStyle,
        variants[variant],
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
