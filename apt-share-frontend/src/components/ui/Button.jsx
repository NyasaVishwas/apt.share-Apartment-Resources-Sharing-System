import React from 'react';

const variants = {
  primary: 'bg-amber text-ink hover:bg-amber/90 border border-amber/40 shadow-sm font-semibold active:translate-y-[1px]',
  secondary: 'bg-surface-sunken hover:bg-border/50 text-ink border border-border font-medium active:translate-y-[1px]',
  outline: 'border border-border hover:bg-surface-sunken text-ink hover:border-ink-secondary/50 font-medium active:translate-y-[1px]',
  teal: 'bg-teal text-white hover:bg-teal/90 border border-teal/40 shadow-sm font-semibold active:translate-y-[1px]',
  danger: 'bg-danger hover:bg-danger/90 text-white shadow-sm font-semibold active:translate-y-[1px]',
  ghost: 'hover:bg-surface-sunken text-ink-secondary hover:text-ink font-medium'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg'
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
