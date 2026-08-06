import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-surface border rounded-md text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber transition-all ${
          error ? 'border-danger focus:ring-danger' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-ink-secondary">{helperText}</p>}
    </div>
  );
};
