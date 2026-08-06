import React from 'react';

export const Card = ({ children, className = '', elevated = false, ticket = false, ...props }) => {
  if (ticket) {
    return (
      <div className={`ledger-ticket p-5 ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 transition-all duration-150 ${
        elevated ? 'shadow-md hover:border-ink-secondary/30' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
