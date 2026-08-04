import React from 'react';

const badgeVariants = {
  default: 'bg-bg-elevated text-text-secondary border-border',
  primary: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20'
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
