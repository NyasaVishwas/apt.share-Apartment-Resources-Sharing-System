import React from 'react';

const badgeVariants = {
  default: 'bg-surface-sunken text-ink-secondary border-border font-mono',
  primary: 'bg-amber/10 text-ink border-amber/40 font-mono font-semibold',
  amber: 'bg-amber/10 text-ink border-amber/40 font-mono font-semibold',
  success: 'bg-teal/10 text-teal border-teal/40 font-mono font-semibold',
  teal: 'bg-teal/10 text-teal border-teal/40 font-mono font-semibold',
  warning: 'bg-amber/15 text-ink border-amber/50 font-mono font-semibold',
  danger: 'bg-danger/10 text-danger border-danger/40 font-mono font-semibold',
};

export const Badge = ({ children, variant = 'default', className = '', stamp = false }) => {
  if (stamp) {
    const stampClass = (variant === 'success' || variant === 'teal')
      ? 'stamp-badge stamp-badge-teal'
      : variant === 'danger'
      ? 'stamp-badge stamp-badge-danger'
      : 'stamp-badge stamp-badge-amber';
    return (
      <span className={`${stampClass} ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono tracking-tight uppercase border rounded-md ${badgeVariants[variant] || badgeVariants.default} ${className}`}
    >
      {children}
    </span>
  );
};
