import React from 'react';
import clsx from 'clsx';

export const Skeleton = ({ 
  variant = 'text', // 'text' | 'rect' | 'circle'
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => {
  return (
    <div className={clsx(
      "animate-pulse bg-outline-variant/30 dark:bg-outline-variant/10",
      variant === 'circle' ? 'rounded-full' : 'rounded-lg',
      width,
      height,
      className
    )}></div>
  );
};
export default Skeleton;
