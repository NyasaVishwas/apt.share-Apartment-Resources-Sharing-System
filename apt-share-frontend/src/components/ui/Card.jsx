import React from 'react';

export const Card = ({ children, className = '', elevated = false, ...props }) => {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 transition-shadow ${
        elevated ? 'shadow-md hover:shadow-lg' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
