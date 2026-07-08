import React from 'react';
import clsx from 'clsx';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div className={clsx(
        "animate-spin rounded-full border-primary/25 border-t-primary",
        sizes[size]
      )}></div>
    </div>
  );
};
