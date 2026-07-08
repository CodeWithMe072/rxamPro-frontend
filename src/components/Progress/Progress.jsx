import React from 'react';
import clsx from 'clsx';

export const Progress = ({
  value = 0,
  max = 100,
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'error'
  pulse = false,
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
    error: 'bg-error'
  };

  return (
    <div 
      className={clsx("w-full h-2 bg-surface-container dark:bg-surface-container-high rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500 ease-out",
          colors[variant],
          pulse && "progress-pulse"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
export default Progress;
