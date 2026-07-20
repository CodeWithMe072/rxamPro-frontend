import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = ' ',
  className = '',
  inputClassName = '',
  id,
  icon: Icon,
  rightElement,
  floating = true,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("w-full flex flex-col", className)}>
      <div className={clsx("relative w-full input-group", floating ? "mt-4" : "")}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          placeholder={floating ? ' ' : placeholder}
          className={clsx(
            "input-field w-full h-12 bg-surface-container-low dark:bg-surface-dim border rounded-xl font-body text-base text-on-surface placeholder:text-outline transition-all duration-200 focus:border-primary focus:bg-surface-container-lowest outline-none focus:outline-none",
            Icon ? "pl-11" : "px-4",
            rightElement ? "pr-11" : "pr-4",
            error ? "border-error focus:border-error focus:ring-error" : "border-outline-variant/50 focus:border-primary",
            inputClassName
          )}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              "font-body pointer-events-none transition-all duration-200 text-on-surface-variant",
              floating
                ? "absolute left-4 top-3 origin-[0]"
                : "block mb-2 text-sm font-bold text-on-surface"
            )}
          >
            {label}
          </label>
        )}

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <span className="text-xs font-bold text-error mt-1 ml-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
});

export const Textarea = React.forwardRef(({
  label,
  error,
  placeholder = ' ',
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("w-full flex flex-col mt-4", className)}>
      <div className="relative w-full input-group">
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          placeholder=" "
          className={clsx(
            "input-field w-full px-4 py-3 bg-surface-container-low dark:bg-surface-dim border rounded-xl font-body text-base text-on-surface placeholder:text-outline transition-all duration-200 focus:border-primary focus:bg-surface-container-lowest resize-y outline-none focus:outline-none",
            error ? "border-error focus:border-error" : "border-outline-variant/50 focus:border-primary"
          )}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className="font-body pointer-events-none absolute left-4 top-3 text-on-surface-variant origin-[0] transition-all duration-200"
          >
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <span className="text-xs font-bold text-error mt-1 ml-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
});
